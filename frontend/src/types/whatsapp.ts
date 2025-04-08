import { IMessageAttachment } from "./message-attachments";

export interface IMessageWA {
  id: number;
  payload: string;
  status: boolean;
  sender?: string;
  receiver?: string;
  message_attachments?: IMessageAttachment[];
  created_at?: string;
  updated_at?: string;
  sent_at?: string;
  deleted_at?: string;
}
