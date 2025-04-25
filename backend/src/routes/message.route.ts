import { Router } from "express";
import { SendMessageDto } from "@dtos/message.dto";
import { Routes } from "@interfaces/routes.interface";
import MessageController from "@/controllers/message.controller";
import validationMiddleware from "@/middlewares/validation.middleware";
import multerMiddleware from "@/middlewares/multer.middleware";
import validationApiKeyMiddleware from "@/middlewares/validation-api-key.middleware";

class MessageRoute implements Routes {
  public path = "/api/send-message";
  public router = Router();
  public messageController = new MessageController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      this.path,
      validationApiKeyMiddleware,
      multerMiddleware("temp").single("file"),
      validationMiddleware(SendMessageDto, "body"),
      this.messageController.sendMessage,
    );
  }
}

export default MessageRoute;
