import express from "express";
import { checkSymptoms } from "../Controllers/symptomController.js";

const router = express.Router();

// POST /api/symptom/check
router.post("/check", checkSymptoms);

export default router;