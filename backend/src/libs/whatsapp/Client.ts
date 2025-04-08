import { UnionTypeWithString } from "@/utils/utils";
import makeWASocket, { proto } from "@whiskeysockets/baileys";
import fs from "fs";

type SessionType = {
  isStop: boolean;
} & ReturnType<typeof makeWASocket>;

class Client {
  private client: SessionType;
  private from: string;
  constructor(client: SessionType, target = null) {
    this.client = client;
    this.from = target || null;
  }

  setTarget(target: string) {
    this.from = target;
  }

  async sendText(text: string) {
    try {
      const mentions = [...text.matchAll(/@(\d{0,16})/g)].map(
        v => v[1] + "@s.whatsapp.net",
      );
      return await this.client.sendMessage(this.from, {
        text,
        mentions,
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async reply(text: string, quoted: proto.IWebMessageInfo) {
    try {
      const mentions = [...text.matchAll(/@(\d{0,16})/g)].map(
        v => v[1] + "@s.whatsapp.net",
      );
      return await this.client.sendMessage(
        this.from,
        { text, mentions },
        { quoted },
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  async sendLocation(lat: number, long: number) {
    try {
      return await this.client.sendMessage(this.from, {
        location: { degreesLatitude: lat, degreesLongitude: long },
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async sendMedia(
    path: string,
    filename: string,
    mimeType: string,
    caption = "",
    category: UnionTypeWithString<"image" | "video" | "document">,
  ): Promise<proto.WebMessageInfo | undefined> {
    try {
      let sent: proto.WebMessageInfo;
      switch (category) {
        case "image":
          sent = await this.client.sendMessage(this.from, {
            caption: caption,
            image: fs.readFileSync(path),
            fileName: filename,
            mimetype: mimeType,
          });
          break;
        case "video":
          sent = await this.client.sendMessage(this.from, {
            video: fs.readFileSync(path),
            caption: caption,
            fileName: filename,
            mimetype: mimeType,
          });
          break;
        default:
          sent = await this.client.sendMessage(this.from, {
            caption: caption,
            document: fs.readFileSync(path),
            fileName: filename,
            mimetype: mimeType,
          });
          break;
      }

      return sent;
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default Client;
