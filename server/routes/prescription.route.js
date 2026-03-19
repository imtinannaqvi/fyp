import express from "express";
import multer from "multer";
import { scanPrescription } from "../Controllers/prescriptionController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // ✅ increased to 20MB for mobile photos
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"), false);
  },
});

const preprocessImage = async (req, res, next) => {
  if (!req.file) return next();
  req.file.processedBuffer = req.file.buffer;
  next();
};

router.post("/scan", upload.single("image"), preprocessImage, scanPrescription);

export default router;