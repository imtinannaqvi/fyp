import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";
import { processImage } from "../middleware/upload.middleware.js";
import {
  createMedicine,
  getMedicines,
  getMedicineById,
  searchMedicines,
  autocompleteMedicines,
  updateMedicine,
  deleteMedicine,
  approveMedicine,
  rejectMedicine,
} from "../Controllers/medicine.controller.js";
import { smartSearch } from "../Controllers/smartSearch.controller.js";
const router = express.Router();

const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// router.get("/smart-search", (req, res) => {
//   res.json({ test: "route works", q: req.query.q });
// });
// ─── Public routes ────────────────────────────────────────────────────────────
router.get("/autocomplete",  autocompleteMedicines);
router.get("/smart-search",  smartSearch);
router.get("/search",        searchMedicines);
router.get("/",              getMedicines);
router.get("/:id",           getMedicineById);   // ← this catches everything after above routes

// ─── Admin only routes ────────────────────────────────────────────────────────
router.post(  "/",              protect, isAdmin, upload.single("image"), processImage, createMedicine);
router.put(   "/:id",           protect, isAdmin, upload.single("image"), processImage, updateMedicine);
router.delete("/:id",           protect, isAdmin, deleteMedicine);
router.patch( "/:id/approve",   protect, isAdmin, approveMedicine);
router.patch( "/:id/reject",    protect, isAdmin, rejectMedicine);

export default router;