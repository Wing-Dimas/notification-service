import { Router } from "express";
import UsersController from "@controllers/users.controller";
import { CreateUserDto } from "@dtos/users.dto";
import { Routes } from "@interfaces/routes.interface";
import validationMiddleware from "@middlewares/validation.middleware";

class UsersRoute implements Routes {
  public path = "/api/users";
  public router = Router();
  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/has-user-registered`,
      this.usersController.hasUserRegistered,
    );
    this.router.get(`${this.path}`, this.usersController.getUsers);
    this.router.get(`${this.path}/:id`, this.usersController.getUserById);
    this.router.post(
      `${this.path}`,
      validationMiddleware(CreateUserDto, "body"),
      this.usersController.createUser,
    );
    this.router.put(
      `${this.path}/:id`,
      validationMiddleware(CreateUserDto, "body", true),
      this.usersController.updateUser,
    );
    this.router.delete(`${this.path}/:id`, this.usersController.deleteUser);
  }
}

export default UsersRoute;
