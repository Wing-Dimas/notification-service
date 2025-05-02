import { WAMessage, WASocket } from "@whiskeysockets/baileys";

export interface MessageContext {
  socket: WASocket;
  message: WAMessage;
  sender?: string;
  senderName?: string;
}

export interface CommandHandler {
  pattren: string;
  description: string;
  handler: (ctx: MessageContext) => Promise<void> | void;
}
