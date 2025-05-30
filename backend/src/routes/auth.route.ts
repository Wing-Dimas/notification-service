import { Router } from "express";
import AuthController from "@controllers/auth.controller";
import { CreateUserDto, LoginUserDto, RefreshTokenDto } from "@dtos/users.dto";
import { Routes } from "@interfaces/routes.interface";
import authMiddleware from "@middlewares/auth.middleware";
import validationMiddleware from "@middlewares/validation.middleware";

class AuthRoute implements Routes {
  public path = "/api";
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // SIGNUP
    this.router.post(
      `${this.path}/signup`,
      validationMiddleware(CreateUserDto, "body"),
      this.authController.signUp,
    );
    // LOGIN
    this.router.post(
      `${this.path}/login`,
      validationMiddleware(LoginUserDto, "body"),
      this.authController.logIn,
    );
    // LOGOUT
    this.router.post(
      `${this.path}/logout`,
      authMiddleware,
      this.authController.logOut,
    );
    // GENERATE TOKEN
    this.router.post(
      `${this.path}/refresh-token`,
      validationMiddleware(RefreshTokenDto, "body"),
      this.authController.getNewToken,
    );
  }
}

export default AuthRoute;
