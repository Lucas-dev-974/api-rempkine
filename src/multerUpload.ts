import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

const ALLOWED_FILE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".pdf"];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_FILE_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé. Extensions autorisées: ${ALLOWED_FILE_EXTENSIONS.join(", ")}`));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
