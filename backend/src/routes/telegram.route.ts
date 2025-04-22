import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import validationMiddleware from "@/middlewares/validation.middleware";
import authMiddleware from "@/middlewares/auth.middleware";
import multerMiddleware from "@/middlewares/multer.middleware";
import {
  DeleteMessageTelegramDto,
  EditMessageTelegramDto,
  GetMessageTelegramDto,
  GetSingleMessageTelegramDto,
  SendMessageTelegramDto,
} from "@/dtos/telegram.dto";
import TelegramController from "@/controllers/telegram.controller";

class TelegramRoute implements Routes {
  public path = "/api/telegram";
  public router = Router();
  public telegramController = new TelegramController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET MESSAGE
    this.router.get(
      `${this.path}/message`,
      authMiddleware,
      validationMiddleware(GetMessageTelegramDto, "query"),
      this.telegramController.getMessage,
    );

    this.router.get(
      `${this.path}/message/:id`,
      authMiddleware,
      validationMiddleware(GetSingleMessageTelegramDto, "params"),
      this.telegramController.getSingleMessage,
    );

    // EDIT MESSAGE
    this.router.put(
      `${this.path}/message/:id/edit`,
      authMiddleware,
      validationMiddleware(EditMessageTelegramDto, "params"),
      multerMiddleware("wa").single("file"),
      this.telegramController.editMessage,
    );

    // DELETE MESSAGE
    this.router.delete(
      `${this.path}/message/:id`,
      authMiddleware,
      validationMiddleware(DeleteMessageTelegramDto, "params"),
      this.telegramController.deleteMessage,
    );

    // SEND MESSAGE
    this.router.post(
      `${this.path}/message/:id/send-message`,
      authMiddleware,
      validationMiddleware(SendMessageTelegramDto, "params"),
      this.telegramController.sendMessage,
    );
  }
}

export default TelegramRoute;
