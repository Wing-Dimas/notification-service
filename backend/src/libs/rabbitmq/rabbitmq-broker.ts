import {
  RabbitMQConnection,
  RabbitMQPublisher,
  RabbitMQConsumer,
} from "./messaging";
import {
  ConsumeOptions,
  MessageHandler,
  MessageBroker,
  PublishOptions,
} from "./types";
import { Channel, ConsumeMessage, GetMessage } from "amqplib";
import { randomBytes } from "crypto";

/**
 * RabbitMQ implementation of MessageBroker interface
 */
export class RabbitMQBroker implements MessageBroker {
  private connection: RabbitMQConnection;
  private publisher: RabbitMQPublisher;
  private consumer: RabbitMQConsumer;
  private defaultExchange: string;

  /**
   * Creates a new RabbitMQ broker
   * @param connectionUrl - RabbitMQ connection URL
   * @param defaultExchange - Default exchange name
   */
  constructor(
    connectionUrl = "amqp://localhost:5672",
    defaultExchange = "notification",
    connectionRetryDelay = 5000,
    maxRetries = 3,
  ) {
    this.connection = new RabbitMQConnection(
      connectionUrl,
      connectionRetryDelay,
      maxRetries,
    );
    this.publisher = new RabbitMQPublisher(this.connection);
    this.consumer = new RabbitMQConsumer(this.connection);
    this.defaultExchange = defaultExchange;
  }

  /**
   * Connect to RabbitMQ
   */
  public async connect(): Promise<void> {
    await this.connection.connect();
  }

  /**
   * Disconnect from RabbitMQ
   */
  public async disconnect(): Promise<void> {
    await this.connection.close();
  }

  /**
   * Publish a message to a topic
   * @param topic - Topic (routing key)
   * @param message - Message to publish
   * @param options - Additional publish options
   * @returns Promise resolving to true if successful
   */
  public async publish(
    topic: string,
    message: any,
    options?: PublishOptions,
  ): Promise<boolean> {
    const publishOptions: PublishOptions = {
      exchange: options?.exchange || this.defaultExchange,
      routingKey: topic,
      messageId: options?.messageId || randomBytes(8).toString(),
      correlationId: options?.correlationId,
      headers: options?.headers || {},
      ...options,
    };

    return this.publisher.publish(message, publishOptions);
  }

  /**
   * Subscribe to messages on a topic
   * @param topic - Topic pattern (routing key)
   * @param handler - Message handler function
   * @param options - Additional subscription options
   * @returns Promise resolving to the subscription ID
   */
  public async subscribe(
    topic: string,
    handler: (
      message: GetMessage,
      originalMessage: ConsumeMessage,
      channel: Channel,
    ) => Promise<void>,
    options?: ConsumeOptions,
  ): Promise<string> {
    const queueName = topic;

    const consumeOptions: ConsumeOptions = {
      exchange: options?.exchange || this.defaultExchange,
      queue: queueName,
      routingKey: topic,
      prefetch: options?.prefetch || 1,
      queueDurable: options?.queueDurable ?? true,
      exclusive: options?.exclusive ?? false,
      autoDelete: options?.autoDelete ?? false,
      withDelay: options?.withDelay ?? false,
      delayMS: options?.delayMS || 1000,
      ...options,
    };

    // Wrap the handler to extract just the content from the full message
    const messageHandler: MessageHandler = async (
      content: any,
      originalMessage: ConsumeMessage,
      channel: Channel,
    ) => {
      await handler(content, originalMessage, channel);
    };

    return this.consumer.consume(consumeOptions, messageHandler);
  }

  /**
   * Unsubscribe from a topic
   * @param subscriptionId - Subscription ID to cancel
   */
  public async unsubscribe(subscriptionId: string): Promise<void> {
    await this.consumer.cancelConsumer(subscriptionId);
  }
}
