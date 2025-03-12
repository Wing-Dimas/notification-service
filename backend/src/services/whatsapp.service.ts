import {
  DeleteMessageWADto,
  EditMessageWADto,
  GetMessageWADto,
  GetSingleMessageWADto,
  SendMessageWADto,
} from "@/dtos/whatsapp.dto";
import { HttpException } from "@/exceptions/HttpException";
import { db } from "@/libs/db";
import { getFileCategory, isValidExt, validateJson } from "@/utils/utils";
import { HistoryMessageWA, Prisma } from "@prisma/client";
import { isEmpty } from "class-validator";
import path, { join } from "path";
import fs from "fs";
import { createPaginator, PaginatedResult } from "prisma-pagination";
import { logger } from "@/utils/logger";
import { Content } from "@/interfaces/amqp.interface";
import { Client, ConnectionSession } from "@/libs/whatsapp";

class WhatsappService {
  public historyMessage = db.historyMessageWA;
  public paginator = createPaginator({ perPage: 10 });

  public async getMessage(
    query: GetMessageWADto,
  ): Promise<PaginatedResult<HistoryMessageWA>> {
    const search = query.search?.toLowerCase() || "";
    const page = query.page || 1;
    const order_by = query.order_by || "created_at";
    const sort = query.sort || "desc";

    const result = await this.paginator<
      HistoryMessageWA,
      Prisma.HistoryMessageWAFindManyArgs
    >(
      this.historyMessage,
      {
        orderBy: { [order_by]: sort },
        where: { payload: { contains: search }, deleted_at: null },
      },
      { page: page },
    );

    return result;
  }

  public async getSingleMessage(
    params: GetSingleMessageWADto,
  ): Promise<HistoryMessageWA> {
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
    messageData: EditMessageWADto,
    file?: Express.Multer.File,
  ): Promise<HistoryMessageWA> {
    if (isEmpty(messageData))
      throw new HttpException(400, "message data is empty");

    const findMessage = await this.historyMessage.findFirst({
      where: { id, deleted_at: null },
    });

    if (!findMessage) throw new HttpException(409, "Message dosent exist");

    const payload = findMessage.payload;
    const isJson = validateJson(payload);

    const updatedPayload = isJson ? JSON.parse(findMessage.payload) : {};
    updatedPayload.message = messageData.message;
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
  ): Promise<HistoryMessageWA> {
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

  public async sendMessage(
    params: SendMessageWADto,
  ): Promise<HistoryMessageWA> {
    if (isNaN(Number(params.id)))
      throw new HttpException(400, "Id is not number");

    const findMessage = await this.historyMessage.findFirst({
      where: { id: Number(params.id), deleted_at: null },
    });

    if (!findMessage) throw new HttpException(409, "Message dosent exist");

    if (!this.validatePayload(findMessage.payload))
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

  public validatePayload(payload: string): boolean {
    try {
      if (!validateJson(payload)) return false;

      const content = JSON.parse(payload) as Content;

      if ("data" in content) {
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
