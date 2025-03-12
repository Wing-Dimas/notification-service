import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import validationMiddleware from "@/middlewares/validation.middleware";
import authMiddleware from "@/middlewares/auth.middleware";
import WhatsappController from "@/controllers/whatsapp.controller";
import multerMiddleware from "@/middlewares/multer.middleware";
import {
  DeleteMessageWADto,
  EditMessageWADto,
  GetMessageWADto,
  GetSingleMessageWADto,
  SendMessageWADto,
} from "@/dtos/whatsapp.dto";

class WhatsappMessageRoute implements Routes {
  public path = "/api/whatsapp";
  public router = Router();
  public whatsappController = new WhatsappController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET MESSAGE
    this.router.get(
      `${this.path}/message`,
      authMiddleware,
      validationMiddleware(GetMessageWADto, "query"),
      this.whatsappController.getMessage,
    );

    this.router.get(
      `${this.path}/message/:id`,
      authMiddleware,
      validationMiddleware(GetSingleMessageWADto, "params"),
      this.whatsappController.getSingleMessage,
    );

    // EDIT MESSAGE
    this.router.put(
      `${this.path}/message/:id/edit`,
      authMiddleware,
      validationMiddleware(EditMessageWADto, "params"),
      multerMiddleware("wa").single("file"),
      this.whatsappController.editMessage,
    );

    // DELETE MESSAGE
    this.router.delete(
      `${this.path}/message/:id`,
      authMiddleware,
      validationMiddleware(DeleteMessageWADto, "params"),
      this.whatsappController.deleteMessage,
    );

    // SEND MESSAGE
    this.router.post(
      `${this.path}/message/:id/send-message`,
      authMiddleware,
      validationMiddleware(SendMessageWADto, "params"),
      this.whatsappController.sendMessage,
    );
  }
}

export default WhatsappMessageRoute;
