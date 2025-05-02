import { HttpException } from "@/exceptions/HttpException";
import { WhatsappClient } from "@/libs/whatsapp";

class SessionService {
  // public async createNewSession(): Promise<void> {
  //   try {
  //     await this.createSession(SESSION_NAME);
  //   } catch (error) {
  //     throw new HttpException(500, `Internal Server Error: ${error.message}`);
  //   }
  // }

  // public async startSession(): Promise<void> {
  //   try {
  //     await this.createSession(SESSION_NAME);
  //   } catch (error) {
  //     throw new HttpException(500, `Internal Server Error: ${error.message}`);
  //   }
  // }
  public async getStatus(): Promise<string | null> {
    try {
      if (!WhatsappClient.getInstance())
        throw new HttpException(503, "WhatsApp service not running");

      const status = WhatsappClient.getInstance().isConnected
        ? "CONNECTED"
        : "DISCONNECTED";
      return status;
    } catch (error) {
      throw new HttpException(500, `Internal Server Error: ${error.message}`);
    }
  }
}

export default SessionService;
