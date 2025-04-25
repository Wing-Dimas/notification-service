import { create } from "zustand";
import { PaginatedResult } from "../types/paginator";
import { IApiKeyData } from "../types/api-key";

export type DataType = IApiKeyData[];
export type PaginatorType = PaginatedResult<IApiKeyData>["meta"];

interface IApiKey {
  data: DataType;
  paginator: PaginatorType;
  setData: (data: DataType) => void;
  setPaginator: (paginator: PaginatorType) => void;
}

export const useApiKey = create<IApiKey>()(set => ({
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
