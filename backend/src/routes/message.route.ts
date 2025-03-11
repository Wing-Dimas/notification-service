import { Router } from "express";
import { SendMessageDto } from "@dtos/message.dto";
import { Routes } from "@interfaces/routes.interface";
import MessageController from "@/controllers/message.controller";
import validationMiddleware from "@/middlewares/validation.middleware";
import authMiddleware from "@/middlewares/auth.middleware";

class MessageRoute implements Routes {
  public path = "/api";
  public router = Router();
  public messageController = new MessageController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/send-message`,
      validationMiddleware(SendMessageDto, "body"),
      authMiddleware,
      this.messageController.sendMessage,
    );
  }
}

export default MessageRoute;
