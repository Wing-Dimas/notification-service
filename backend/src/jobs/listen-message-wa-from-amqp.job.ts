import { NODE_ENV } from "@/config";
import { Content, Headers } from "@/interfaces/amqp.interface";
import { db } from "@/libs/db";
import ConnectionSession from "@/libs/whatsapp/ConnectionSession";
import { logger } from "@/utils/logger";
import { getAMQPConnection, getMimeTypeFromName } from "@/utils/utils";
import { proto } from "@whiskeysockets/baileys";
import { GetMessage } from "amqplib";
import fs from "fs";
import path, { join } from "path";

const fileCategories = {
  image: [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg"],
  video: [".mp4", ".mov", ".avi", ".mkv", ".flv", ".wmv", ".webm"],
  document: [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".rtf",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
  ],
};

type FileCategory = keyof typeof fileCategories;

export default class ListenMessageWAFromAMQP {
  private readonly channelName = "notification";
  private readonly queueName = "whatsapp";
  private readonly virtualHostName = "/";

  constructor() {
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

      //   VALIDATE CONTENT
      const isValidContent = this.validateContent(msg);

      if (!isValidContent) {
        await db.historyMessageWA.create({
          data: {
            payload: msg.content.toString(),
            status: false,
          },
        });

        channel.ack(msg);
        return;
      }

      //   PARSING CONTENT
      const content = JSON.parse(msg.content.toString()) as Content;

      const message = content.message ?? "";

      let sent: proto.IWebMessageInfo;

      if (!content.data) {
        //   WITHOUT DOCUMENT
        // SEND MESSAGE
        sent = await session.sendMessage(session.user.id, {
          text: message,
        });

        // SAVE TO DB
        await db.historyMessageWA.create({
          data: {
            payload: msg.content.toString(),
            status: true,
          },
        });
      } else {
        //   WITH DOCUEMNT
        const mimeType = getMimeTypeFromName(content.filename);
        const extCategory = this.getFileCategory(content.filename);
        const decodedFile = Buffer.from(content.data, "base64");
        const folderName = join(__dirname, "../../uploads/wa");
        const newFilename = `${Date.now()}_${content.filename}`;
        const filePath = join(folderName, newFilename);

        //   CREATE FOLDER
        if (!fs.existsSync(folderName)) {
          logger.info("create folderName", folderName);
          fs.mkdirSync(folderName, { recursive: true });
        }

        //   SAVE FILE
        fs.writeFileSync(filePath, decodedFile as Uint8Array);

        // SEND MESSAGE BASED ON MEDIA
        switch (extCategory) {
          case "image":
            sent = await session.sendMessage(session.user.id, {
              caption: message,
              image: fs.readFileSync(filePath),
              mimetype: mimeType,
            });
            break;
          case "video":
            sent = await session.sendMessage(session.user.id, {
              video: fs.readFileSync(filePath),
              caption: message,
              mimetype: mimeType,
            });
            break;
          default:
            sent = await session.sendMessage(session.user.id, {
              caption: message,
              document: fs.readFileSync(filePath),
              fileName: content.filename,
              mimetype: mimeType,
            });
            break;
        }

        // SAVE TO DB
        await db.historyMessageWA.create({
          data: {
            payload: msg.content.toString(),
            status: true,
            file_path: `/uploads/wa/${newFilename}`,
            filename: content.filename,
            mime_type: mimeType,
          },
        });
      }

      //   REMOVE MESSAGE FROM QUEUE
      channel.ack(msg);
      logger.debug(sent);
    } catch (error) {
      if (msg) {
        channel.ack(msg);
      }
      logger.error(error);
    } finally {
      // CLOSE CONNECTION
      await channel.close();
      await connection.close();
    }
  }

  public getFileCategory(filename: string): FileCategory {
    const ext = path.extname(filename).toLowerCase();

    if (fileCategories.image.includes(ext)) return "image";
    if (fileCategories.video.includes(ext)) return "video";
    return "document"; // Default untuk dokumen
  }

  public isValidExt(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();

    if (fileCategories.image.includes(ext)) return true;
    if (fileCategories.video.includes(ext)) return true;
    if (fileCategories.document.includes(ext)) return true;
    return false;
  }

  public validateContent(msg: GetMessage): boolean {
    try {
      const content = JSON.parse(msg.content.toString()) as Content;

      if ("data" in content) {
        return "filename" in content && this.isValidExt(content.filename);
      }

      return "message" in content;
    } catch (error) {
      logger.error(Error);
      return false;
    }
  }
}
