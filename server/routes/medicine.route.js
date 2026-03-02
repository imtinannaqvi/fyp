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

// ─── Admin role check middleware ──────────────────────────────────────────────
const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// ─── Public routes ────────────────────────────────────────────────────────────
router.get("/autocomplete",  autocompleteMedicines); // GET /api/medicine/autocomplete?q=p
router.get("/smart-search", smartSearch);  // GET /api/medicine/smart-search?q=aspirin
router.get("/search",       searchMedicines); // GET /api/medicine/search?q=panadol
router.get("/",             getMedicines);    // GET /api/medicine?q=&category=
router.get("/:id",          getMedicineById); // GET /api/medicine/:id

// ─── Admin only routes ────────────────────────────────────────────────────────
router.post(  "/",              protect, isAdmin, upload.single("image"), processImage, createMedicine);
router.put(   "/:id",           protect, isAdmin, upload.single("image"), processImage, updateMedicine);
router.delete("/:id",           protect, isAdmin, deleteMedicine);
router.patch( "/:id/approve",   protect, isAdmin, approveMedicine);
router.patch( "/:id/reject",    protect, isAdmin, rejectMedicine);

export default router;