import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAllUsers, getTodayReminders, deleteReminder, getDashboardStats, deleteUser, changeUserRole } from "../Controllers/admin.controller.js";
import { getSearchAnalytics } from "../Controllers/user.controller.js";
const router = express.Router();

const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

router.get("/stats",           protect, isAdmin, getDashboardStats);
router.get("/users",           protect, isAdmin, getAllUsers);
router.delete("/users/:id",    protect, isAdmin, deleteUser);
router.patch("/users/:id/role",protect, isAdmin, changeUserRole);
router.get("/reminders/today", protect, isAdmin, getTodayReminders);
router.delete("/reminders/:id", protect, isAdmin, deleteReminder);
router.get("/search-analytics", protect, isAdmin, getSearchAnalytics);

export default router;