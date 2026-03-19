import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ── CORS — Manual headers (most reliable on Vercel) ──────────────────────────
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://fyp-ed6c.vercel.app",
    "https://medico-app-eta.vercel.app",
    "https://medico-ftv4k5n46-imtinans-projects-0205c3f4.vercel.app"
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Middlewares
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

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/medicine",     medicineRoutes);
app.use("/api/user",         userRoutes);
app.use("/api/ai",           aiRoutes);
app.use("/api/ocr",          ocrRoutes);
app.use("/api/interaction",  interactionRoutes);
app.use("/api/admin",        adminRoutes);
app.use("/api/prescription", prescriptionRoutes);
app.use("/api/symptom",      symptomRoutes);
app.use("/api/reminders",    reminderRoutes);
app.use("/api/expiry",       expiryRoutes);
app.use("/api/fake-report",  fakeReportRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "Medico Guidance API running ✅" }));

// ── DB Connection (Vercel serverless optimized) ───────────────────────────────
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  const db = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
  });
  isConnected = db.connections[0].readyState === 1;
  console.log("✅ MongoDB connected");
};

connectDB().catch((err) => console.error("❌ MongoDB error:", err));

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

export default app;