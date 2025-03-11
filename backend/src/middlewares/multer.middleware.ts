import multer, { FileFilterCallback, Multer, MulterError } from "multer";
import fs from "fs";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_DOCUMENT_TYPES,
  ACCEPTED_VIDEO_TYPES,
} from "@/constants/valid-file-uploads";
import { HttpException } from "@/exceptions/HttpException";
import { Request, Response } from "express";

const ALLOWED_MIME_TYPE = [
  ...ACCEPTED_DOCUMENT_TYPES,
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_VIDEO_TYPES,
];

const multerMiddleware = (folder: string) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = `uploads/${folder}`;

      // Membuat folder jika belum ada
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}_${file.originalname}`;
      cb(null, uniqueSuffix);
    },
  });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (ALLOWED_MIME_TYPE.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new HttpException(400, "File extension not allowed"));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  });
};

export default multerMiddleware;
