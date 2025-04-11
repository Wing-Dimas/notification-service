import { IMessageAttachment } from "./message-attachments";

export interface IMessage {
  id: number;
  payload: string;
  status: boolean;
  sender?: string;
  receiver?: string;
  notification_type?: string;
  message_attachments?: IMessageAttachment[];
  created_at?: string;
  updated_at?: string;
  sent_at?: string | null;
  deleted_at?: string | null;
}
