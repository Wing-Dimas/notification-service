import { Router } from "express";
import IndexController from "@controllers/index.controller";
import { Routes } from "@interfaces/routes.interface";
import authMiddleware from "@/middlewares/auth.middleware";

class IndexRoute implements Routes {
  public path = "/api";
  public router = Router();
  public indexController = new IndexController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.indexController.index);

    this.router.get(
      `${this.path}/get-dashboard-data`,
      authMiddleware,
      this.indexController.getDashboardData,
    );
  }
}

export default IndexRoute;
