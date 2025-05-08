import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";
import {
  ACCEPTED_DOCUMENT_TYPES,
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
} from "../constants/valid-file-upload";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomKey() {
  return nanoid(10);
}

export async function delay(ms: number = 3000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatDate(dateInput: string | Date = "") {
  if (dateInput === "" || dateInput === null) return "";

  if (typeof dateInput === "string") {
    const date = new Date(dateInput);
    const formatter = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const formattedDate = formatter.format(date);
    return formattedDate;
  } else if (dateInput instanceof Date) {
    const formatter = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const formattedDate = formatter.format(dateInput);
    return formattedDate;
  }
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
export const formatCompactNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num;
};

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
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      ".docx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      ".xlsx",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      ".pptx",
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

export const diffForHumans = (
  date: Date | string,
  compareDate = null,
  withSuffix = true,
  locale = "id",
) => {
  // Konversi input ke objek Date
  const dateObj = date instanceof Date ? date : new Date(date);
  const compareDateObj: Date = compareDate
    ? (compareDate as unknown) instanceof Date
      ? compareDate
      : new Date(compareDate)
    : new Date();

  // Hitung perbedaan dalam milidetik
  const diffMs = dateObj.getTime() - compareDateObj.getTime();
  const absDiffMs = Math.abs(diffMs);

  // Tentukan apakah masa lalu atau masa depan
  const isPast = diffMs < 0;

  // Konstanta untuk konversi waktu
  const msPerSecond = 1000;
  const msPerMinute = msPerSecond * 60;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerWeek = msPerDay * 7;
  const msPerMonth = msPerDay * 30; // Perkiraan
  const msPerYear = msPerDay * 365; // Perkiraan

  // Unit waktu dan ambang batas mereka
  const timeUnits = [
    { unit: "year", ms: msPerYear, threshold: 1.5 * msPerYear },
    { unit: "month", ms: msPerMonth, threshold: 1.5 * msPerMonth },
    { unit: "week", ms: msPerWeek, threshold: 1.5 * msPerWeek },
    { unit: "day", ms: msPerDay, threshold: 1.5 * msPerDay },
    { unit: "hour", ms: msPerHour, threshold: 1.5 * msPerHour },
    { unit: "minute", ms: msPerMinute, threshold: 1.5 * msPerMinute },
    { unit: "second", ms: msPerSecond, threshold: 1000 },
  ];

  // Terjemahan untuk berbagai bahasa
  const translations = {
    en: {
      year: ["year", "years"],
      month: ["month", "months"],
      week: ["week", "weeks"],
      day: ["day", "days"],
      hour: ["hour", "hours"],
      minute: ["minute", "minutes"],
      second: ["second", "seconds"],
      past: "ago",
      future: "in",
      just: "just now",
    },
    id: {
      year: ["tahun", "tahun"],
      month: ["bulan", "bulan"],
      week: ["minggu", "minggu"],
      day: ["hari", "hari"],
      hour: ["jam", "jam"],
      minute: ["menit", "menit"],
      second: ["detik", "detik"],
      past: "yang lalu",
      future: "dalam",
      just: "baru saja",
    },
  };

  // Gunakan bahasa Inggris sebagai fallback jika locale tidak ditemukan
  const trans = translations[locale as "id" | "en"] || translations["en"];

  // Tangani kasus khusus: tepat sama atau hampir sama
  if (absDiffMs < 1000) {
    return trans.just;
  }

  // Tentukan unit waktu yang sesuai
  for (const unitInfo of timeUnits) {
    if (absDiffMs >= unitInfo.threshold || unitInfo.unit === "second") {
      const value = Math.round(absDiffMs / unitInfo.ms);
      const unitName: string =
        trans[unitInfo.unit as keyof typeof trans][value === 1 ? 0 : 1];

      if (withSuffix) {
        if (isPast) {
          return `${value} ${unitName} ${trans.past}`;
        } else {
          return `${trans.future} ${value} ${unitName}`;
        }
      } else {
        return `${value} ${unitName}`;
      }
    }
  }

  // Fallback (seharusnya tidak pernah terjadi)
  return "";
};
