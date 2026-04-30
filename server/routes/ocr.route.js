import express from "express";
import upload from "../config/multer.js";
import { processImage } from "../middleware/upload.middleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { extractText, getOcrHistory, fakeDetect, deleteOcrResult } from "../Controllers/ocr.controller.js";

const router = express.Router();

// POST /api/ocr/upload — public (anyone can scan a medicine)
router.post("/upload", upload.single("image"), processImage, extractText);
router.post("/fake-detect", upload.single("image"), processImage, fakeDetect);

// GET /api/ocr/history — admin only
router.get(
  "/history",
  protect,
  (req, res, next) => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }
    next();
  },
  getOcrHistory
);

// ✅ FIXED DELETE ROUTE (removed isAdmin and added inline check)
router.delete(
  "/history/:id",
  protect,
  (req, res, next) => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }
    next();
  },
  deleteOcrResult
);

export default router;