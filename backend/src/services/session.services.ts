import { SESSION_NAME } from "@/config";
import { HttpException } from "@/exceptions/HttpException";
import ConnectionSession from "@/libs/whatsapp/ConnectionSession";
import fs from "fs";

class SessionService extends ConnectionSession {
  public async createNewSession(): Promise<void> {
    try {
      if (!(fs.readdirSync(this.sessionPath).length < 2)) {
        throw new HttpException(400, "Session already exists");
      }

      if (fs.existsSync(`${this.sessionPath}/${SESSION_NAME}`)) {
        throw new HttpException(409, "Session already exists");
      }

      await this.createSession(SESSION_NAME);
    } catch (error) {
      throw new HttpException(500, `Internal Server Error: ${error.message}`);
    }
  }
}

export default SessionService;
