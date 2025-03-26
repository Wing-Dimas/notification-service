import {
  DeleteMessageWADto,
  GetMessageWADto,
  GetSingleMessageWADto,
  SendMessageWADto,
} from "@/dtos/whatsapp.dto";
import { HttpException } from "@/exceptions/HttpException";
import { db } from "@/libs/db";
import { getFileCategory, isValidExt, validateJson } from "@/utils/utils";
import { isEmpty } from "class-validator";
import path, { join } from "path";
import fs from "fs";
import { createPaginator, PaginatedResult } from "prisma-pagination";
import { logger } from "@/utils/logger";
import { Content } from "@/interfaces/amqp.interface";
import { Client, ConnectionSession } from "@/libs/whatsapp";
import { HistoryMessage, Prisma } from "@prisma/client";

class WhatsappService {
  public historyMessage = db.historyMessage;
  public paginator = createPaginator({ perPage: 10 });

  public async getMessage(
    query: GetMessageWADto,
  ): Promise<PaginatedResult<HistoryMessage>> {
    const search = query.search?.toLowerCase() || "";
    const page = query.page || 1;
    const order_by = query.order_by || "created_at";
    const sort = query.sort || "desc";

    const result = await this.paginator<
      HistoryMessage,
      Prisma.HistoryMessageFindManyArgs
    >(
      this.historyMessage,
      {
        orderBy: { [order_by]: sort },
        where: {
          payload: { contains: search },
          notification_type: "WHATSAPP",
          deleted_at: null,
        },
      },
      { page: page },
    );

    return result;
  }

  public async getSingleMessage(
    params: GetSingleMessageWADto,
  ): Promise<HistoryMessage> {
    if (isNaN(Number(params.id)))
      throw new HttpException(400, "Id is not number");

    const findMessage = await this.historyMessage.findFirst({
      where: { id: Number(params.id), deleted_at: null },
    });

    if (!findMessage) throw new HttpException(409, "Message dosent exist");
    return findMessage;
  }

  public async editMessage(
    id: number,
    messageData: string,
    file?: Express.Multer.File,
  ): Promise<HistoryMessage> {
    if (isEmpty(messageData))
      throw new HttpException(400, "message data is empty");

    const findMessage = await this.historyMessage.findFirst({
      where: { id, deleted_at: null },
    });

    if (!findMessage) throw new HttpException(409, "Message dosent exist");

    const payload = findMessage.payload;
    const isJson = validateJson(payload);

    const updatedPayload = isJson ? JSON.parse(findMessage.payload) : {};
    updatedPayload.message = messageData;
    updatedPayload.data = null;

    const data: any = {
      payload: JSON.stringify(updatedPayload),
    };

    if (file) {
      const tempFile = findMessage.file_path;
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

      updatedPayload.filename = file.filename;
      data.file_path = "/" + file.path.split(path.sep).join("/"); // replace "\\" to /
      data.mime_type = file.mimetype;
      data.filename = file.filename;
      data.payload = JSON.stringify(updatedPayload);
    }

    return await this.historyMessage.update({
      where: { id },
      data: data,
    });
  }

  public async deleteMessage(
    params: DeleteMessageWADto,
  ): Promise<HistoryMessage> {
    if (isNaN(Number(params.id)))
      throw new HttpException(400, "Id is not number");

    const findMessage = await this.historyMessage.findFirst({
      where: { id: Number(params.id), deleted_at: null },
    });

    if (!findMessage) throw new HttpException(409, "Message dosent exist");

    return this.historyMessage.update({
      where: { id: findMessage.id },
      data: { deleted_at: new Date() },
    });
  }

  public async sendMessage(params: SendMessageWADto): Promise<HistoryMessage> {
    if (isNaN(Number(params.id)))
      throw new HttpException(400, "Id is not number");

    const findMessage = await this.historyMessage.findFirst({
      where: { id: Number(params.id), deleted_at: null },
    });

    if (!findMessage) throw new HttpException(409, "Message dosent exist");

    if (!this.validatePayload(findMessage))
      throw new HttpException(400, "Fix payload before sending");

    const payload = JSON.parse(findMessage.payload) as Content;

    try {
      const client = new Client(new ConnectionSession().getClient());

      // WITHOUT DOCUMENT
      if (!findMessage.file_path) {
        await client.sendText(payload.message);
      } else {
        // WITH DOCUMENT
        const message = payload.message;
        const { file_path, mime_type, filename } = findMessage;
        const extCategory = getFileCategory(mime_type);
        const fullpath = join(__dirname, "../../", file_path);

        await client.sendMedia(
          fullpath,
          filename,
          mime_type,
          message,
          extCategory,
        );
      }
      // SAVE TO DB
      return await this.historyMessage.update({
        where: { id: findMessage.id },
        data: { status: true, sent_at: new Date() },
      });
    } catch (error) {
      throw new HttpException(500, "Whatsapp is not running");
    }
  }

  public validatePayload(findMessage: HistoryMessage): boolean {
    try {
      const payload = findMessage.payload;

      if (!validateJson(payload)) return false;

      const content = JSON.parse(payload) as Content;

      if (findMessage.filename) {
        return "filename" in content && isValidExt(content.filename);
      }

      return "message" in content;
    } catch (error) {
      logger.error(Error);
      return false;
    }
  }
}

export default WhatsappService;
