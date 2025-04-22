import commands from "./commands";
import { TelegramBotService } from "./telegram-bot-service";
import { logger } from "@/utils/logger";

export default class TelegramBotClient {
  private static botService: TelegramBotService | null = null;

  public static init({
    token,
    polling = true,
    webhook,
  }: {
    token: string;
    polling?: boolean;
    webhook?: {
      url: string;
      port: number;
      path?: string;
    };
  }) {
    if (!this.botService) {
      this.botService = new TelegramBotService({
        token,
        polling,
        webhook,
      });
    }
    // Register all commands
    this.botService.registerCommands(commands);

    // Update commands list in Telegram
    this.botService
      .updateCommandsList()
      .then(() => logger.info("TelegramBot commands have been updated"))
      .catch(error => logger.error("Failed to update bot commands:", error));

    // Listen for all messages (for logging, analytics, etc.)
    this.botService.on("message", ctx => {
      logger.info(`Received message from ${ctx.user.first_name}: ${ctx.text}`);
    });

    // Handle command errors
    this.botService.on("command_error", ({ error, command, context }) => {
      logger.error(`Error in command ${command}:`, error);

      // Notify user about error
      this.botService.sendMessage(
        context.chatId,
        "Maaf, terjadi kesalahan saat menjalankan perintah. Silakan coba lagi nanti.",
      );
    });

    // Handle general bot errors
    this.botService.on("error", error => {
      logger.error("Bot error:", error);
    });

    return this.botService;
  }

  public static getInstance() {
    if (!this.botService) {
      throw new Error(
        "TelegramBotClient is not initialized. Call init() first.",
      );
    }
    return this.botService;
  }
  public static getBotInfo() {
    if (!this.botService) {
      throw new Error(
        "TelegramBotClient is not initialized. Call init() first.",
      );
    }
    return this.botService.getBotInfo();
  }
}
