import {
  DeleteMessageWADto,
  GetMessageWADto,
  GetSingleMessageWADto,
  SendMessageWADto,
} from "@/dtos/whatsapp.dto";
import { HttpException } from "@/exceptions/HttpException";
import { db } from "@/libs/db";
import {
  getFileCategory,
  isValidExt,
  phoneNumber,
  validateJson,
} from "@/utils/utils";
import { isEmpty } from "class-validator";
import path, { join } from "path";
import fs from "fs";
import { createPaginator, PaginatedResult } from "prisma-pagination";
import { Content } from "@/interfaces/amqp.interface";
import { Message, MessageAttachment, Prisma } from "@prisma/client";
import { logger } from "@/utils/logger";
import { WhatsappClient } from "@/libs/whatsapp";

class WhatsappService {
  public message = db.message;
  public paginator = createPaginator({ perPage: 10 });

  public async getMessage(
    query: GetMessageWADto,
  ): Promise<PaginatedResult<Message>> {
    const search = query.search?.toLowerCase() || "";
    const page = query.page || 1;
    const order_by = query.order_by || "created_at";
    const sort = query.sort || "desc";

    const result = await this.paginator<Message, Prisma.MessageFindManyArgs>(
      this.message,
      {
        orderBy: { [order_by]: sort },
        where: {
          payload: { contains: search },
          notification_type: "WHATSAPP",
          deleted_at: null,
        },
        include: { message_attachments: true },
      },
      { page: page },
    );

    return result; // parse payload
  }

  public async getSingleMessage(
    params: GetSingleMessageWADto,
  ): Promise<Message> {
    if (isNaN(Number(params.id)))
      throw new HttpException(400, "Id is not number");

    const findMessage = await this.message.findFirst({
      where: { id: Number(params.id), deleted_at: null },
      include: { message_attachments: true },
    });

    if (!findMessage) throw new HttpException(409, "Message doesn't exist");
    return findMessage;
  }

  public async editMessage(
    id: number,
    body: { message: string; receiver: string },
    file?: Express.Multer.File,
  ): Promise<Message> {
    if (isEmpty(body.message))
      throw new HttpException(400, "message data is empty");
    if (isEmpty(body.receiver))
      throw new HttpException(400, "receiver data is empty");

    const findMessage = await this.message.findFirst({
      where: { id, deleted_at: null },
      include: { message_attachments: true },
    });

    if (!findMessage) throw new HttpException(409, "Message dosent exist");

    const payload = findMessage.payload;
    const isJson = validateJson(payload); // check if payload is json

    const receiver = phoneNumber(body.receiver); // parse receiver to phone number

    const updatedPayload = isJson ? JSON.parse(findMessage.payload) : {}; // parse payload to json
    updatedPayload.message = body.message;
    updatedPayload.receiver = body.receiver;
    updatedPayload.data = null;

    const data: any = {
      payload: JSON.stringify(updatedPayload),
    };

    if (file) {
      // remove temp file if exists
      const fileName = findMessage.message_attachments[0]?.file_name || "";
      const tempFile = path.join(__dirname, "../../uploads/wa", fileName);
      if (fileName && fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

      updatedPayload.filename = file.filename;
      data.payload = JSON.stringify(updatedPayload);

      const attachmentUpdate = {
        file_path: "/" + file.path.split(path.sep).join("/"), // replace "\\" to /
        file_type: file.mimetype,
        file_name: file.filename,
      };

      const existingAttachment = findMessage.message_attachments[0];

      // update or insert attachment
      if (existingAttachment) {
        return await this.message.update({
          where: { id },
          data: {
            receiver: receiver,
            payload: data.payload,
            message_attachments: {
              update: {
                where: { id: existingAttachment?.id },
                data: { ...attachmentUpdate },
              },
            },
          },
        });
      } else {
        return await this.message.update({
          where: { id },
          data: {
            receiver: receiver,
            payload: data.payload,
            message_attachments: { create: { ...attachmentUpdate } },
          },
        });
      }
    }

    return await this.message.update({
      where: { id },
      data: { receiver: receiver, ...data },
    });
  }

  public async deleteMessage(params: DeleteMessageWADto): Promise<Message> {
    if (isNaN(Number(params.id)))
      throw new HttpException(400, "Id is not number");

    const findMessage = await this.message.findFirst({
      where: { id: Number(params.id), deleted_at: null },
    });

    if (!findMessage) throw new HttpException(409, "Message dosent exist");

    return this.message.update({
      where: { id: findMessage.id },
      data: { deleted_at: new Date() },
    });
  }

  public async sendMessage(params: SendMessageWADto): Promise<Message> {
    if (isNaN(Number(params.id)))
      throw new HttpException(400, "Id is not number");

    const findMessage = await this.message.findFirst({
      where: { id: Number(params.id), deleted_at: null },
      include: { message_attachments: true },
    });

    if (!findMessage) throw new HttpException(409, "Message dosent exist");

    if (!this.validatePayload(findMessage))
      throw new HttpException(400, "Fix payload before sending");

    const payload = JSON.parse(findMessage.payload) as Content;

    try {
      const client = WhatsappClient.getInstance(); // get whatsapp client instance
      if (!client) throw new HttpException(503, "Whatsapp is not running");
      const receiver = client.formatPhoneNumber(payload.receiver);

      // WITHOUT DOCUMENT
      if (!findMessage.message_attachments[0]) {
        await client.sendMessage(receiver, payload.message);
      } else {
        // WITH DOCUMENT
        const message = payload.message;
        const { file_path, file_type, file_name } =
          findMessage.message_attachments[0];
        const extCategory = getFileCategory(file_type);
        const fullpath = join(__dirname, "../../", file_path);

        await client.sendMedia(
          receiver,
          fullpath,
          file_name,
          file_type,
          message,
          extCategory,
        );
      }
      // SAVE TO DB
      return await this.message.update({
        where: { id: findMessage.id },
        data: { status: true, sent_at: new Date() },
      });
    } catch (error) {
      logger.error("Error sending message", error);
      throw new HttpException(500, "Whatsapp is not running");
    }
  }

  public validatePayload(
    findMessage: Message & { message_attachments: MessageAttachment[] },
  ): boolean {
    const payload = findMessage.payload;

    if (!validateJson(payload)) return false;

    const content = JSON.parse(payload) as Content;

    return (
      "receiver" in content &&
      ("message" in content ||
        (findMessage.message_attachments[0] &&
          "filename" in content &&
          isValidExt(content.filename)))
    );
  }
}

export default WhatsappService;
