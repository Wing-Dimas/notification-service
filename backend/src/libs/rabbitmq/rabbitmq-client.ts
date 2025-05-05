import { RabbitMQBroker } from "./rabbitmq-broker";

/**
 * Singleton class to manage a single RabbitMQ connection across the application
 */
export class RabbitMQClient {
  private static instance: RabbitMQBroker;
  private static isInitialized = false;
  private static consumerTags = new Map<string, string>();

  /**
   * Initialize the RabbitMQ singleton with connection parameters
   * @param url - RabbitMQ connection URL
   * @param defaultExchange - Default exchange name
   * @param connectionRetryDelay - Delay in ms between connection retries
   * @param maxRetries - Maximum number of reconnection attempts (0 for infinite)
   */
  public static async initialize(
    url = "amqp://localhost:5672",
    defaultExchange = "app.events",
    connectionRetryDelay = 5000,
    maxRetries = 0,
  ): Promise<void> {
    if (this.isInitialized) {
      console.log("RabbitMQ client is already initialized");
      return;
    }

    this.instance = new RabbitMQBroker(
      url,
      defaultExchange,
      connectionRetryDelay,
      maxRetries,
    );

    this.isInitialized = true;
  }

  /**
   * Get the singleton instance
   * @returns The singleton instance
   */
  public static getInstance(): RabbitMQBroker {
    this.ensureInitialized();
    return this.instance;
  }

  /**
   * Close the RabbitMQ connection
   */
  public static async close(): Promise<void> {
    if (this.isInitialized) {
      await this.instance.disconnect();
      this.isInitialized = false;
    }
  }

  /**
   * Register a consumer tag for later cancellation
   * @param tag - Consumer tag returned by consume() method
   */
  public static registerConsumerTag(tag: string, consumerTag: string): void {
    this.consumerTags.set(tag, consumerTag);
  }

  /**
   * Get a consumer tag for a given tag
   * @param tag - Unique tag to identify the consumer
   * @returns The consumer tag string
   */
  public static getConsumerTags(tag: string): string {
    return this.consumerTags.get(tag);
  }

  /**
   * Clear all consumer tags
   * This is useful when the process restarts and all consumer tags are no longer valid
   */
  public static clearConsumerTags(): void {
    this.consumerTags.clear();
  }

  /**
   * Ensure the singleton has been initialized
   * @private
   */
  private static ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(
        "RabbitMQ singleton has not been initialized. Call initialize() first.",
      );
    }
  }
}
