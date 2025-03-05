import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import validationMiddleware from "@/middlewares/validation.middleware";
import authMiddleware from "@/middlewares/auth.middleware";
import WhatsappController from "@/controllers/whatsapp.controller";

class WhatsappMessageRoute implements Routes {
  public path = "/whatsapp";
  public router = Router();
  public whatsappController = new WhatsappController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/message`,
      authMiddleware,
      this.whatsappController.getMessage,
    );
  }
}

export default WhatsappMessageRoute;
