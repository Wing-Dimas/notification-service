import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import validationMiddleware from "@/middlewares/validation.middleware";
import authMiddleware from "@/middlewares/auth.middleware";
import WhatsappController from "@/controllers/whatsapp.controller";
import multerMiddleware from "@/middlewares/multer.middleware";
import { GetMessageWADto, GetSingleMessageWADto } from "@/dtos/whatsapp.dto";

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
      multerMiddleware("wa").single("file"),
      this.whatsappController.editMessage,
    );
  }
}

export default WhatsappMessageRoute;
