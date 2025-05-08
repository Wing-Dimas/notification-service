import { create } from "zustand";
import { IJobData } from "../types/job";

export type DataType = IJobData[];

interface IJob {
  data: DataType;
  setData: (data: DataType) => void;
}

export const useJob = create<IJob>()(set => ({
  data: [],
  setData: (data: DataType) => set({ data }),
}));
