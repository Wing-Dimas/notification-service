import { IMessage } from "./message";

export interface IDashboardData {
  total: number;
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
