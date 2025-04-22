import { create } from "zustand";
import { PaginatedResult } from "../types/paginator";
import { IMessage } from "../types/message";

export type DataType = IMessage[];
export type PaginatorType = PaginatedResult<IMessage>["meta"];

interface ITelegram {
  data: DataType;
  paginator: PaginatorType;
  setData: (data: DataType) => void;
  setPaginator: (paginator: PaginatorType) => void;
}

export const useTelegram = create<ITelegram>()(set => ({
  data: [],
  paginator: {
    total: 0,
    lastPage: 0,
    currentPage: 0,
    perPage: 0,
    prev: 0,
    next: 0,
  },
  setData: (data: DataType) => {
    set({ data });
  },
  setPaginator: (paginator: PaginatorType) => {
    set({ paginator });
  },
}));
