import mime from "mime-types";
import chalk from "chalk";
import {
  ACCEPTED_DOCUMENT_TYPES,
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
} from "@/constants/valid-file-uploads";

export type UnionTypeWithString<T extends string> = T | Omit<string, T>;

/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true;
  } else if (typeof value !== "number" && value === "") {
    return true;
  } else if (typeof value === "undefined" || value === undefined) {
    return true;
  } else if (
    value !== null &&
    typeof value === "object" &&
    !Object.keys(value).length
  ) {
    return true;
  } else {
    return false;
  }
};

export const phoneNumber = (number: string) => {
  const phone = number.replace(/\D/g, "");
  if (phone.startsWith("08")) {
    const slice = phone.slice(1);
    return `62${slice}@s.whatsapp.net`;
  } else if (phone.startsWith("62")) {
    return phone + "@s.whatsapp.net";
  } else {
    return null;
  }
};

export const sleep = async (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const color = (text: string, color: string) => {
  return !color
    ? chalk.green(text)
    : color.startsWith("#")
      ? chalk.hex(color)(text)
      : chalk.keyword(color)(text);
};

export const validateJson = (data: string) => {
  if (typeof data === "string") {
    try {
      JSON.parse(data);
      return true;
    } catch {
      return false;
    }
  }

  return false;
};

export const getMimeTypeFromName = (filename: string): string => {
  return mime.lookup(filename) || "application/octet-stream";
};

export const getFileCategory = (
  mimeType: string,
): UnionTypeWithString<"image" | "video" | "document"> => {
  if (ACCEPTED_IMAGE_TYPES.includes(mimeType)) return "image";
  if (ACCEPTED_VIDEO_TYPES.includes(mimeType)) return "video";
  if (ACCEPTED_DOCUMENT_TYPES.includes(mimeType)) return "document";
  return "document";
};

export const isValidExt = (filename: string): boolean => {
  const mimeType = getMimeTypeFromName(filename);
  const validExt = [
    ...ACCEPTED_IMAGE_TYPES,
    ...ACCEPTED_VIDEO_TYPES,
    ...ACCEPTED_DOCUMENT_TYPES,
  ];

  if (validExt.includes(mimeType)) return true;
  return false;
};
