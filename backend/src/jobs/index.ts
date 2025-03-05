import cron from "node-cron";
import ListenMessageWAFromAMQP from "./listen-message-wa-from-amqp.job";

export default class Schedule {
  public static async run() {
    // RABBITMQ
    cron.schedule("*/10 * * * * *", () => {
      new ListenMessageWAFromAMQP();
    });
  }
}
