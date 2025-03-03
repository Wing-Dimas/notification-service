import { NODE_ENV } from "@/config";
import { Content, Headers } from "@/interfaces/amqp.interface";
import ConnectionSession from "@/libs/whatsapp/ConnectionSession";
import { logger } from "@/utils/logger";
import { getAMQPConnection } from "@/utils/utils";
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

export default class ListenMessageFromAMQP {
  private readonly channelName = "notification";
  private readonly queueName = "whatsapp";
  private readonly virtualHostName = "/";

  constructor() {
    this.handler();
  }

  public async handler() {
    const session = new ConnectionSession().getClient();

    if (!session?.user?.id || session?.isStop) return;

    const { connection, channel } = await getAMQPConnection(
      this.virtualHostName,
    );

    const msg = await channel.get(this.queueName);
    try {
      if (!msg) {
        if (NODE_ENV === "development") {
          logger.info("No more messages in the queue. Exiting...");
        }
        return;
      }

      //   const headers: Headers = msg.properties.headers as Headers;
      const content: Content = JSON.parse(msg.content.toString()) as Content;

      const message = content.message ?? "";

      let sent: proto.IWebMessageInfo;

      //   WITHOUT DOCUMENT
      if (!content.data) {
        sent = await session.sendMessage(session.user.id, {
          text: message,
        });
        channel.ack(msg);

        return;
      }

      //   WITH DOCUEMNT
      const extCategory = this.getFileCategory(content.filename);
      const dencodedFile = Buffer.from(content.data, "base64");
      const folderName = join(__dirname, "../../uploads");
      const filePath = join(
        __dirname,
        `../../uploads/${Date.now()}_${content.filename}`,
      );

      //   CREATE FOLDER
      if (!fs.existsSync(folderName)) {
        logger.info("create folderName", folderName);
        fs.mkdirSync(folderName, { recursive: true });
      }

      //   SAVE FILE
      fs.writeFileSync(filePath, dencodedFile as Uint8Array);

      switch (extCategory) {
        case "image":
          sent = await session.sendMessage(session.user.id, {
            caption: message,
            image: fs.readFileSync(filePath),
          });
          break;
        case "video":
          sent = await session.sendMessage(session.user.id, {
            video: fs.readFileSync(filePath),
            caption: message,
          });
          break;
        default:
          sent = await session.sendMessage(session.user.id, {
            // text: message,
            caption: message,
            document: fs.readFileSync(filePath),
            fileName: content.filename,
            mimetype: "application/pdf",
          });
          break;
      }

      console.log(sent);

      channel.ack(msg);
    } catch (error) {
      if (msg) {
        channel.ack(msg);
      }
      logger.error(error);
    } finally {
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

  public saveMessage(msg: GetMessage) {
    if (!msg) return;
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
