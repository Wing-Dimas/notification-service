import { AMQP_URL } from "@/config";
import amqp, { Channel, Connection } from "amqplib";

class AMQPClient {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly connectionString: string;

  constructor(vhost = "/") {
    this.connectionString = AMQP_URL + vhost;
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

  public ack(message: amqp.GetMessage): void {
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
  }
}

export default AMQPClient;
