// import { PrismaClient, User } from "@prisma/client";
import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@/utils/utils";
import { db } from "@/libs/db";
import { ApiKey, Prisma } from "@prisma/client";
import { createPaginator, PaginatedResult } from "prisma-pagination";
import {
  CreateApiKeyDto,
  GetApiKeysDto,
  UpdateApiKeyDto,
} from "@/dtos/api-key.dto";
import crypto from "crypto";

class ApiKeyService {
  public apiKey = db.apiKey;
  public paginator = createPaginator({ perPage: 10 });

  public async findAllApiKeys(
    query: GetApiKeysDto,
  ): Promise<PaginatedResult<ApiKey>> {
    const search = query.search?.toLowerCase() || "";
    const page = query.page || 1;
    const order_by = query.order_by || "created_at";
    const sort = query.sort || "desc";

    const result = await this.paginator<ApiKey, Prisma.ApiKeyFindManyArgs>(
      this.apiKey,
      {
        orderBy: { [order_by]: sort },
        where: { name: { contains: search } },
      },
      { page: page },
    );

    return result;
  }

  public async findApiKeyById(apiKeyId: number): Promise<ApiKey> {
    const findApiKey: ApiKey = await this.apiKey.findUnique({
      where: { id: apiKeyId },
    });

    if (!findApiKey) throw new HttpException(409, "api key not found");

    return findApiKey;
  }

  public async createApiKey(
    apiKeyData: CreateApiKeyDto,
    userId: number,
  ): Promise<ApiKey> {
    if (isEmpty(apiKeyData)) throw new HttpException(400, "api key is empty");

    const findApiKey: ApiKey = await this.apiKey.findUnique({
      where: { name: apiKeyData.name },
    });

    if (findApiKey)
      throw new HttpException(
        409,
        `This name ${apiKeyData.name} already exists`,
      );

    const apiKey = crypto.randomBytes(32).toString("hex");

    const createApiData: ApiKey = await this.apiKey.create({
      data: { ...apiKeyData, key: apiKey, user_id: userId },
    });

    return createApiData;
  }

  public async updateApiKey(
    apiKeyId: number,
    apiKeyData: UpdateApiKeyDto,
  ): Promise<ApiKey> {
    if (isEmpty(apiKeyData))
      throw new HttpException(400, "api key data is empty");

    if (apiKeyData.name === "")
      throw new HttpException(400, "api key name is empty");

    const findApiKey: ApiKey = await this.apiKey.findUnique({
      where: { id: apiKeyId },
    });

    if (!findApiKey) throw new HttpException(409, "Api key doesn't exist");

    const updateApiKeyData: ApiKey = await this.apiKey.update({
      where: { id: apiKeyId },
      data: apiKeyData,
    });

    return updateApiKeyData;
  }

  public async deleteApiKey(apiKeyId: number): Promise<ApiKey> {
    const findApiKey: ApiKey = await this.apiKey.findUnique({
      where: { id: apiKeyId },
    });

    if (!findApiKey) throw new HttpException(409, "Api key doesn't exist");

    const deleteApiKeyData: ApiKey = await this.apiKey.delete({
      where: { id: apiKeyId },
    });

    return deleteApiKeyData;
  }
}

export default ApiKeyService;
