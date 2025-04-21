// File: src/services/TelegramBotService.ts
import { EventEmitter } from "events";
import TelegramBot from "node-telegram-bot-api";
import { BotConfig, MessageContext, CommandHandler } from "./types";
import { Stream } from "stream";
import { logger } from "@/utils/logger";

export class TelegramBotService extends EventEmitter {
  private bot: TelegramBot;
  private readonly config: BotConfig;
  private commandHandlers: Map<string, CommandHandler>;

  constructor(config: BotConfig) {
    super();
    this.config = config;
    this.commandHandlers = new Map();

    if (this.config.webhook) {
      this.bot = new TelegramBot(this.config.token, {
        webHook: {
          port: this.config.webhook.port,
          host: this.config.webhook.host || "0.0.0.0",
        },
      });

      const webhookPath = this.config.webhook.path || "/bot";
      this.bot.setWebHook(`${this.config.webhook.url}${webhookPath}`);
    } else {
      this.bot = new TelegramBot(this.config.token, {
        polling: this.config.polling || true,
      });
    }

    this.registerBaseHandlers();
  }

  /**
   * Initialize bot event listeners
   */
  private registerBaseHandlers(): void {
    // Listen for any message
    this.bot.on("message", msg => {
      const context = this.createContext(msg);
      this.emit("message", context);

      // Handle commands
      if (
        msg.entities &&
        msg.entities.some(entity => entity.type === "bot_command")
      ) {
        const commandText = msg.text.split(" ")[0].substring(1);
        const args = msg.text.split(" ").slice(1);

        // Add arguments to context
        context.args = args;

        const commandHandler = this.commandHandlers.get(commandText);
        if (commandHandler) {
          try {
            commandHandler.handler(context);
          } catch (error) {
            this.emit("command_error", {
              error,
              command: commandText,
              context,
            });
            logger.error(`Error handling command ${commandText}:`, error);
          }
        }
      }
    });

    this.bot.on("callback_query", query => {
      const data = query.data || "";
      // const context = this.createContext(query.message);

      if (data === "copyid") {
        this.bot.sendMessage(query.message.chat.id, query.from.id.toString());
      } else if (data === "copyusername") {
        this.bot.sendMessage(
          query.message.chat.id,
          query.from.username || "tidak ada",
        );
      }
    });

    // Handle errors
    this.bot.on("polling_error", error => {
      this.emit("error", error);
    });

    this.bot.on("webhook_error", error => {
      this.emit("error", error);
    });
  }

  /**
   * Create a standardized context object from Telegram message
   */
  private createContext(msg: TelegramBot.Message): MessageContext {
    return {
      messageId: msg.message_id,
      user: {
        id: msg.from.id,
        first_name: msg.from.first_name,
        last_name: msg.from.last_name,
        username: msg.from.username,
        language_code: msg.from.language_code,
      },
      chatId: msg.chat.id,
      text: msg.text || "",
      date: msg.date,
      entities: msg.entities,
      bot: this.bot, // Pass bot instance for advanced usage
    };
  }

  /**
   * Register a command handler
   */
  public registerCommand(handler: CommandHandler): void {
    this.commandHandlers.set(handler.command, handler);
  }

  /**
   * Register multiple command handlers
   */
  public registerCommands(handlers: CommandHandler[]): void {
    handlers.forEach(handler => {
      this.registerCommand(handler);
    });
  }

  /**
   * Update bot commands list in Telegram
   */
  public async updateCommandsList(): Promise<boolean> {
    const commands = Array.from(this.commandHandlers.values()).map(handler => ({
      command: handler.command,
      description: handler.description,
    }));

    return this.bot.setMyCommands(commands);
  }

  /**
   * Helper methods for common bot actions
   */
  public sendMessage(
    chatId: number,
    text: string,
    options?: TelegramBot.SendMessageOptions,
  ): Promise<TelegramBot.Message> {
    return this.bot.sendMessage(chatId, text, options);
  }

  public sendPhoto(
    chatId: number,
    photo: string | Buffer | Stream,
    options?: TelegramBot.SendPhotoOptions,
  ): Promise<TelegramBot.Message> {
    return this.bot.sendPhoto(chatId, photo, options);
  }

  public sendDocument(
    chatId: number,
    document: string | Buffer | Stream,
    options?: TelegramBot.SendDocumentOptions,
  ): Promise<TelegramBot.Message> {
    return this.bot.sendDocument(chatId, document, options);
  }

  public async getBotInfo(): Promise<TelegramBot.User> {
    return this.bot.getMe();
  }

  /**
   * Get Express middleware for webhook
   */
  public getWebhookMiddleware(
    path: string,
  ): (req: any, res: any, next: any) => void {
    if (!this.config.webhook) {
      throw new Error("Webhook is not configured");
    }

    return (req, res, next) => {
      if (req.url === path && req.method === "POST") {
        let body = "";
        req.on("data", chunk => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const update = JSON.parse(body);
            this.bot.processUpdate(update);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "ok" }));
          } catch (error) {
            logger.error("Error processing webhook update:", error);
            res.writeHead(500);
            res.end();
          }
        });
      } else {
        next();
      }
    };
  }

  /**
   * Get bot instance directly if needed
   */
  public getBotInstance(): TelegramBot {
    return this.bot;
  }
}
