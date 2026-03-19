import axios from "axios";
import FormData from "form-data";
import OCRResult from "../models/ocrResult.js";
import Medicine from "../models/Medicine.js";

export const extractText = async (req, res) => {
  try {
    if (!req.file || !req.file.processedBuffer) {
      return res.status(400).json({ message: "Image not uploaded or processed" });
    }

    // ── Step 1: Run OCR via OCR.space API ────────────────────────────────────
    const formData = new FormData();
    formData.append("file", req.file.processedBuffer, {
      filename: req.file.originalname || "image.jpg",
      contentType: req.file.mimetype || "image/jpeg",
    });
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");
    formData.append("detectOrientation", "true");
    formData.append("scale", "true");
    formData.append("OCREngine", "2"); // Engine 2 is more accurate

    const ocrResponse = await axios.post(
      "https://api.ocr.space/parse/image",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          apikey: process.env.OCR_API_KEY,
        },
      }
    );

    const parsed = ocrResponse.data?.ParsedResults?.[0];

    if (!parsed || parsed.FileParseExitCode !== 1) {
      return res.status(422).json({
        message: "Could not extract text from image. Try a clearer image.",
      });
    }

    const text = parsed.ParsedText || "";
    const confidence = 90; // OCR.space doesn't return confidence, use default

    if (!text || text.trim().length < 3) {
      return res.status(422).json({
        message: "Could not extract text from image. Try a clearer image.",
      });
    }

    // ── Step 2: Clean extracted text ─────────────────────────────────────────
    const cleanText = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const words = cleanText.split(" ").filter((w) => w.length > 2);

    // ── Step 3: Match against approved medicines in DB ───────────────────────
    const approvedMedicines = await Medicine.find({ isApproved: true }).select(
      "name brand generic"
    );

    let isFake = true;
    let matchedWith = null;
    let similarityScore = 0;
    let medicineName = null;

    for (const med of approvedMedicines) {
      const medName    = med.name.toLowerCase().trim();
      const medBrand   = med.brand.toLowerCase().trim();
      const medGeneric = (med.generic || "").toLowerCase().trim();

      // ✅ Check 1: Direct word match
      const directMatch = words.some(
        (word) =>
          medName.includes(word) ||
          word.includes(medName) ||
          medBrand.includes(word) ||
          word.includes(medBrand) ||
          (medGeneric && medGeneric.includes(word))
      );

      if (directMatch) {
        isFake          = false;
        matchedWith     = `${med.name} (${med.brand})`;
        medicineName    = med.name;
        similarityScore = 1.0;
        break;
      }

      // ✅ Check 2: Partial text match
      const partialMatch =
        cleanText.includes(medName) ||
        cleanText.includes(medBrand) ||
        (medGeneric && cleanText.includes(medGeneric));

      if (partialMatch) {
        isFake          = false;
        matchedWith     = `${med.name} (${med.brand})`;
        medicineName    = med.name;
        similarityScore = 0.9;
        break;
      }
    }

    // ── Step 4: Save result ──────────────────────────────────────────────────
    const result = await OCRResult.create({
      imagePath:       req.file.path || null,
      rawText:         text,
      medicineName,
      confidence:      Math.round(confidence),
      isFake,
      matchedWith,
      similarityScore: parseFloat(similarityScore.toFixed(2)),
      scannedBy:       req.user?._id || null,
    });

    // ── Step 5: Respond ──────────────────────────────────────────────────────
    res.json({
      id:              result._id,
      extractedText:   text,
      medicineName,
      confidence:      Math.round(confidence),
      isFake,
      matchedWith,
      similarityScore: parseFloat(similarityScore.toFixed(2)),
      message: isFake
        ? "⚠️ Warning: This medicine could not be verified. It may be fake or unregistered."
        : `✅ Medicine verified: matches "${matchedWith}" in our database.`,
    });

  } catch (error) {
    console.error("OCR Error:", error.message);
    res.status(500).json({ message: "OCR processing failed", error: error.message });
  }
};

// ── Get all OCR scan history (admin) ─────────────────────────────────────────
export const getOcrHistory = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const [results, total] = await Promise.all([
      OCRResult.find()
        .populate("scannedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      OCRResult.countDocuments(),
    ]);

    res.json({ total, page, pages: Math.ceil(total / limit), results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};