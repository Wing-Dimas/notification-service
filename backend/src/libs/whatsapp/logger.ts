import fs from "fs";
import { join } from "path";
import pino from "pino";
import pinoms, { multistream } from "pino-multi-stream";

// Setup log directory
const logDir = join(__dirname, "../../logs/whatsapp");
const debugDir = join(logDir, "debug");
const errorDir = join(logDir, "error");

[logDir, debugDir, errorDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const date = new Date().toISOString().split("T")[0]; // e.g. 2025-04-30
const debugLogPath = join(debugDir, `${date}.log`);
const errorLogPath = join(errorDir, `${date}.log`);

const destinations: pinoms.Streams = [
  {
    level: "debug",
    stream: fs.createWriteStream(debugLogPath, { flags: "a" }),
  },
  {
    level: "error",
    stream: fs.createWriteStream(errorLogPath, { flags: "a" }),
  },
  {
    level: "info",
    stream: pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "yyyy-mm-dd HH:MM:ss",
        ignore: "pid,hostname",
      },
    }),
  },
];

// Combine multiple streams
const logger = pino(
  {
    level: "debug",
  },
  multistream(destinations),
);

// HTTP middleware compatible stream
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export { logger, stream };
