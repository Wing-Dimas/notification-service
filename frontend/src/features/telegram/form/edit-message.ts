import { z } from "zod";
import validator from "validator";
import {
  ACCEPTED_DOCUMENT_TYPES,
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
} from "../../../constants/valid-file-upload";

// Menggabungkan semua tipe file yang diizinkan
const ACCEPTED_FILE_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_VIDEO_TYPES,
  ...ACCEPTED_DOCUMENT_TYPES,
];

// Ukuran maksimum file (dalam bytes) - 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const editMessageFormSchema = z.object({
  message: z.string().min(1, { message: "Pesan harus minimal 1 karakter" }),
  receiver: z
    .string()
    .min(1, { message: "Nomnor harus diisi" })
    .refine(validator.isMobilePhone, {
      message: "Nomor telepon tidak valid",
    }),
  file: z
    .instanceof(FileList)
    .optional()
    .refine(
      files => {
        if (!files || files.length === 0) return true;

        return files[0].size <= MAX_FILE_SIZE;
      },
      {
        message: "Ukuran file tidak boleh lebih dari 10MB",
      },
    )
    .refine(
      files => {
        if (!files || files.length === 0) return true;

        return ACCEPTED_FILE_TYPES.includes(files[0].type);
      },
      {
        message:
          "Format file tidak didukung. Harap upload file gambar, video, atau dokumen.",
      },
    ),
});

export type EditMessageFormSchema = z.infer<typeof editMessageFormSchema>;
