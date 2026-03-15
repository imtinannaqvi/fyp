// models/MedicineExpiry.js
import mongoose from "mongoose";

const medicineExpirySchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  phone:        { type: String, required: true },
  medicineName: { type: String, required: true },
  expiryDate:   { type: Date, required: true },
  batchNumber:  { type: String, default: "" },
  notes:        { type: String, default: "" },
  isActive:     { type: Boolean, default: true },
  alertSent7:   { type: Boolean, default: false }, // 7-day alert sent
  alertSentExp: { type: Boolean, default: false }, // expiry day alert sent
  createdAt:    { type: Date, default: Date.now },
});

export default mongoose.models.MedicineExpiry || mongoose.model("MedicineExpiry", medicineExpirySchema);