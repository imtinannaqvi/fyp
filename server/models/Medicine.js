import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    // ─── Basic Info ───────────────────────────────────────────────────────────
    name:        { type: String, required: true, trim: true },
    brand:       { type: String, required: true, trim: true },
    generic:     { type: String, trim: true },
    category:    { type: String, trim: true },
    description: { type: String },
    image:       { type: String },
    price:       { type: Number, default: 0 },
    stock:       { type: Number, default: 0 },
    barcode:     { type: String, default: "" },  // ✅ barcode field

    // ─── Dosage Guidance ─────────────────────────────────────────────────────
    dosage: { type: String },
    dosageGuide: {
      adult:   { type: String },
      child:   { type: String },
      elderly: { type: String },
      notes:   { type: String },
    },

    // ─── Side Effects ─────────────────────────────────────────────────────────
    sideEffects:     [String],
    longTermEffects: [String],

    // ─── Safety Info ─────────────────────────────────────────────────────────
    contraindications: [String],
    foodInteractions:  [String],
    drugInteractions:  [String],
    warnings:          [String],

    // ─── Food & Safety Enrichment Fields ─────────────────────────────────────
    whoShouldNotTake:     [String],
    foodTiming:           { type: mongoose.Schema.Types.Mixed },
    pregnancyWarning:     { type: String },
    breastfeedingWarning: { type: String },
    isEnriched:           { type: Boolean, default: false },

    // ─── Classification ───────────────────────────────────────────────────────
    requiresPrescription: { type: Boolean, default: false },
    isCommonlyMisused:    { type: Boolean, default: false },
    safeAlternatives:     [String],

    // ─── AI / OCR Flags ──────────────────────────────────────────────────────
    isApproved:    { type: Boolean, default: false },
    isSuspicious:  { type: Boolean, default: false },
    ocrData:       { type: String },
    aiExplanation: { type: String },

    // ─── Admin ───────────────────────────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
    },
  },
  { timestamps: true }
);

medicineSchema.index({ name: "text", brand: "text", generic: "text", category: "text" });

export default mongoose.model("Medicine", medicineSchema);