import { logger } from "@/utils/logger";
import ManualJob from "../manual-job";
import { db } from "@/libs/db";
import { RabbitMQClient } from "@/libs/rabbitmq";
import { Content } from "@/interfaces/amqp.interface";
import {
  getFileCategory,
  getMimeTypeFromName,
  isValidExt,
  sleep,
} from "@/utils/utils";
import fs from "fs";
import { join } from "path";
import { WhatsappClient } from "@/libs/whatsapp";

export default class ListenMessageWAFromAMQPJob extends ManualJob {
  private readonly queueName = "whatsapp";

  constructor() {
    super("listen-message-wa-from-amqp");
  }

  public async execute(): Promise<void> {
    try {
      const client = WhatsappClient.getInstance();
      const broker = RabbitMQClient.getInstance();
      if (!broker) return;

      const handler = async (msg: Content) => {
        // CEK SESSION UP
        if (!client?.isConnected)
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

        const receiver = client.formatPhoneNumber(msg.receiver);
        if (!receiver) {
          await client.sendMessage(
            client.getUser().id,
            "Terdapat pesan yang gagal dikirim dengan nomor : " + msg.receiver,
          );
          return;
        }
        // delay random 1 - 20 seconds
        await sleep(Math.floor(Math.random() * (20000 - 1000 + 1)) + 1000);
        if (!msg.data) {
          await client.sendMessage(receiver, msg.message);
          await db.message.update({
            where: { id: messageData.id },
            data: {
              sender: client.getUser().id,
              receiver: receiver,
              payload: JSON.stringify(msg),
              status: true,
              sent_at: new Date(),
            },
          });
        } else {
          //   WITH DOCUEMNT
          const decodedFile = Buffer.from(msg.data, "base64");
          const mimeType = getMimeTypeFromName(msg.filename);
          const folderName = join(__dirname, "../../../uploads/wa");
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
          await client.sendMedia(
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
              sender: client.getUser().id,
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
      };

      const consumerTag = await broker.subscribe(this.queueName, handler, {
        withDelay: true,
        delayMS: 10 * 1000, // 10 seconds
      });

      RabbitMQClient.registerConsumerTag(this.queueName, consumerTag);
    } catch (error) {
      logger.error(error, {
        job: this.jobName,
        method: "execute",
        file: "listen-message-wa-from-amqp.job.ts",
      });
    }
  }

  private validateContent(content: any): boolean {
    // const content = JSON.parse(msg.content.toString()) as Content;

    return (
      "receiver" in content &&
      ("message" in content ||
        ("data" in content &&
          "filename" in content &&
          isValidExt(content.filename)))
    );
  }

  public async onStop(): Promise<void> {
    try {
      const broker = RabbitMQClient.getInstance();
      if (!broker) return;
      const consumerTag = RabbitMQClient.getConsumerTags(this.queueName);
      await broker.unsubscribe(consumerTag);
    } catch (error) {
      throw error;
    }
  }
}
