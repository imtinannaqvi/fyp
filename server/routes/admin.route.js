import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAllUsers, getTodayReminders, deleteReminder, getDashboardStats, deleteUser, changeUserRole } from "../Controllers/admin.controller.js";
import { getSearchAnalytics } from "../Controllers/user.controller.js";
import Medicine from "../models/Medicine.js";
import SiteSettings from "../models/SiteSettings.js";

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

// ── Get site settings (public — anyone can fetch logo) ───────────────────────
router.get("/settings", async (req, res) => {
  try {
    let settings = await SiteSettings.findOne().populate("lastChangedBy.adminId", "name email");
    if (!settings) settings = await SiteSettings.create({});
    res.json(settings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Save site settings (admin only) ──────────────────────────────────────
router.post("/settings", protect, isAdmin, async (req, res) => {
  try {
    const { siteName, tagline, contactEmail, contactPhone, maintenanceMode } = req.body;
    let settings = await SiteSettings.findOne();
    if (!settings) settings = new SiteSettings();
    if (siteName !== undefined)        settings.siteName        = siteName;
    if (tagline !== undefined)         settings.tagline         = tagline;
    if (contactEmail !== undefined)    settings.contactEmail    = contactEmail;
    if (contactPhone !== undefined)    settings.contactPhone    = contactPhone;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (req.body.showSiteName !== undefined) settings.showSiteName = req.body.showSiteName;
    settings.lastChangedBy = { adminId: req.user._id, adminName: req.user.name, adminEmail: req.user.email, changedAt: new Date() };
    await settings.save();
    res.json({ message: "Settings saved", settings });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Upload logos (admin only) ─────────────────────────────────────────────
router.post("/settings/logo", protect, isAdmin, async (req, res) => {
  try {
    const { logoLight, logoDark } = req.body;
    let settings = await SiteSettings.findOne();
    if (!settings) settings = new SiteSettings();
    if (logoLight !== undefined) settings.logoLight = logoLight === "CLEAR" ? null : logoLight || settings.logoLight;
    if (logoDark  !== undefined) settings.logoDark  = logoDark  === "CLEAR" ? null : logoDark  || settings.logoDark;
    settings.lastChangedBy = { adminId: req.user._id, adminName: req.user.name, adminEmail: req.user.email, changedAt: new Date() };
    await settings.save();
    res.json({ message: "Logo saved", logoLight: settings.logoLight, logoDark: settings.logoDark, lastChangedBy: settings.lastChangedBy });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Reset isEnriched flag ───────────────────────────────────────────────────
router.post("/reset-enrichment", protect, isAdmin, async (req, res) => {
  try {
    const result = await Medicine.updateMany({}, { $set: { isEnriched: false } });
    res.json({ message: `Reset enrichment for ${result.modifiedCount} medicines.` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;