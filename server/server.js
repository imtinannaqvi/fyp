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

app.use("/api/auth",         authRoutes);
app.use("/api/medicine",     medicineRoutes);
app.use("/api/user",         userRoutes);
app.use("/api/ai",           aiRoutes);
app.use("/api/ocr",          ocrRoutes);
app.use("/api/interaction",  interactionRoutes);
app.use("/api/admin",        adminRoutes);
app.use("/api/prescription",  prescriptionRoutes);
app.use("/api/symptom",      symptomRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "Medico Guidance API running ✅" }));

// ── DB + Server ───────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB error:", err));