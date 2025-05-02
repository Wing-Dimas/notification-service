import { logger } from "@/utils/logger";
import commands from "./commands";
import WhatsappService from "./whatsaap-service";
import { socket } from "../socket";
import qrcode from "qrcode";
import { sleep } from "@/utils/utils";
import { color } from "./utils";
import { MessageContext } from "./types";

class WhatsappClient {
  private static whatsappBot: WhatsappService | null = null;

  /**
   * Initialize the whatsapp bot. If the bot is already initialized, this does nothing.
   * @param {string} [sessionName] - The name of the session. Defaults to "WHATSAPP".
   * @returns {Promise<void>}
   */
  public static async init({ sessionName }: { sessionName?: string }) {
    try {
      if (this.whatsappBot) {
        logger.info("WhatsappClient is already initialized.");
        return;
      }

      this.whatsappBot = new WhatsappService(sessionName || "WHATSAPP");

      this.whatsappBot.on("message", async (ctx: MessageContext) =>
        logger.info(ctx),
      );

      // handle qr code
      this.whatsappBot.on("qr", async qr => {
        const rawData = await qrcode.toDataURL(qr, { scale: 8 });
        const dataBase64 = rawData.replace(/^data:image\/png;base64,/, "");
        await sleep(3000);
        socket.emit(`update-qr`, {
          buffer: dataBase64,
          session_name: sessionName,
        });
        console.info(
          color("[SYS]", "#EB6112"),
          color(
            `[Session: ${sessionName}] Open the browser, a qr has appeared on the website, scan it now!`,
            "#E6B0AA",
          ),
        );
      });

      this.whatsappBot.on("connection-status", data => {
        logger.info(`Connection status: ${data.result}`);
      });

      this.whatsappBot.on("update-qr", data => {
        socket.emit(`update-qr`, data);
      });

      this.whatsappBot.on("ready", () => {
        console.info(
          color("[SYS]", "#EB6112"),
          color(`[Session: ${sessionName}] Whatsapp is ready!`, "#E6B0AA"),
        );
      });

      // register commands
      this.whatsappBot.registerCommands(commands);

      await this.whatsappBot.initialize().then(() => {
        if (!this.whatsappBot.isConnected) {
          this.whatsappBot = null;
          logger.info("WhatsappClient is not connected.");
          return;
        }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reinitializes the WhatsappClient. This method will disconnect the current session (if any),
   * and then initialize a new session with the given session name (if any). If no session name
   * is provided, the default session name "WHATSAPP" will be used. This method is useful if you
   * want to switch between different WhatsApp sessions without having to restart the server.
   * @param {Object} options - Options for the reinitialization process.
   * @param {string} [options.sessionName=WHATSAPP] - The name of the session to initialize.
   * @throws {Error} If the reinitialization process fails.
   * @returns {Promise<void>} A promise that resolves when the reinitialization is complete.
   */
  public static async reInitialize({ sessionName }: { sessionName?: string }) {
    try {
      await this.whatsappBot?.disconnect();
      this.whatsappBot = null;
      this.init({ sessionName });
    } catch (error) {
      throw "Failed to reinitialize WhatsappClient: " + error;
    }
  }

  /**
   * Disconnects the WhatsappClient from the WhatsApp Web API.
   * This method is idempotent, so you can call it multiple times without causing any issues.
   * @throws {Error} If WhatsappClient is not initialized.
   * @returns {Promise<void>} A promise that resolves when the disconnection is complete.
   */
  public static async disconnect() {
    try {
      if (!this.whatsappBot) {
        throw new Error(
          "WhatsappClient is not initialized. Call init() first.",
        );
      }
      await this.whatsappBot.disconnect();
    } catch (error) {
      throw "Failed to close WhatsappClient: " + error;
    }
  }

  public static setIsStop(isStop: boolean) {
    this.whatsappBot.setIsStop(isStop);
  }

  public static getIsStop() {
    return this.whatsappBot.getIsStop();
  }

  /**
   * Retrieves the singleton instance of WhatsappService.
   * @throws {Error} If WhatsappClient is not initialized.
   * @returns {WhatsappService} The instance of WhatsappService.
   */
  public static getInstance() {
    try {
      if (!this.whatsappBot) {
        return null;
      }
      return this.whatsappBot;
    } catch (error) {
      throw "Failed to get WhatsappClient instance: " + error;
    }
  }

  /**
   * Get the bot's info, including its name and phone number.
   * @throws {Error} If WhatsappClient is not initialized.
   * @returns {Promise<Contact>} The bot's info.
   */
  public static getBotInfo() {
    try {
      if (!this.whatsappBot) {
        throw new Error(
          "WhatsappClient is not initialized. Call init() first.",
        );
      }
      return this.whatsappBot.getBotInfo();
    } catch (error) {
      throw "Failed to get WhatsappClient bot info: " + error;
    }
  }
}

export default WhatsappClient;
