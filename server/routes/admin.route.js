import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAllUsers, getDashboardStats, deleteUser, changeUserRole } from "../Controllers/admin.controller.js";

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

export default router;