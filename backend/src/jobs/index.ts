import cron from "node-cron";
import ListenMessageWAFromAMQP from "./listen-message-wa-from-amqp.job";
import ListenMessageTelegramFromAMQP from "./listen-message-telegram-from-amqp.job";

export default class Schedule {
  public static async run() {
    // WHATSAPP
    cron.schedule("*/10 * * * * *", () => {
      new ListenMessageWAFromAMQP();
    });

    // TELEGRAM
    cron.schedule("*/1 * * * * *", () => {
      new ListenMessageTelegramFromAMQP();
    });
  }
}
