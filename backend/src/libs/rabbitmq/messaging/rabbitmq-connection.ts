import { logger } from "@/utils/logger";
import amqp, { Connection, Channel } from "amqplib";
import { EventEmitter } from "events";

/**
 * RabbitMQ connection manager class
 * Handles connection, reconnection, and provides channels
 */
export class RabbitMQConnection {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private url: string;
  private connectionRetryDelay: number;
  private maxRetries: number;
  private retryCount = 0;
  private eventEmitter: EventEmitter = new EventEmitter();
  private isConnecting = false;

  /**
   * Creates a new RabbitMQ connection manager
   * @param url - RabbitMQ connection URL
   * @param connectionRetryDelay - Delay in ms between connection retries
   * @param maxRetries - Maximum number of reconnection attempts (0 for infinite)
   */
  constructor(
    url = "amqp://localhost:5672",
    connectionRetryDelay = 5000,
    maxRetries = 0,
  ) {
    this.url = url;
    this.connectionRetryDelay = connectionRetryDelay;
    this.maxRetries = maxRetries;
  }

  /**
   * Connects to RabbitMQ and creates a channel
   * @returns A Promise resolving to the current channel
   */
  public async connect(): Promise<Channel> {
    if (this.channel) {
      return this.channel;
    }

    if (this.isConnecting) {
      return new Promise(resolve => {
        this.eventEmitter.once("connected", () => {
          resolve(this.channel);
        });
      });
    }

    this.isConnecting = true;

    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();
      this.retryCount = 3;

      logger.info("Successfully connected to RabbitMQ");

      this._setupConnectionListeners();

      this.isConnecting = false;
      this.eventEmitter.emit("connected");

      return this.channel;
    } catch (error) {
      this.isConnecting = false;
      return this._handleConnectionError(error);
    }
  }

  /**
   * Gets the current channel or establishes a connection if needed
   * @returns A Promise resolving to the current channel
   */
  public async getChannel(): Promise<Channel> {
    return this.connect();
  }

  /**
   * Closes the connection gracefully
   */
  public async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }

      if (this.connection) {
        await this.connection.close();
      }

      this.channel = null;
      this.connection = null;

      logger.info("RabbitMQ connection closed gracefully");
    } catch (error) {
      logger.error("Error closing RabbitMQ connection:", error);
      throw error;
    }
  }

  /**
   * Sets up event listeners for the connection
   * @private
   */
  private _setupConnectionListeners(): void {
    if (!this.connection) return;

    this.connection.on("error", error => {
      logger.warn("RabbitMQ connection error:", error.message);
    });

    this.connection.on("close", async () => {
      logger.warn(
        "RabbitMQ connection closed unexpectedly, attempting to reconnect...",
      );
      this.channel = null;
      this.connection = null;

      // Attempt to reconnect
      setTimeout(() => {
        this.connect().catch(logger.error);
      }, this.connectionRetryDelay);
    });
  }

  /**
   * Handles connection errors and implements retry logic
   * @param error - The connection error
   * @private
   */
  private async _handleConnectionError(error: any): Promise<Channel> {
    logger.error("Failed to connect to RabbitMQ:", error.message);

    this.retryCount++;

    if (this.maxRetries > 0 && this.retryCount > this.maxRetries) {
      logger.error(
        `Maximum retry attempts (${this.maxRetries}) reached. Giving up.`,
      );
      throw new Error(
        "Failed to connect to RabbitMQ: maximum retry attempts reached",
      );
    }

    logger.info(
      `Retrying connection in ${this.connectionRetryDelay}ms (attempt ${this.retryCount})...`,
    );

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.connect().then(resolve).catch(reject);
      }, this.connectionRetryDelay);
    });
  }
}
