import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";
import { ACCEPTED_DOCUMENT_TYPES, ACCEPTED_IMAGE_TYPES, ACCEPTED_VIDEO_TYPES } from "../constants/valid-file-upload";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomKey() {
  return nanoid(10);
}

export async function delay(ms: number = 3000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatDate(dateInput: string = "") {
  if (dateInput === "" || dateInput === null) return "";

  const date = new Date(dateInput);
  const formatter = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedDate = formatter.format(date);
  return formattedDate;
}

export function formatTime(dateInput: string = "") {
  if (dateInput === "" || dateInput === null) return "";
  const date = new Date(dateInput); // Tanggal dan waktu saat ini

  const formatter = new Intl.DateTimeFormat("id-ID", {
    hour: "numeric", // Menampilkan jam (10)
    minute: "numeric", // Menampilkan menit (12)
    hour12: false, // Format 24 jam (false) atau 12 jam (true)
    timeZone: "Asia/Jakarta", // Zona waktu WIB
    timeZoneName: "short", // Menampilkan singkatan zona waktu (WIB)
  });

  const formattedTime = formatter.format(date);
  return formattedTime;
}

export function validateJson(data: string) {
  if (typeof data === "string") {
    try {
      JSON.parse(data);
      return true;
    } catch {
      // Teks biasa
      return false;
    }
  }

  return false;
}

export const getFileExtension = (fileType: string): string => {
  const typeMap: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/ogg": ".ogv",
    "video/quicktime": ".mov",
    "video/x-msvideo": ".avi",
    "video/x-matroska": ".mkv",
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
    "text/plain": ".txt",
    "application/rtf": ".rtf",
    "application/zip": ".zip",
  };

  return typeMap[fileType] || "";
};

// Fungsi helper untuk mendapatkan kategori file
export const getFileCategory = (fileType: string): string => {
  if (ACCEPTED_IMAGE_TYPES.includes(fileType)) return "Gambar";
  if (ACCEPTED_VIDEO_TYPES.includes(fileType)) return "Video";
  if (ACCEPTED_DOCUMENT_TYPES.includes(fileType)) return "Dokumen";
  return "Tidak dikenal";
};
