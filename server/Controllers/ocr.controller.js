import axios from "axios";
import FormData from "form-data";
import OCRResult from "../models/OCRResult.js";
import Medicine from "../models/Medicine.js";
import Groq from "groq-sdk";

// ── AI: Full medicine analysis from OCR text ──────────────────────────────────
const analyzeWithAI = async (rawText) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `You are a senior clinical pharmacist and medicine expert. A medicine label/packaging has been scanned via OCR. 

OCR Text extracted from the image:
"""${rawText}"""

Your task:
1. Identify the medicine from the OCR text
2. Use your medical knowledge to provide COMPLETE and ACCURATE information about this medicine
3. If OCR text is unclear or partial, use whatever clues are available (partial name, strength, company) to identify the medicine

Return ONLY a valid JSON object with ALL these fields (never return null for medical fields — use your knowledge):
{
  "medicineName": "brand/product name",
  "genericName": "generic/chemical/INN name",
  "company": "manufacturer name from label or known manufacturer",
  "strength": "dosage strength e.g. 500mg, 250mg/5ml, 10mg/tablet",
  "drugClass": "pharmacological class e.g. Antibiotic, NSAID, Antihypertensive",
  "usedFor": "clear explanation of what this medicine treats (2-3 sentences)",
  "howItWorks": "mechanism of action in simple words (1-2 sentences)",
  "dosage": {
    "adult": "standard adult dose",
    "child": "pediatric dose or 'Not recommended for children under X years'",
    "elderly": "elderly dose adjustment if any",
    "frequency": "how many times per day",
    "duration": "typical course duration",
    "instructions": "take with food/water, before/after meals etc"
  },
  "sideEffects": {
    "common": ["list", "of", "common", "side effects"],
    "serious": ["list", "of", "serious", "side effects"],
    "rare": ["list", "of", "rare", "side effects"]
  },
  "warnings": ["important warning 1", "important warning 2", "important warning 3"],
  "contraindications": ["who should NOT take this", "condition 2", "condition 3"],
  "drugInteractions": ["interacts with drug 1", "interacts with drug 2"],
  "foodInteractions": ["avoid with food/drink 1", "avoid with food/drink 2"],
  "pregnancyCategory": "Safe/Caution/Avoid/Consult doctor — with brief reason",
  "breastfeeding": "Safe/Caution/Avoid — with brief reason",
  "storage": "how to store this medicine",
  "overdoseInfo": "what happens in overdose and what to do",
  "requiresPrescription": true or false,
  "expiry": "expiry date from label if visible, else null",
  "batchNo": "batch number from label if visible, else null",
  "confidenceNote": "brief note on how confident you are based on OCR quality"
}

IMPORTANT: Use your medical knowledge to fill ALL fields accurately. Do not leave medical fields empty. Return ONLY valid JSON, no markdown, no explanation.`
      }],
      max_tokens: 1500,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content?.trim();
    const cleaned = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("AI analysis error:", err.message);
    return null;
  }
};

// ── AI fallback: identify medicine from minimal/unclear text ─────────────────
const identifyFromMinimalText = async (rawText) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `The following is very unclear or partial OCR text from a medicine packaging. Even if it's mostly garbled, try to identify what medicine this might be based on any readable fragments, numbers, or patterns.

OCR Text: """${rawText}"""

Return ONLY a JSON object:
{
  "possibleMedicine": "your best guess at the medicine name",
  "confidence": "low/medium/high",
  "reasoning": "why you think this is the medicine"
}

If you truly cannot identify anything, return: {"possibleMedicine": null, "confidence": "none", "reasoning": "insufficient data"}`
      }],
      max_tokens: 200,
      temperature: 0.2,
    });
    const content = response.choices[0]?.message?.content?.trim();
    const cleaned = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

