import { config } from "dotenv";
config({ path: `.env` });

export const CREDENTIALS = process.env.CREDENTIALS === "true";
export const {
  NODE_ENV,
  PORT,
  JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  SESSION_NAME,
  SESSION_PATH,
  LOG_PATH_WHATSAPP,
  AMQP_URL,
  AMQP_EXCHANGE,
  TELEGRAM_BOT_LINK,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_WEBHOOK_URL,
  TELEGRAM_WEBHOOK_PORT,
} = process.env;
