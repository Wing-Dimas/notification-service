import { NODE_ENV } from "@/config";
import { Content } from "@/interfaces/amqp.interface";
import { db } from "@/libs/db";
import { ConnectionSession, Client } from "@/libs/whatsapp";
import { logger } from "@/utils/logger";
import {
  getAMQPConnection,
  getFileCategory,
  getMimeTypeFromName,
  isValidExt,
} from "@/utils/utils";
import { proto } from "@whiskeysockets/baileys";
import { GetMessage } from "amqplib";
import fs from "fs";
import { join } from "path";

export default class ListenMessageWAFromAMQP {
  private readonly channelName = "notification";
  private readonly queueName = "whatsapp";
  private readonly virtualHostName = "/";
  private client: Client;

  constructor() {
    this.client = new Client(new ConnectionSession().getClient());
    this.handler();
  }

  public async handler() {
    // CEK SESSION UP
    const session = new ConnectionSession().getClient();

    if (!session?.user?.id || session?.isStop) return;

    // GET CONNECTION FRMO AMQP
    const { connection, channel } = await getAMQPConnection(
      this.virtualHostName,
    );

    // GET MESSAGE FROM QUEUE
    const msg = await channel.get(this.queueName);

    try {
      if (!msg) {
        if (NODE_ENV === "development") {
          logger.info("No more messages in the queue. Exiting...");
        }
        return;
      }

      //   SAVE MESSAGE TO DB
      const historyMessageData = await db.historyMessageWA.create({
        data: {
          payload: msg.content.toString(),
          status: false,
        },
      });

      if (!historyMessageData) return;
      //   REMOVE MESSAGE FROM QUEUE
      channel.ack(msg);

      //   VALIDATE CONTENT
      const isValidContent = this.validateContent(msg);

      if (!isValidContent) return;

      //   PARSING CONTENT
      const content = JSON.parse(msg.content.toString()) as Content;

      const message = content.message ?? "";

      let sent: proto.IWebMessageInfo;

      //  params msg
      if (!content.data) {
        // WITHOUT DOCUMENT
        // SEND MESSAGE
        sent = await this.client.sendText(message);

        // SAVE TO DB
        await db.historyMessageWA.update({
          where: { id: historyMessageData.id },
          data: {
            payload: msg.content.toString(),
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
          filePath,
          content.filename,
          mimeType,
          message,
          extCategory,
        );

        // SAVE TO DB
        await db.historyMessageWA.update({
          where: { id: historyMessageData.id },
          data: {
            payload: JSON.stringify({ ...content, data: null }),
            status: true,
            file_path: `/uploads/wa/${newFilename}`,
            filename: content.filename,
            mime_type: mimeType,
          },
        });
      }

      logger.debug(sent);
    } catch (error) {
      logger.error(error);
    } finally {
      // CLOSE CONNECTION
      await channel.close();
      await connection.close();
    }
  }

  public validateContent(msg: GetMessage): boolean {
    try {
      const content = JSON.parse(msg.content.toString()) as Content;

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
