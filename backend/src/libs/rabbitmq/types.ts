import { Channel, ConsumeMessage } from "amqplib";

/**
 * Abstract message broker interface
 * Provides a clean abstraction for messaging
 */
export interface MessageBroker {
  publish(topic: string, message: any, options?: any): Promise<boolean>;
  subscribe(
    topic: string,
    handler: (message: any) => Promise<void>,
    options?: any,
  ): Promise<string>;
  unsubscribe(subscriptionId: string): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

/**
 * Options for publishing a message
 */
export interface PublishOptions {
  exchange?: string;
  routingKey?: string;
  persistent?: boolean;
  contentType?: string;
  headers?: Record<string, any>;
  messageId?: string;
  correlationId?: string;
  replyTo?: string;
  expiration?: string;
  timestamp?: number;
}

/**
 * Options for consuming messages
 */
export interface ConsumeOptions {
  exchange?: string;
  queue?: string;
  routingKey?: string;
  prefetch?: number;
  queueDurable?: boolean;
  exclusive?: boolean;
  autoDelete?: boolean;
  withDelay?: boolean;
  delayMS?: number;
}

/**
 * Message handler type
 */
export type MessageHandler = (
  message: any,
  originalMessage: ConsumeMessage,
  channel: Channel,
) => Promise<void>;
