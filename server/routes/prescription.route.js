import express from "express";
import multer from "multer";
import sharp from "sharp";
import { scanPrescription } from "../Controllers/prescriptionController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"), false);
  },
});

const preprocessImage = async (req, res, next) => {
  if (!req.file) return next();
  try {
    req.file.processedBuffer = await sharp(req.file.buffer)
      .resize({ width: 1500, withoutEnlargement: true })
      .grayscale()
      .normalize()
      .sharpen()
      .png()
      .toBuffer();
    next();
  } catch (err) {
    next(err);
  }
};

router.post("/scan", upload.single("image"), preprocessImage, scanPrescription);

export default router;