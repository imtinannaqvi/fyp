import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  logAdherence,
  getAdherenceStats
} from "../Controllers/reminder.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get("/reminders", getReminders);
router.post("/reminders", createReminder);
router.put("/reminders/:id", updateReminder);
router.delete("/reminders/:id", deleteReminder);
router.post("/reminders/:id/adherence", logAdherence);
router.get("/reminders/stats/adherence", getAdherenceStats);

export default router;
