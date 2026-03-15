import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  phone:        { type: String, required: true },       // e.g. "923001234567"
  medicineName: { type: String, required: true },
  dosage:       { type: String, required: true },
  frequency:    { type: String, enum: ["daily", "weekly", "monthly", "as-needed"], default: "daily" },
  times:        [{ type: String }],                     // e.g. ["08:00", "20:00"]
  startDate:    { type: Date, required: true },
  endDate:      { type: Date, default: null },
  notes:        { type: String, default: "" },
  isActive:     { type: Boolean, default: true },
  createdAt:    { type: Date, default: Date.now },
});

export default mongoose.model("Reminder", reminderSchema);