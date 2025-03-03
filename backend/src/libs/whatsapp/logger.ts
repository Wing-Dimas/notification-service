import { LOG_PATH_WHATSAPP, SESSION_NAME } from "@/config";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import pino, { type Logger } from "pino";

export const logDir: string = join(__dirname, LOG_PATH_WHATSAPP);

if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

const logFileDir = join(logDir, `${SESSION_NAME}.txt`);

if (!existsSync(logFileDir)) {
  writeFileSync(logFileDir, "");
}

export const logger: Logger = pino({
  timestamp: () => `,"time":"${new Date().toJSON()}"`,
  transport: {
    targets: [
      {
        level: "debug",
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    ],
  },
  mixin(mergeObject, level) {
    return {
      ...mergeObject,
      level: level,
    };
  },
});
