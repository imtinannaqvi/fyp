import mongoose from "mongoose";

const ocrResultSchema = new mongoose.Schema(
  {
    imagePath:   { type: String },                // uploaded image path
    rawText:     { type: String },                // full OCR extracted text
    medicineName:{ type: String },                // parsed medicine name from text
    confidence:  { type: Number },                // Tesseract confidence score 0-100
    isFake:      { type: Boolean, default: false },
    matchedWith: { type: String },                // which real medicine it matched
    similarityScore: { type: Number },            // 0-1 similarity score
    scannedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // user who scanned
  },
  { timestamps: true }
);

export default mongoose.model("OCRResult", ocrResultSchema);