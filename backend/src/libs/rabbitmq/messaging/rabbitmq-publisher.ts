import { Channel } from "amqplib";
import { RabbitMQConnection } from "./rabbitmq-connection";
import { PublishOptions } from "../types";

/**
 * RabbitMQ message publisher
 */
export class RabbitMQPublisher {
  private connection: RabbitMQConnection;

  /**
   * Creates a new RabbitMQ publisher
   * @param connection - RabbitMQ connection instance
   */
  constructor(connection: RabbitMQConnection) {
    this.connection = connection;
  }

  /**
   * Publishes a message to RabbitMQ
   * @param message - Message content (will be JSON stringified)
   * @param options - Publishing options
   * @returns Promise resolving to true if successful
   */
  public async publish(
    message: any,
    options: PublishOptions,
  ): Promise<boolean> {
    const channel = await this.connection.getChannel();

    // Ensure the exchange exists
    await this._assertExchange(channel, options.exchange);

    const messageContent = Buffer.from(JSON.stringify(message));

    return channel.publish(
      options.exchange,
      options.routingKey,
      messageContent,
      {
        persistent: options.persistent ?? true,
        contentType: options.contentType ?? "application/json",
        headers: options.headers ?? {},
        messageId: options.messageId,
        correlationId: options.correlationId,
        replyTo: options.replyTo,
        expiration: options.expiration,
        timestamp: options.timestamp ?? Math.floor(Date.now() / 1000),
      },
    );
  }

  /**
   * Ensures an exchange exists
   * @param channel - AMQP channel
   * @param exchange - Exchange name
   * @private
   */
  private async _assertExchange(
    channel: Channel,
    exchange: string,
  ): Promise<void> {
    await channel.assertExchange(exchange, "direct", { durable: true });
  }
}
