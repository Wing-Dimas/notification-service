import { CommandHandler } from "../types";

export const pingCommand: CommandHandler = {
  pattren: "^[.!/]ping$",
  description: "Ping the bot",

  handler: async ctx => {
    const { socket, message } = ctx;

    const isFromMe = message.key.fromMe;

    if (!isFromMe) return;

    await socket.sendMessage(socket.user.id, {
      text: "Pong!",
    });
  },
};
