import { ApiKey } from "@prisma/client";
import { Request } from "express";

export interface RequestWithApiKey extends Request {
  apiKeyData: ApiKey;
}
