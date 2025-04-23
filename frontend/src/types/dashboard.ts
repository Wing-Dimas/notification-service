import { IMessage } from "./message";

export interface IDashboardData {
  total: number;
  telegram_bot_link: string;
  messages: IMessage[];
  weaklyData: {
    date: string;
    value: number;
  }[];
  dailyStatusMessage: {
    category: string;
    total: number;
  }[];
}
