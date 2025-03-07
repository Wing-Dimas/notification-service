import { create } from "zustand";
import { PaginatedResult } from "../types/paginator";
import { HistoryMessageWA } from "../types/whatsapp";

export type DataType = HistoryMessageWA[];
export type PaginatorType = PaginatedResult<HistoryMessageWA>["meta"];

interface IWhatsapp {
  data: DataType;
  paginator: PaginatorType;
  setData: (data: DataType) => void;
  setPaginator: (paginator: PaginatorType) => void;
}

export const useWhatsapp = create<IWhatsapp>()((set) => ({
  data: [],
  paginator: { total: 0, lastPage: 0, currentPage: 0, perPage: 0, prev: 0, next: 0 },
  setData: (data: DataType) => {
    set({ data });
  },
  setPaginator: (paginator: PaginatorType) => {
    set({ paginator });
  },
}));
