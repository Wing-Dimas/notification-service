import { NextFunction, Request, Response } from "express";
import { ApiKey } from "@prisma/client";
import ApiKeyService from "@/services/api-key.service";
import {
  CreateApiKeyDto,
  GetApiKeysDto,
  UpdateApiKeyDto,
} from "@/dtos/api-key.dto";
import { RequestWithUser } from "@/interfaces/auth.interface";

class ApiKeyController {
  public apiKeyService = new ApiKeyService();

  public findAllApiKeys = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query: GetApiKeysDto = req.query;
      const apiKeys = await this.apiKeyService.findAllApiKeys(query);
      res.status(200).json({ data: apiKeys, status: 200, message: "success" });
    } catch (error) {
      next(error);
    }
  };

  public findApiKeyById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const apiKeyId = Number(req.params.id);
      const apiKey = await this.apiKeyService.findApiKeyById(apiKeyId);
      res.status(200).json({ data: apiKey, status: 200, message: "success" });
    } catch (error) {
      next(error);
    }
  };

  public createApiKey = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const apiKeyData: CreateApiKeyDto = req.body;
      const userId = req.user.id;
      const createApiKeyData: ApiKey = await this.apiKeyService.createApiKey(
        apiKeyData,
        userId,
      );

      res
        .status(201)
        .json({ data: createApiKeyData, status: 201, message: "created" });
    } catch (error) {
      next(error);
    }
  };

  public updateApiKey = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const apiKeyId = Number(req.params.id);
      const apiKeyData: UpdateApiKeyDto = req.body;

      const updateApiKeyData: ApiKey = await this.apiKeyService.updateApiKey(
        apiKeyId,
        apiKeyData,
      );

      res
        .status(200)
        .json({ data: updateApiKeyData, status: 200, message: "updated" });
    } catch (error) {
      next(error);
    }
  };

  public deleteApiKey = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const apiKeyId = Number(req.params.id);
      const apiKey = await this.apiKeyService.deleteApiKey(apiKeyId);
      res.status(200).json({ data: apiKey, status: 200, message: "deleted" });
    } catch (error) {
      next(error);
    }
  };
}

export default ApiKeyController;
