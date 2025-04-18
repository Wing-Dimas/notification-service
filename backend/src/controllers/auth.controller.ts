import { NextFunction, Request, Response } from "express";
import { User } from "@prisma/client";
import { CreateUserDto, LoginUserDto, RefreshTokenDto } from "@dtos/users.dto";
import { RequestWithUser } from "@interfaces/auth.interface";
import AuthService from "@services/auth.service";
import UserService from "@/services/users.service";
import { HttpException } from "@/exceptions/HttpException";

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
      const { findUser, accessToken, refreshToken } =
        await this.authService.login(userData);

      res.status(200).json({
        message: "login",
        status: 200,
        data: {
          id: findUser.id,
          username: findUser.username,
          email: findUser.email,
          access_token: accessToken.token,
          refresh_token: refreshToken.token,
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

  public getNewToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { token }: RefreshTokenDto = req.body;
      const newAccessToken = await this.authService.getNewToken(token);
      res.status(200).json({
        message: "new access token",
        status: 200,
        data: {
          access_token: newAccessToken.token,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
