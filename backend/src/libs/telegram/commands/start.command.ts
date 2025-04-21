import { logger } from "@/utils/logger";
import { CommandHandler, MessageContext } from "../types";
import TelegramBot from "node-telegram-bot-api";
import { db } from "@/libs/db";

export const startCommand: CommandHandler = {
  command: "start",
  description: "Mulai percakapan dengan bot",

  async handler(ctx: MessageContext): Promise<void> {
    const { chatId, user } = ctx;

    const options: TelegramBot.SendMessageOptions = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Copy ID",
              callback_data: "copyid",
            },
            {
              text: "Copy Username",
              callback_data: "copyusername",
            },
          ],
        ],
      },
    };

    await ctx.bot.sendMessage(
      chatId,
      `
Halo ${user.first_name}!\n
Selamat datang di bot kami.
Anda sekarang telah terhubung dengan bot kami.\n
Berikut adalah informasi Anda:
ID Anda: ${user.id}
Username: ${user.username || "tidak ada"}
    `,
      options,
    );

    // Log new user
    logger.info(`New user: ${user.first_name} (ID: ${user.id})`);

    try {
      await db.telegramUser.upsert({
        where: { chat_id: user.id },
        create: {
          chat_id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
        },
        update: {
          username: user.username || null,
          first_name: user.first_name,
          last_name: user.last_name || null,
        },
      });
      logger.info(
        `User ${user.first_name} (ID: ${user.id}) has been created or updated.`,
      );
    } catch (error) {
      logger.error(
        `Failed to create or update user ${user.first_name} (ID: ${user.id}): ${error.message}`,
      );
    }
  },
};
