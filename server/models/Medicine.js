import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    // ─── Basic Info ───────────────────────────────────────────────────────────
    name:        { type: String, required: true, trim: true },
    brand:       { type: String, required: true, trim: true },
    generic:     { type: String, trim: true },           // generic/chemical name
    category:    { type: String, trim: true },           // e.g. antibiotic, painkiller
    description: { type: String },
    image:       { type: String },                       // medicine image/packaging
    price:       { type: Number, default: 0 },
    stock:       { type: Number, default: 0 },

    // ─── Dosage Guidance ─────────────────────────────────────────────────────
    dosage: { type: String },                            // general dosage info
    dosageGuide: {
      adult:    { type: String },                        // e.g. "500mg twice daily"
      child:    { type: String },                        // e.g. "250mg once daily"
      elderly:  { type: String },                        // e.g. "250mg once daily"
      notes:    { type: String },                        // e.g. "take with food"
    },

    // ─── Side Effects ─────────────────────────────────────────────────────────
    sideEffects:     [String],                           // short-term side effects
    longTermEffects: [String],                           // long-term misuse effects
                                                         // e.g. kidney damage, liver toxicity

    // ─── Safety Info ─────────────────────────────────────────────────────────
    contraindications: [String],   // who should NOT take — e.g. "pregnant women", "kidney disease"
    foodInteractions:  [String],   // e.g. "avoid with milk", "do not take with citrus juice"
    drugInteractions:  [String],   // e.g. "dangerous with blood thinners"
    warnings:          [String],   // general warnings

    // ─── Classification ───────────────────────────────────────────────────────
    requiresPrescription: { type: Boolean, default: false },
    isCommonlyMisused:    { type: Boolean, default: false },  // flag misused medicines
    safeAlternatives:     [String],                           // alternative medicine names

    // ─── AI / OCR Flags ──────────────────────────────────────────────────────
    isApproved:   { type: Boolean, default: false },   // admin approved
    isSuspicious: { type: Boolean, default: false },   // flagged as fake/suspicious
    ocrData:      { type: String },                    // raw OCR text from image scan
    aiExplanation:{ type: String },                    // AI-generated simplified explanation

    // ─── Admin ───────────────────────────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
    },
  },
  { timestamps: true }
);

// ─── Index for fast search ────────────────────────────────────────────────────
medicineSchema.index({ name: "text", brand: "text", generic: "text", category: "text" });

export default mongoose.model("Medicine", medicineSchema);