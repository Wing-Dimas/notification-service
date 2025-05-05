import { RabbitMQConnection } from "./rabbitmq-connection";
import { ConsumeOptions, MessageHandler } from "../types";
import { GetMessage, Options } from "amqplib";
import { RateLimiter } from "limiter";
import { logger } from "@/utils/logger";

/**
 * RabbitMQ message consumer
 */
export class RabbitMQConsumer {
  private connection: RabbitMQConnection;

  /**
   * Creates a new RabbitMQ consumer
   * @param connection - RabbitMQ connection instance
   */
  constructor(connection: RabbitMQConnection) {
    this.connection = connection;
  }

  /**
   * Sets up a consumer with the provided options and message handler
   * @param options - Consume options
   * @param handler - Message handler function
   * @returns Promise resolving to the consumer tag
   */
  public async consume(
    options: ConsumeOptions,
    handler: MessageHandler,
  ): Promise<string> {
    const channel = await this.connection.getChannel();
    let limiter: RateLimiter;

    // Set prefetch if provided
    if (options.prefetch) {
      await channel.prefetch(options.prefetch);
    }

    if (options.withDelay) {
      limiter = new RateLimiter({
        tokensPerInterval: 1,
        interval: options.delayMS,
      });
    }

    // Ensure exchange exists
    await channel.assertExchange(options.exchange, "direct", { durable: true });

    // Create queue
    const queueOptions: Options.AssertQueue = {
      durable: options.queueDurable ?? true,
      exclusive: options.exclusive ?? false,
      autoDelete: options.autoDelete ?? false,
      arguments: {
        "x-queue-type": "quorum",
      },
    };

    const { queue } = await channel.assertQueue(options.queue, queueOptions);

    // Bind queue to exchange with routing keys
    await channel.bindQueue(queue, options.exchange, options.routingKey);

    logger.info(
      `Consumer ready, listening on queue ${queue}, exchange ${options.exchange}, routing keys ${options.routingKey}`,
    );

    // Start consuming
    const consumerTag = await channel.consume(
      queue,
      async msg => {
        if (!msg) return;

        if (options.withDelay) await limiter.removeTokens(1);

        try {
          // Acknowledge successful processing
          channel.ack(msg);

          const content = JSON.parse(msg.content.toString());
          await handler(content, msg, channel);
        } catch (error) {
          logger.error("Error processing message:", error);

          // Reject the message and requeue it
          channel.nack(msg, false, true);
        }
      },
      { noAck: false },
    );

    return consumerTag.consumerTag;
  }

  public async getMessage(
    queueName: string,
    options?: ConsumeOptions,
  ): Promise<GetMessage | false> {
    const channel = await this.connection.getChannel();

    // Ensure exchange exists
    await channel.assertExchange(options.exchange, "direct", { durable: true });

    return await channel.get(queueName);
  }

  /**
   * Cancels a consumer by tag
   * @param consumerTag - The consumer tag to cancel
   */
  public async cancelConsumer(consumerTag: string): Promise<void> {
    const channel = await this.connection.getChannel();
    await channel.cancel(consumerTag);
  }
}
