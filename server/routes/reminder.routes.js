// routes/reminder.route.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createReminder,
  getUserReminders,
  toggleReminder,
  deleteReminder,
} from "../Controllers/reminder.controller.js";

const router = express.Router();

// All routes require login
router.post("/",            protect, createReminder);    // POST   /api/reminders
router.get("/",             protect, getUserReminders);  // GET    /api/reminders
router.patch("/:id/toggle", protect, toggleReminder);   // PATCH  /api/reminders/:id/toggle
router.delete("/:id",       protect, deleteReminder);   // DELETE /api/reminders/:id

export default router;