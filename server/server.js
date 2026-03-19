import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ── Clean & Robust CORS Configuration ──────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "https://medico-app-eta.vercel.app",
  "https://medico-ftv4k5n46-imtinans-projects-0205c3f4.vercel.app",
  "https://fyp-ed6c.vercel.app"  // ✅ Added your live frontend URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list OR matches any Vercel subdomain
    const isAllowed = allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin);
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log("CORS Blocked Origin:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// ✅ Handle preflight requests for ALL routes explicitly
// ✅ Use this instead
app.options('/{*path}', cors());
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

// ── DB + Server ───────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    if (process.env.NODE_ENV !== 'production') {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    }
  })
  .catch((err) => console.error("❌ MongoDB error:", err));

export default app;