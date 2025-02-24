import { Router } from "express";
import { SendMessageDto } from "@dtos/message.dto";
import { Routes } from "@interfaces/routes.interface";
import MessageController from "@/controllers/message.controller";
import validationMiddleware from "@/middlewares/validation.middleware";

class MessageRoute implements Routes {
  public path = "/";
  public router = Router();
  public messageController = new MessageController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}send-message`,
      validationMiddleware(SendMessageDto, "body"),
      this.messageController.sendMessage,
    );
  }
}

export default MessageRoute;
