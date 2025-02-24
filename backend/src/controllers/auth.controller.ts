import { NextFunction, Request, Response } from "express";
import { User } from "@prisma/client";
import { CreateUserDto, LoginUserDto } from "@dtos/users.dto";
import { RequestWithUser } from "@interfaces/auth.interface";
import AuthService from "@services/auth.service";
import { email } from "envalid";
import UserService from "@/services/users.service";
import { HttpException } from "@/exceptions/HttpException";
import { stat } from "fs";

class AuthController {
  public authService = new AuthService();
  public usersService = new UserService();

  public signUp = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const hasUser = await this.usersService.hasUserRegistered();
      if (hasUser) {
        throw new HttpException(403, "this app only allows one user");
      }
      const userData: CreateUserDto = req.body;
      const signUpUserData: User = await this.authService.signup(userData);

      res.status(201).json({
        data: {
          id: signUpUserData.id,
          username: signUpUserData.username,
          email: signUpUserData.email,
        },
        status: 201,
        message: "signup",
      });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userData: LoginUserDto = req.body;
      const { cookie, findUser, accessToken } = await this.authService.login(
        userData,
      );

      res.setHeader("Set-Cookie", [cookie]);
      res.status(200).json({
        message: "login",
        status: 200,
        data: {
          id: findUser.id,
          username: findUser.username,
          email: findUser.email,
          accessToken: accessToken.token,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userData: User = req.user;
      await this.authService.logout(userData);

      res.setHeader("Set-Cookie", ["Authorization=; Max-age=0"]);
      res.status(200).json({ status: 200, message: "logout" });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
