import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
import authRoutes         from "./routes/auth.route.js";
import medicineRoutes     from "./routes/medicine.route.js";
import userRoutes         from "./routes/user.route.js";
import aiRoutes           from "./routes/ai.route.js";
import ocrRoutes          from "./routes/ocr.route.js";
import interactionRoutes  from "./routes/interaction.js";
import adminRoutes        from "./routes/admin.route.js";
import prescriptionRoutes from "./routes/prescription.route.js";
import symptomRoutes      from "./routes/symptom.route.js";
import reminderRoutes     from "./routes/reminder.routes.js";
import fakeReportRoutes   from "./routes/fakeReport.routes.js";
import expiryRoutes       from "./routes/expiry.route.js";

// ── Cron Jobs ─────────────────────────────────────────────────────────────────
import { startReminderCron } from "./services/reminderCron.js";
import { startExpiryCron }   from "./services/expiryCron.js";

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);       // Register, Login, OTP, Reset Password
app.use("/api/medicine",     medicineRoutes);   // Smart Search, Autocomplete, CRUD
app.use("/api/user",         userRoutes);       // Profile, Saved Medicines, Search History
app.use("/api/ai",           aiRoutes);         // MediBot, Dosage, Translate, Explanations
app.use("/api/ocr",          ocrRoutes);        // Fake Medicine Scanner
app.use("/api/interaction",  interactionRoutes);// Drug Interaction Checker
app.use("/api/admin",        adminRoutes);      // Dashboard, Users, Reminders, Analytics
app.use("/api/prescription", prescriptionRoutes);// Prescription Scanner
app.use("/api/symptom",      symptomRoutes);    // Symptom Checker
app.use("/api/reminders",    reminderRoutes);   // WhatsApp Medicine Reminders
app.use("/api/expiry",       expiryRoutes);     // Medicine Expiry Tracker
app.use("/api/fake-report",  fakeReportRoutes); // Report Fake Medicine

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "Medico Guidance API running ✅" }));

// ── DB + Server ───────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      startReminderCron();  // WhatsApp medicine reminders (every minute)
      startExpiryCron();    // Medicine expiry alerts (daily at 9 AM PKT)
    });
  })
  .catch((err) => console.error("❌ MongoDB error:", err));