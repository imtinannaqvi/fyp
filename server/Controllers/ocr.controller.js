import axios from "axios";
import FormData from "form-data";
import OCRResult from "../models/OCRResult.js";
import Medicine from "../models/Medicine.js";
import Groq from "groq-sdk";

// ── Parse raw OCR text with AI when medicine not in DB ───────────────────────
const parseOcrWithAI = async (rawText) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `You are a medicine label parser. Extract information from this OCR text scanned from a medicine box/packaging.

OCR Text:
"""${rawText}"""

Extract and return ONLY a valid JSON object with these fields (use null if not found):
{
  "medicineName": "the brand/product name of the medicine",
  "genericName": "generic/chemical name",
  "company": "manufacturer or company name",
  "strength": "dosage strength e.g. 500mg, 250mg/5ml",
  "usedFor": "what this medicine is used for (1-2 sentences)",
  "dosage": "dosage instructions if visible",
  "warnings": "any warnings visible on the box",
  "expiry": "expiry date if visible",
  "batchNo": "batch number if visible"
}

Return ONLY the JSON. No explanation, no markdown, no extra text.`
      }],
      max_tokens: 400,
      temperature: 0.1,
    });
    const content = response.choices[0]?.message?.content?.trim();
    // Strip markdown code blocks if present
    const cleaned = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("AI OCR parse error:", err.message);
    return null;
  }
};

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

    // ── Step 5: Fetch full medicine details if matched ───────────────────────
    let medicineDetails = null;
    if (!isFake && medicineName) {
      medicineDetails = await Medicine.findOne({
        $or: [
          { name:    { $regex: medicineName, $options: "i" } },
          { brand:   { $regex: medicineName, $options: "i" } },
          { generic: { $regex: medicineName, $options: "i" } },
        ]
      }).select("-createdBy -ocrData -__v");
    }

    // ── Step 6: If not in DB, parse label info with AI ──────────────────────
    let parsedLabelInfo = null;
    if (isFake) {
      parsedLabelInfo = await parseOcrWithAI(text);
    }

    // ── Step 7: Respond ──────────────────────────────────────────────────────
    res.json({
      id:              result._id,
      extractedText:   text,
      medicineName:    medicineName || parsedLabelInfo?.medicineName || null,
      confidence:      Math.round(confidence),
      isFake,
      matchedWith,
      similarityScore: parseFloat(similarityScore.toFixed(2)),
      medicineDetails,
      parsedLabelInfo,
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
