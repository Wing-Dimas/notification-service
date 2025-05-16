import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import validationMiddleware from "@middlewares/validation.middleware";
import ApiKeyController from "@/controllers/api-key.controller";
import { CreateApiKeyDto, UpdateApiKeyDto } from "@/dtos/api-key.dto";
import authMiddleware from "@/middlewares/auth.middleware";

class ApiKeyRoute implements Routes {
  public path = "/api/api-key";
  public router = Router();
  public apiKeyController = new ApiKeyController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET ALL API KEYS
    this.router.get(`${this.path}`, this.apiKeyController.findAllApiKeys);
    // GET API KEY BY ID
    this.router.get(
      `${this.path}/:id`,
      authMiddleware,
      this.apiKeyController.findApiKeyById,
    );
    // SAVE API KEY
    this.router.post(
      `${this.path}`,
      authMiddleware,
      validationMiddleware(CreateApiKeyDto, "body"),
      this.apiKeyController.createApiKey,
    );
    // UPDATE API KEY
    this.router.put(
      `${this.path}/:id`,
      authMiddleware,
      validationMiddleware(UpdateApiKeyDto, "body", true),
      this.apiKeyController.updateApiKey,
    );
    // DELETE API KEY
    this.router.delete(
      `${this.path}/:id`,
      authMiddleware,
      this.apiKeyController.deleteApiKey,
    );
  }
}

export default ApiKeyRoute;
