// File: src/types/telegram.types.ts
import TelegramBot from "node-telegram-bot-api";

export interface BotConfig {
  token: string;
  polling?: boolean;
  webhook?: {
    url: string;
    port: number;
    host?: string;
    path?: string;
  };
}

export interface UserInfo {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface MessageContext {
  messageId: number;
  user: UserInfo;
  chatId: number;
  text: string;
  date: number;
  entities?: any[];
  args?: string[]; // Command arguments
  bot: TelegramBot; // Reference to bot instance for advanced usage
}

export interface CommandHandler {
  command: string;
  description: string;
  handler: (ctx: MessageContext) => Promise<void> | void;
}
