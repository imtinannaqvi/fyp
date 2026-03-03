import mongoose from "mongoose";

const fakeReportSchema = new mongoose.Schema({
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
  batchNumber: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  purchaseLocation: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true
  },
  suspicionReason: {
    type: String,
    required: true
  },
  reporterName: {
    type: String,
    trim: true
  },
  reporterPhone: {
    type: String,
    required: true
  },
  reporterEmail: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  reportId: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ["pending", "investigating", "verified", "rejected"],
    default: "pending"
  }
}, {
  timestamps: true
});

// Generate unique report ID
fakeReportSchema.pre('save', function(next) {
  if (!this.reportId) {
    this.reportId = `FM${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

export default mongoose.model("FakeReport", fakeReportSchema);
