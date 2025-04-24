import { NextFunction, Response } from "express";
import { HttpException } from "@exceptions/HttpException";
import { db } from "@/libs/db";
import { logger } from "@/utils/logger";
import { RequestWithApiKey } from "@/interfaces/api-key.interface";

const validationApiKeyMiddleware = async (
  req: RequestWithApiKey,
  res: Response,
  next: NextFunction,
) => {
  try {
    const apikey = req.header("x-api-key");

    if (apikey) {
      const findApiKey = await db.apiKey.findUnique({ where: { key: apikey } });
      const is_active = findApiKey?.is_active;

      if (findApiKey && is_active) {
        req.apiKeyData = findApiKey;
        next();
      } else if (findApiKey && !is_active) {
        next(
          new HttpException(404, "API key is not active, please contact admin"),
        );
      } else {
        next(new HttpException(404, "Wrong API key"));
      }
    } else {
      next(new HttpException(404, "API key missing"));
    }
  } catch (error) {
    logger.error(JSON.stringify(error));
    next(new HttpException(500, "Internal server error"));
  }
};

export default validationApiKeyMiddleware;
