import { Content } from "@/interfaces/amqp.interface";
import AMQPClient from "@/libs/amqp-client";
import { db } from "@/libs/db";
import { TelegramBotService, TelegramBotClient } from "@/libs/telegram";
import { logger } from "@/utils/logger";
import {
  getFileCategory,
  getMimeTypeFromName,
  isValidExt,
} from "@/utils/utils";
import { telegramUser } from "@prisma/client";
import { GetMessage } from "amqplib";
import fs from "fs";
import TelegramBot from "node-telegram-bot-api";
import { join } from "path";
export default class ListenMessageTelegramFromAMQP {
  private readonly channelName = "notification";
  private readonly queueName = "telegram";
  private readonly virtualHostName = "/";
  private client: TelegramBotService;

  constructor() {
    this.client = TelegramBotClient.getInstance();
    this.handler();
  }

  public async handler() {
    // CEK SESSION UP
    if (!this.client) return;

    const amqpClient = new AMQPClient(this.virtualHostName);

    const sender = (await TelegramBotClient.getBotInfo()).username;

    try {
      await amqpClient.connect();
      const msg = await amqpClient.getMessage(this.queueName);

      if (!msg) {
        // if (NODE_ENV === "development")
        //   logger.info("No more messages in the queue. Exiting...");
        return;
      }

      const messageData = await db.message.create({
        data: {
          payload: msg.content.toString(),
          status: false,
          notification_type: "TELEGRAM",
        },
      });

      amqpClient.ack(msg);
      // VALIDATE CONTENT
      const isValidContent = this.validateContent(msg);

      if (!isValidContent) {
        logger.warn("invalid telegram message schema");
        return;
      }

      //   PARSING CONTENT
      const content = JSON.parse(msg.content.toString()) as Content;

      const message = content.message ?? "";

      // GET RECEIVER
      const receiver = await this.getReceiver(content.receiver);
      if (!receiver) {
        logger.warn("chat id not exists in telegram user :", content.receiver);
        return;
      }

      let sent: TelegramBot.Message;

      if (!content.data) {
        sent = await this.client.sendMessage(receiver.chat_id, message);

        await db.message.update({
          where: { id: messageData.id },
          data: {
            sender: sender,
            receiver: receiver.chat_id.toString(),
            payload: msg.content.toString(),
            sent_at: new Date(),
            status: true,
          },
        });
      } else {
        const decodedFile = Buffer.from(content.data, "base64");
        const mimeType = getMimeTypeFromName(content.filename);
        const folderName = join(__dirname, "../../uploads/telegram");
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

        sent = await this.client.sendMedia(
          receiver.chat_id,
          filePath,
          content.filename,
          mimeType,
          message,
          extCategory,
        );

        await db.message.update({
          where: { id: messageData.id },
          data: {
            payload: JSON.stringify({ ...content, data: null }),
            sender: sender,
            receiver: receiver.chat_id.toString(),
            status: true,
            sent_at: new Date(),
            message_attachments: {
              create: {
                file_name: content.filename,
                file_path: `/uploads/telegram/${newFilename}`, // path
                file_type: mimeType,
                file_size: fs.statSync(filePath).size,
              },
            },
          },
        });
      }

      logger.info("telegram message sent", JSON.stringify(sent.chat));
      // const proccesMessage = async (
      //   content: string,
      //   msg: amqp.ConsumeMessage,
      // ) => {
      //   //   SAVE MESSAGE TO DB
      // };

      // await amqpClient.consume(this.queueName, proccesMessage);
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

  // Fungsi untuk mengecek apakah string dapat dikonversi ke number
  public isNumeric(str: any) {
    return !isNaN(str) && !isNaN(parseFloat(str));
  }

  public async getReceiver(receiver: string): Promise<telegramUser> {
    const findUsers = await db.telegramUser.findMany({
      where: {
        OR: [
          { username: receiver },
          ...(this.isNumeric(receiver) ? [{ chat_id: Number(receiver) }] : []),
        ],
      },
    });

    const user = findUsers.length ? findUsers[0] : null;

    return user;
  }
}
