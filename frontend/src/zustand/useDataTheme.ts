import { create } from "zustand";

interface IDataTheme {
  dataTheme: "light" | "dark" | Omit<string, "light" | "dark">;
  setDataTheme: (dataTheme: string) => void;
}

export const useDataTheme = create<IDataTheme>()(set => ({
  dataTheme: "light",
  setDataTheme: (dataTheme: string) => set({ dataTheme }),
}));
