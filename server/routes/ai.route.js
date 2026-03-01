import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  generateExplanation,
  getPersonalizedDosage,
  generateAllExplanations,
} from "../Controllers/ai.controller.js";

const router = express.Router();

const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// ─── Admin routes ─────────────────────────────────────────────────────────────
// Generate AI explanation for one medicine
router.post("/explain/:medicineId",  protect, isAdmin, generateExplanation);

// Generate AI explanations for ALL medicines missing one
router.post("/explain-all",          protect, isAdmin, generateAllExplanations);

// ─── User routes ──────────────────────────────────────────────────────────────
// Get personalized dosage based on user health profile
router.get("/dosage/:medicineId",    protect, getPersonalizedDosage);

export default router;