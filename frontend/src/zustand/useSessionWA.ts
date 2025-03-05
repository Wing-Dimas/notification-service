import { create } from "zustand";

interface ISessionWA {
  status: boolean;
  setStatus: (status: string) => void;
  //   getStatus: () => boolean;
}

export const useSessionWA = create<ISessionWA>()((set) => ({
  status: false,
  setStatus: (status: string) => set({ status: status === "CONNECTED" }),
}));
