import { NODE_ENV } from "@/config";
import { Content } from "@/interfaces/amqp.interface";
import AMQPClient from "@/libs/amqp-client";
import { db } from "@/libs/db";
import { WhatsappClient, WhatsappService } from "@/libs/whatsapp";
import { logger } from "@/utils/logger";
import {
  getFileCategory,
  getMimeTypeFromName,
  isValidExt,
  sleep,
} from "@/utils/utils";
import { proto } from "@whiskeysockets/baileys";
import { GetMessage } from "amqplib";
import fs from "fs";
import { join } from "path";

export default class ListenMessageWAFromAMQP {
  private readonly channelName = "notification";
  private readonly queueName = "whatsapp";
  private readonly virtualHostName = "/";
  private client: WhatsappService;

  constructor() {
    this.client = WhatsappClient.getInstance();
    this.handler();
  }

  public async handler() {
    // CEK SESSION UP
    if (!this.client?.isConnected) return;

    const amqpClient = new AMQPClient(this.virtualHostName);

    try {
      await amqpClient.connect();
      const msg = await amqpClient.getMessage(this.queueName);

      if (!msg) {
        if (NODE_ENV === "development")
          logger.info("No more messages in the queue. Exiting...");
        return;
      }

      //   SAVE MESSAGE TO DB
      const messageData = await db.message.create({
        data: {
          payload: msg.content.toString(),
          status: false,
        },
      });

      if (!messageData) return;

      //   REMOVE MESSAGE FROM QUEUE
      amqpClient.ack(msg);
      //   VALIDATE CONTENT
      const isValidContent = this.validateContent(msg);

      if (!isValidContent) {
        await this.client.sendMessage(
          this.client.getUser().id,
          "Terdapat pesan yang gagal dikirim",
        );
        return;
      }

      //   PARSING CONTENT
      const content = JSON.parse(msg.content.toString()) as Content;

      const message = content.message ?? "";

      const receiver = this.client.formatPhoneNumber(content.receiver);
      if (!receiver) {
        await this.client.sendMessage(
          this.client.getUser().id,
          "Terdapat pesan yang gagal dikirim",
        );
        return;
      }

      let sent: proto.IWebMessageInfo;

      // delay random 1 - 20 seconds
      await sleep(Math.floor(Math.random() * (20000 - 1000 + 1)) + 1000);
      //  params msg
      if (!content.data) {
        // WITHOUT DOCUMENT
        sent = await this.client.sendMessage(receiver, message);

        // SAVE TO DB
        await db.message.update({
          where: { id: messageData.id },
          data: {
            sender: this.client.getUser().id,
            receiver: receiver,
            payload: msg.content.toString(),
            sent_at: new Date(),
            status: true,
          },
        });
      } else {
        //   WITH DOCUEMNT
        const decodedFile = Buffer.from(content.data, "base64");
        const mimeType = getMimeTypeFromName(content.filename);
        const folderName = join(__dirname, "../../uploads/wa");
        const newFilename = `${Date.now()}_${content.filename}`;
        const filePath = join(folderName, newFilename);
        const extCategory = getFileCategory(mimeType);

        //   CREATE FOLDER
        if (!fs.existsSync(folderName)) {
          logger.info("create folderName", folderName);
          fs.mkdirSync(folderName, { recursive: true });
        }

        //   SAVE FILE
        fs.writeFileSync(filePath, decodedFile as Uint8Array);

        // SEND MESSAGE BASED ON MEDIA
        sent = await this.client.sendMedia(
          receiver,
          filePath,
          content.filename,
          mimeType,
          message,
          extCategory,
        );

        // SAVE TO DB
        await db.message.update({
          where: { id: messageData.id },
          data: {
            payload: JSON.stringify({ ...content, data: null }),
            sender: this.client.getUser().id,
            receiver: receiver,
            status: true,
            sent_at: new Date(),
            message_attachments: {
              create: {
                file_name: content.filename,
                file_path: `/uploads/wa/${newFilename}`, // path
                file_type: mimeType,
                file_size: fs.statSync(filePath).size,
              },
            },
          },
        });
      }

      logger.info(sent);
    } catch (error) {
      logger.error(error);
    } finally {
      // CLOSE CONNECTION
      await amqpClient.close();
    }
  }

  public validateContent(msg: GetMessage): boolean {
    const content = JSON.parse(msg.content.toString()) as Content;

    return (
      "receiver" in content &&
      ("message" in content ||
        ("data" in content &&
          "filename" in content &&
          isValidExt(content.filename)))
    );
  }
}
