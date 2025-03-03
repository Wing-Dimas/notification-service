import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomKey() {
  return nanoid(10);
}

export async function delay(ms: number = 3000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
