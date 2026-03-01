import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getProfile,
  updateProfile,
  saveMedicine,
  removeSavedMedicine,
  getSavedMedicines,
  addSearchHistory,
  getSearchHistory,
  clearSearchHistory,
} from "../Controllers/user.controller.js";

const router = express.Router();

// All user routes require login
router.use(protect);

// ─── Profile ──────────────────────────────────────────────────────────────────
router.get("/profile",       getProfile);
router.put("/profile",       updateProfile);

// ─── Saved Medicines ──────────────────────────────────────────────────────────
router.get   ("/saved-medicines",          getSavedMedicines);
router.post  ("/save-medicine/:medicineId",    saveMedicine);
router.delete("/save-medicine/:medicineId",    removeSavedMedicine);

// ─── Search History ───────────────────────────────────────────────────────────
router.get   ("/search-history",  getSearchHistory);
router.post  ("/search-history",  addSearchHistory);
router.delete("/search-history",  clearSearchHistory);

export default router;