import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema(
  {
    // The two medicines that interact
    medicineA: { type: String, required: true, trim: true, lowercase: true },
    medicineB: { type: String, required: true, trim: true, lowercase: true },

    severity: {
      type: String,
      enum: ["low", "moderate", "high", "critical"],
      required: true,
    },

    description:     { type: String, required: true }, // what happens
    recommendation:  { type: String, required: true }, // what to do
    source:          { type: String },                  // optional: medical source

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Index for fast lookups
interactionSchema.index({ medicineA: 1, medicineB: 1 });

export default mongoose.model("Interaction", interactionSchema);