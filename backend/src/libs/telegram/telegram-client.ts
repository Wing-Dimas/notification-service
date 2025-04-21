import { NODE_ENV, TELEGRAM_BOT_TOKEN } from "@/config";
import commands from "./commands";
import { TelegramBotService } from "./telegram-bot-service";
import { logger } from "@/utils/logger";

export const telegramBotClient = new TelegramBotService({
  token: TELEGRAM_BOT_TOKEN || "",
  // Choose between polling (development) or webhook (production)
  polling: NODE_ENV !== "production",
  // webhook: process.env.NODE_ENV === 'production' ? {
  //   url: process.env.WEBHOOK_URL || '',
  //   port: Number(process.env.PORT) || 3000,
  //   path: '/webhook'
  // } : undefined
});
// Register all commands
telegramBotClient.registerCommands(commands);

// Update commands list in Telegram
telegramBotClient
  .updateCommandsList()
  .then(() => logger.info("TelegramBot commands have been updated"))
  .catch(error => logger.error("Failed to update bot commands:", error));

// Listen for all messages (for logging, analytics, etc.)
telegramBotClient.on("message", ctx => {
  logger.info(`Received message from ${ctx.user.first_name}: ${ctx.text}`);
});

// Handle command errors
telegramBotClient.on("command_error", ({ error, command, context }) => {
  logger.error(`Error in command ${command}:`, error);

  // Notify user about error
  telegramBotClient.sendMessage(
    context.chatId,
    "Maaf, terjadi kesalahan saat menjalankan perintah. Silakan coba lagi nanti.",
  );
});

// Handle general bot errors
telegramBotClient.on("error", error => {
  logger.error("Bot error:", error);
});
