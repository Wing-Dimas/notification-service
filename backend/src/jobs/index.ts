import cron from "node-cron";
import ListenMessageFromAMQP from "./listen-message-from-amqp.job";

export default class Schedule {
  public static async run() {
    // RABBITMQ
    cron.schedule("*/10 * * * * *", () => {
      new ListenMessageFromAMQP();
    });
  }
}
