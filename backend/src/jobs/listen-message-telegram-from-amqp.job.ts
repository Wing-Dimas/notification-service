import { Content } from "@/interfaces/amqp.interface";
import { db } from "@/libs/db";
import { RabbitMQClient } from "@/libs/rabbitmq";
import { TelegramBotService, TelegramBotClient } from "@/libs/telegram";
import { logger } from "@/utils/logger";
import {
  getFileCategory,
  getMimeTypeFromName,
  isValidExt,
} from "@/utils/utils";
import { telegramUser } from "@prisma/client";
import fs from "fs";
import TelegramBot from "node-telegram-bot-api";
import { join } from "path";
export default class ListenMessageTelegramFromAMQP {
  private readonly queueName = "telegram";
  private client: TelegramBotService;

  constructor() {
    this.client = TelegramBotClient.getInstance();
    this.handler();
  }

  public async handler() {
    // CEK SESSION UP
    if (!this.client) return;

    const broker = RabbitMQClient.getInstance();
    if (!broker) return;

    const sender = (await TelegramBotClient.getBotInfo()).username;

    const consumerTag = await broker.subscribe(
      this.queueName,
      async (msg: Content) => {
        const messageData = await db.message.create({
          data: {
            payload: JSON.stringify(msg),
            status: false,
            notification_type: "TELEGRAM",
          },
        });

        const isValidContent = this.validateContent(msg);

        if (!isValidContent) {
          logger.warn("invalid telegram message schema");
          return;
        }

        const message = msg.message ?? "";
        const receiver = await this.getReceiver(msg.receiver);
        if (!receiver) return;

        let sent: TelegramBot.Message;

        if (!msg.data) {
          sent = await this.client.sendMessage(receiver.chat_id, message);

          await db.message.update({
            where: { id: messageData.id },
            data: {
              sender: sender,
              receiver: receiver.chat_id.toString(),
              status: true,
              sent_at: new Date(),
            },
          });
        } else {
          const decodedFile = Buffer.from(msg.data, "base64");
          const mimeType = getMimeTypeFromName(msg.filename);
          const folderName = join(__dirname, "../../uploads/telegram");
          const newFilename = `${Date.now()}_${msg.filename}`;
          const filePath = join(folderName, newFilename);
          const extCategory = getFileCategory(mimeType);

          if (!fs.existsSync(folderName)) {
            logger.info("create folderName", folderName);
            fs.mkdirSync(folderName, { recursive: true });
          }

          fs.writeFileSync(filePath, decodedFile as Uint8Array);

          sent = await this.client.sendMedia(
            receiver.chat_id,
            filePath,
            msg.filename,
            mimeType,
            message,
            extCategory,
          );

          await db.message.update({
            where: { id: messageData.id },
            data: {
              payload: JSON.stringify({ ...msg, data: null }),
              sender: sender,
              receiver: receiver.chat_id.toString(),
              status: true,
              sent_at: new Date(),
              message_attachments: {
                create: {
                  file_name: msg.filename,
                  file_path: `/uploads/telegram/${newFilename}`, // path
                  file_type: mimeType,
                  file_size: fs.statSync(filePath).size,
                },
              },
            },
          });
        }

        logger.info("telegram message sent to " + sent.chat.username);
      },
    );

    RabbitMQClient.registerConsumerTag(this.queueName, consumerTag);
  }

  public validateContent(content: any): boolean {
    // const content = JSON.parse(msg.content.toString()) as Content;

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
