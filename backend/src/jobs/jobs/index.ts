import BaseJob from "../base-job";
import ListenMessageTelegramFromAMQPJob from "./listen-message-telegram-from-amqp.job";
import ListenMessageWAFromAMQPJob from "./listen-message-wa-from-amqp.job";

export interface JobClass {
  new (): BaseJob;
}

/**
 * Registry of all application jobs to be executed.
 * List of jobs to be executed.
 */
export const jobs: JobClass[] = [
  ListenMessageWAFromAMQPJob,
  ListenMessageTelegramFromAMQPJob,
  // Add more jobs here ...
];
