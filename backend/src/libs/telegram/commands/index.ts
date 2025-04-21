import { CommandHandler } from "../types";
import { startCommand } from "./start.command";

// Add all command handlers here
const commands: CommandHandler[] = [
  startCommand,
  // Add new commands here
];

export default commands;
