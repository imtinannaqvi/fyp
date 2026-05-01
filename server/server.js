import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// ── Import all routes at top ──────────────────────────
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

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
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
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// ── Register routes ───────────────────────────────────
app.get("/test", (req, res) => res.json({ ok: true }));
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

app.get("/", (req, res) => res.json({ message: "Medico Guidance API running ✅" }));

// ── MongoDB + Start Server ────────────────────────────
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

connectDB()
  .then(async () => {
    console.log("✅ MongoDB Connected");
    // Reset enrichment flag so all medicines get re-enriched with full AI data on next search
    try {
      const { modifiedCount } = await (await import("./models/Medicine.js")).default.updateMany(
        { $or: [{ isEnriched: true }, { isEnriched: { $exists: false } }] },
        { $set: { isEnriched: false } }
      );
      if (modifiedCount > 0) console.log(`🔄 Reset enrichment for ${modifiedCount} medicines`);
    } catch (e) { console.error("Enrichment reset error:", e.message); }
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
  });

export default app;