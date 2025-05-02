import { isJidUser } from "@whiskeysockets/baileys";
import chalk from "chalk";

export const shouldIgnoreJid = (jid: string): boolean => {
  return !isJidUser(jid);
};

export const color = (text: string, color: string) => {
  return !color
    ? chalk.green(text)
    : color.startsWith("#")
    ? chalk.hex(color)(text)
    : chalk.keyword(color)(text);
};
