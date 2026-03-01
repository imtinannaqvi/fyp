import User from "../models/User.js";
import Medicine from "../models/Medicine.js";
import OCRResult from "../models/ocrResult.js";

// ── Get all users ─────────────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;
    const search = req.query.search || "";

    const query = search
      ? { $or: [
          { name:  { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ]}
      : {};

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password -otp -otpExpiry")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.json({ total, page, pages: Math.ceil(total / limit), users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Get dashboard stats ───────────────────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalMedicines, totalScans, recentUsers] = await Promise.all([
      User.countDocuments(),
      Medicine.countDocuments(),
      OCRResult.countDocuments(),
      User.find()
        .select("name email role createdAt isVerified")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json({ totalUsers, totalMedicines, totalScans, recentUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Delete user ───────────────────────────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Change user role ──────────────────────────────────────────────────────────
export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    res.json({ message: "Role updated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};