import { AMQP_URL } from "@/config";
import { logger } from "@/utils/logger";
import amqp, { Channel, Connection } from "amqplib";

class AMQPClient {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly connectionString: string;
  private consumerTags = new Map();

  constructor(vhost = "/") {
    this.connectionString = AMQP_URL + vhost;
    this.consumerTags = new Map();
  }

  public async connect(): Promise<Channel> {
    try {
      this.connection = await amqp.connect(this.connectionString);

      this.channel = await this.connection.createChannel();

      return this.channel;
    } catch (error) {
      throw new Error("Failed to connect to RabbitMQ:" + error);
    }
  }

  public async createQueue(
    queueName: string,
    options: amqp.Options.AssertQueue = { durable: true },
  ): Promise<amqp.Replies.AssertQueue> {
    if (!this.channel) {
      await this.connect();
    }

    if (!this.channel) {
      throw new Error("Channel is not available");
    }

    return await this.channel.assertQueue(queueName, options);
  }

  public async getMessage(
    queueName: string,
    options?: amqp.Options.Get,
  ): Promise<amqp.GetMessage | false> {
    if (!this.channel) {
      await this.connect();
    }

    if (!this.channel) {
      throw new Error("Channel is not available");
    }

    return await this.channel.get(queueName, options || {});
  }

  public ack(message: amqp.GetMessage | amqp.ConsumeMessage): void {
    if (!this.channel) {
      throw new Error("Channel is not available");
    }

    this.channel.ack(message);
  }

  public async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }

    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }

    this.consumerTags.clear();
  }

  public async consume(
    queueName: string,
    cb: (
      content: string,
      msg: amqp.ConsumeMessage,
      channel: amqp.Channel,
    ) => Promise<void>,
    consumeOptions: amqp.Options.Consume = { noAck: false },
  ): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }

    if (!this.channel) {
      this.channel = await this.connection.createChannel();
    }

    const consumerTag = await this.channel.consume(
      queueName,
      async msg => {
        if (msg === null) {
          logger.warn(`Consumer was cancelled for queue ${queueName}`);
          return;
        }

        try {
          const content = msg.content.toString();

          await cb(content, msg, this.channel);

          if (!consumeOptions.noAck) {
            this.ack(msg);
          }
        } catch (error) {
          logger.error(`Error processing message from ${queueName}:`, error);
        }
      },
      consumeOptions,
    );

    const queueConfig = JSON.stringify([
      queueName,
      cb.toString(),
      consumeOptions,
    ]);
    this.consumerTags.set(queueConfig, consumerTag);
  }
}

export default AMQPClient;
