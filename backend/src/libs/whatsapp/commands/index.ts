import { CommandHandler } from "../types";
import { pingCommand } from "./ping.command";

// Add all command handlers here
const commands: CommandHandler[] = [
  pingCommand,
  // Add new commands here
];

export default commands;
