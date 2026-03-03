import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  medicineName: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    enum: ["daily", "weekly", "monthly", "as-needed"],
    default: "daily"
  },
  times: [{
    type: String,
    required: true
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  adherenceLog: [{
    date: Date,
    time: String,
    taken: Boolean,
    takenAt: Date
  }]
}, {
  timestamps: true
});

// Index for efficient queries
reminderSchema.index({ user: 1, isActive: 1 });
reminderSchema.index({ user: 1, startDate: 1, endDate: 1 });

export default mongoose.model("Reminder", reminderSchema);
