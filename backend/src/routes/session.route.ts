import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import authMiddleware from "@middlewares/auth.middleware";
import SessionController from "@/controllers/session.controller";

class SessionRoute implements Routes {
  public path = "/api/session";
  public router = Router();
  public sessionController = new SessionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // CREATE SESSION
    // this.router.post(
    //   `${this.path}/create-session`,
    //   authMiddleware,
    //   this.sessionController.createSession,
    // );
    // GET STATUS
    this.router.get(
      `${this.path}/get-status`,
      authMiddleware,
      this.sessionController.getStatus,
    );
  }
}

export default SessionRoute;