export const extractText = async (req, res) => {
  try {
    if (!req.file || !req.file.processedBuffer) {
      return res.status(400).json({ message: "Image not uploaded or processed" });
    }

    // ── Step 1: Run OCR via OCR.space ─────────────────────────────────────────
    let rawText = "";
    let ocrFailed = false;

    try {
      const formData = new FormData();
      formData.append("file", req.file.processedBuffer, {
        filename: req.file.originalname || "image.jpg",
        contentType: req.file.mimetype || "image/jpeg",
      });
      formData.append("language", "eng");
      formData.append("isOverlayRequired", "false");
      formData.append("detectOrientation", "true");
      formData.append("scale", "true");
      formData.append("isTable", "true");
      formData.append("OCREngine", "2");

      const ocrResponse = await axios.post(
        "https://api.ocr.space/parse/image",
        formData,
        {
          headers: { ...formData.getHeaders(), apikey: process.env.OCR_API_KEY },
          timeout: 30000,
        }
      );

      const parsed = ocrResponse.data?.ParsedResults?.[0];
      if (parsed?.FileParseExitCode === 1 && parsed?.ParsedText?.trim().length > 2) {
        rawText = parsed.ParsedText;
      } else {
        ocrFailed = true;
      }
    } catch (ocrErr) {
      console.error("OCR.space error:", ocrErr.message);
      ocrFailed = true;
    }

    // ── Step 2: If OCR got nothing, try AI identification from minimal text ───
    if (ocrFailed || rawText.trim().length < 5) {
      const minimal = await identifyFromMinimalText(rawText || "unclear image");
      if (!minimal?.possibleMedicine) {
        return res.status(422).json({
          message: "Could not read this image. Please try a clearer, well-lit photo of the medicine label.",
        });
      }
      // Use the guessed name as rawText for AI analysis
      rawText = `Medicine name (guessed): ${minimal.possibleMedicine}. Original OCR: ${rawText}`;
    }

    // ── Step 3: AI full analysis — always runs ────────────────────────────────
    const aiData = await analyzeWithAI(rawText);

    if (!aiData) {
      return res.status(422).json({
        message: "Could not analyze this medicine image. Please try a clearer photo.",
      });
    }

    // ── Step 4: Check DB match ────────────────────────────────────────────────
    const medicineName = aiData.medicineName || aiData.genericName || null;
    let isFake = true;
    let matchedWith = null;
    let medicineDetails = null;

    if (medicineName) {
      const cleanName = medicineName.toLowerCase().trim();
      const words = cleanName.split(" ").filter(w => w.length > 2);

      const approvedMedicines = await Medicine.find({ isApproved: true }).select("name brand generic");

      for (const med of approvedMedicines) {
        const medName    = med.name.toLowerCase().trim();
        const medBrand   = med.brand.toLowerCase().trim();
        const medGeneric = (med.generic || "").toLowerCase().trim();

        const match =
          words.some(w => medName.includes(w) || w.includes(medName) || medBrand.includes(w) || w.includes(medBrand)) ||
          cleanName.includes(medName) || cleanName.includes(medBrand) ||
          (medGeneric && (cleanName.includes(medGeneric) || words.some(w => medGeneric.includes(w))));

        if (match) {
          isFake      = false;
          matchedWith = `${med.name} (${med.brand})`;
          medicineDetails = await Medicine.findById(med._id).select("-createdBy -ocrData -__v");
          break;
        }
      }
    }

    // ── Step 5: Save result ───────────────────────────────────────────────────
    await OCRResult.create({
      imagePath:       req.file.path || null,
      rawText,
      medicineName,
      confidence:      90,
      isFake,
      matchedWith,
      similarityScore: isFake ? 0 : 1,
      scannedBy:       req.user?._id || null,
    });

    // ── Step 6: Respond ───────────────────────────────────────────────────────
    res.json({
      extractedText:   rawText,
      medicineName,
      confidence:      90,
      isFake,
      matchedWith,
      medicineDetails,
      aiData,           // full rich AI analysis — always present
      ocrFailed,
      message: isFake
        ? "⚠️ Not found in local database — AI analysis provided below"
        : `✅ Matched in database: ${matchedWith}`,
    });

  } catch (error) {
    console.error("OCR Error:", error.message);
    res.status(500).json({ message: "Scan processing failed. Please try again." });
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
