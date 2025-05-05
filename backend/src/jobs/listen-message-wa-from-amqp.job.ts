import { Content } from "@/interfaces/amqp.interface";
import { db } from "@/libs/db";
import { RabbitMQClient } from "@/libs/rabbitmq";
import { WhatsappClient, WhatsappService } from "@/libs/whatsapp";
import { logger } from "@/utils/logger";
import {
  getFileCategory,
  getMimeTypeFromName,
  isValidExt,
  sleep,
} from "@/utils/utils";
import fs from "fs";
import { join } from "path";

export default class ListenMessageWAFromAMQP {
  private readonly queueName = "whatsapp";
  private client: WhatsappService;

  constructor() {
    this.client = WhatsappClient.getInstance();
    this.handler();
  }

  public async handler() {
    const broker = RabbitMQClient.getInstance();
    if (!broker) return;

    const consumerTag = await broker.subscribe(
      this.queueName,
      async (msg: Content) => {
        // CEK SESSION UP
        if (!this.client?.isConnected)
          throw new Error("WhatsApp service not running");

        const messageData = await db.message.create({
          data: {
            payload: JSON.stringify(msg),
            status: false,
          },
        });

        if (!messageData) return;

        const isValidContent = this.validateContent(msg);

        if (!isValidContent) {
          logger.warn("invalid telegram message schema");
          return;
        }

        const receiver = this.client.formatPhoneNumber(msg.receiver);
        if (!receiver) {
          await this.client.sendMessage(
            this.client.getUser().id,
            "Terdapat pesan yang gagal dikirim dengan nomor : " + msg.receiver,
          );
          return;
        }
        // delay random 1 - 20 seconds
        await sleep(Math.floor(Math.random() * (20000 - 1000 + 1)) + 1000);
        if (!msg.data) {
          await this.client.sendMessage(receiver, msg.message);
          await db.message.update({
            where: { id: messageData.id },
            data: {
              sender: this.client.getUser().id,
              receiver: receiver,
              payload: JSON.stringify(msg),
              status: true,
            },
          });
        } else {
          //   WITH DOCUEMNT
          const decodedFile = Buffer.from(msg.data, "base64");
          const mimeType = getMimeTypeFromName(msg.filename);
          const folderName = join(__dirname, "../../uploads/wa");
          const newFilename = `${Date.now()}_${msg.filename}`;
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
          await this.client.sendMedia(
            receiver,
            filePath,
            msg.filename,
            mimeType,
            msg.message,
            extCategory,
          );

          // SAVE TO DB
          await db.message.update({
            where: { id: messageData.id },
            data: {
              payload: JSON.stringify({ ...msg, data: null }),
              sender: this.client.getUser().id,
              receiver: receiver,
              status: true,
              sent_at: new Date(),
              message_attachments: {
                create: {
                  file_name: msg.filename,
                  file_path: `/uploads/wa/${newFilename}`, // path
                  file_type: mimeType,
                  file_size: fs.statSync(filePath).size,
                },
              },
            },
          });

          logger.info("whatsapp bot sent message to " + receiver);
        }
      },
      {
        withDelay: true,
        delayMS: 10 * 1000,
      },
    );

    RabbitMQClient.registerConsumerTag(this.queueName, consumerTag);
  }

  public validateContent(content: any): boolean {
    return (
      "receiver" in content &&
      ("message" in content ||
        ("data" in content &&
          "filename" in content &&
          isValidExt(content.filename)))
    );
  }
}
