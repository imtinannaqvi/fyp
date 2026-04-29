import axios from "axios";
import FormData from "form-data";
import OCRResult from "../models/OCRResult.js";
import Medicine from "../models/Medicine.js";
import Groq from "groq-sdk";

const groq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Run OCR with a specific engine ───────────────────────────────────────────
const runOCR = async (buffer, filename, mimetype, engine) => {
  try {
    const fd = new FormData();
    fd.append("file", buffer, { filename: filename || "image.jpg", contentType: mimetype || "image/jpeg" });
    fd.append("language", "eng");
    fd.append("isOverlayRequired", "false");
    fd.append("detectOrientation", "true");
    fd.append("scale", "true");
    fd.append("OCREngine", String(engine));
    const res = await axios.post("https://api.ocr.space/parse/image", fd, {
      headers: { ...fd.getHeaders(), apikey: process.env.OCR_API_KEY },
      timeout: 30000,
    });
    const parsed = res.data?.ParsedResults?.[0];
    if (parsed?.FileParseExitCode === 1) return parsed.ParsedText?.trim() || "";
    return "";
  } catch { return ""; }
};

// ── Dedicated medicine name extractor (focused, low temperature) ─────────────
const extractMedicineName = async (ocrText) => {
  try {
    const response = await groq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `You are a medicine name identification expert. Analyze this OCR text from a medicine box/strip/bottle and identify the EXACT medicine name printed on it.

OCR Text:
"""${ocrText}"""

Rules:
- The medicine name is usually the LARGEST or FIRST prominent text on the packaging
- It could be a brand name (e.g. Panadol, Augmentin, Brufen, Flagyl, Amoxil, Disprin)
- Or a generic name (e.g. Paracetamol, Amoxicillin, Ibuprofen, Metronidazole)
- Ignore: company names, batch numbers, expiry dates, addresses, registration numbers, "Tablets", "Capsules", "Syrup"
- Correct OCR errors using pharmaceutical knowledge: "PANADO" → "Panadol", "AUGMEN" → "Augmentin", "BRUFE" → "Brufen"
- If you see a strength like "500mg" or "250mg/5ml", extract it separately

Return ONLY valid JSON:
{
  "brandName": "the medicine brand/product name",
  "genericName": "generic/chemical name if visible or known",
  "strength": "dosage strength if visible e.g. 500mg",
  "confidence": "high/medium/low"
}`
      }],
      max_tokens: 150,
      temperature: 0.05,
    });
    const content = response.choices[0]?.message?.content?.trim()
      .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(content);
  } catch { return null; }
};

// ── Full AI medicine analysis using identified name ───────────────────────────
const analyzeWithAI = async (medicineName, genericName, strength, rawText) => {
  try {
    const response = await groq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `You are a senior clinical pharmacist. Provide COMPLETE and ACCURATE medical information about this medicine.

Medicine: "${medicineName}"
Generic: "${genericName || "unknown"}"
Strength: "${strength || "unknown"}"
OCR context: """${rawText.slice(0, 400)}"""

Return ONLY valid JSON:
{
  "medicineName": "${medicineName}",
  "genericName": "correct INN/generic name",
  "company": "known manufacturer",
  "strength": "${strength || "from knowledge"}",
  "drugClass": "pharmacological class",
  "usedFor": "what this medicine treats (2-3 sentences)",
  "howItWorks": "mechanism of action in simple words",
  "dosage": {
    "adult": "standard adult dose",
    "child": "pediatric dose",
    "elderly": "elderly adjustment",
    "frequency": "times per day",
    "duration": "typical course",
    "instructions": "with food/water instructions"
  },
  "sideEffects": {
    "common": ["effect1", "effect2", "effect3"],
    "serious": ["effect1", "effect2"],
    "rare": ["effect1", "effect2"]
  },
  "warnings": ["warning1", "warning2", "warning3"],
  "contraindications": ["contraindication1", "contraindication2"],
  "drugInteractions": ["drug1", "drug2"],
  "foodInteractions": ["food1", "food2"],
  "pregnancyCategory": "Safe/Caution/Avoid — brief reason",
  "breastfeeding": "Safe/Caution/Avoid — brief reason",
  "storage": "storage instructions",
  "overdoseInfo": "overdose symptoms and what to do",
  "requiresPrescription": true or false,
  "expiry": null,
  "batchNo": null,
  "confidenceNote": "Identified as ${medicineName} from OCR scan"
}

Return ONLY valid JSON, no markdown, no explanation.`
      }],
      max_tokens: 1500,
      temperature: 0.1,
    });
    const content = response.choices[0]?.message?.content?.trim()
      .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(content);
  } catch (err) {
    console.error("AI analysis error:", err.message);
    return null;
  }
};

// ── Last resort: identify from garbled/minimal text ───────────────────────────
const identifyFromMinimalText = async (rawText) => {
  try {
    const response = await groq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `This is garbled OCR text from a medicine packaging. Identify the medicine name from any readable fragments, partial words, or numbers.

OCR Text: """${rawText}"""

Use pharmaceutical knowledge to guess even from partial text.
Return ONLY JSON: {"possibleMedicine": "name or null", "confidence": "low/medium/high"}`
      }],
      max_tokens: 100,
      temperature: 0.2,
    });
    const content = response.choices[0]?.message?.content?.trim()
      .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(content);
  } catch { return null; }
};

// ── Main OCR handler ──────────────────────────────────────────────────────────
export const extractText = async (req, res) => {
  try {
    if (!req.file || !req.file.processedBuffer) {
      return res.status(400).json({ message: "Image not uploaded or processed" });
    }

    const buffer   = req.file.processedBuffer;
    const filename = req.file.originalname;
    const mimetype = req.file.mimetype;

    // ── Step 1: Run OCR with both engines in parallel ─────────────────────────
    const [text2, text1] = await Promise.all([
      runOCR(buffer, filename, mimetype, 2),
      runOCR(buffer, filename, mimetype, 1),
    ]);

    // Use the richer result, combine both for context
    const rawText      = text2.length >= text1.length ? text2 : text1;
    const combinedText = [text2, text1].filter(Boolean).join("\n").trim();
    const ocrFailed    = !rawText || rawText.trim().length < 3;

    // ── Step 2: Dedicated medicine name extraction ────────────────────────────
    let nameResult        = null;
    let finalMedicineName = null;
    let finalGenericName  = null;
    let finalStrength     = null;

    if (!ocrFailed) {
      nameResult        = await extractMedicineName(combinedText);
      finalMedicineName = nameResult?.brandName   || null;
      finalGenericName  = nameResult?.genericName  || null;
      finalStrength     = nameResult?.strength     || null;
    }

    // ── Step 3: Fallback if name not found ────────────────────────────────────
    if (!finalMedicineName) {
      const minimal = await identifyFromMinimalText(combinedText || "unclear image");
      if (!minimal?.possibleMedicine) {
        return res.status(422).json({
          message: "Could not identify any medicine in this image. Please try a clearer, well-lit photo of the medicine label.",
        });
      }
      finalMedicineName = minimal.possibleMedicine;
    }

    // ── Step 4: Full AI analysis using the identified name ────────────────────
    const aiData = await analyzeWithAI(finalMedicineName, finalGenericName, finalStrength, combinedText);

    if (!aiData) {
      return res.status(422).json({
        message: "Could not analyze this medicine. Please try a clearer photo.",
      });
    }

    // ── Step 5: Check DB match ────────────────────────────────────────────────
    const medicineName = aiData.medicineName || finalMedicineName;
    let isFake          = true;
    let matchedWith     = null;
    let medicineDetails = null;

    if (medicineName) {
      const cleanName = medicineName.toLowerCase().trim();
      const words     = cleanName.split(" ").filter(w => w.length > 2);
      const approved  = await Medicine.find({ isApproved: true }).select("name brand generic");

      for (const med of approved) {
        const mName    = med.name.toLowerCase().trim();
        const mBrand   = med.brand.toLowerCase().trim();
        const mGeneric = (med.generic || "").toLowerCase().trim();

        const match =
          words.some(w => mName.includes(w) || w.includes(mName) || mBrand.includes(w) || w.includes(mBrand)) ||
          cleanName.includes(mName) || cleanName.includes(mBrand) ||
          (mGeneric && (cleanName.includes(mGeneric) || words.some(w => mGeneric.includes(w))));

        if (match) {
          isFake          = false;
          matchedWith     = `${med.name} (${med.brand})`;
          medicineDetails = await Medicine.findById(med._id).select("-createdBy -ocrData -__v");
          break;
        }
      }
    }

    // ── Step 6: Save result ───────────────────────────────────────────────────
    const confidence = nameResult?.confidence === "high" ? 95
                     : nameResult?.confidence === "medium" ? 80 : 65;

    await OCRResult.create({
      imagePath:       req.file.path || null,
      rawText:         combinedText,
      medicineName,
      confidence,
      isFake,
      matchedWith,
      similarityScore: isFake ? 0 : 1,
      scannedBy:       req.user?._id || null,
    });

    // ── Step 7: Respond ───────────────────────────────────────────────────────
    res.json({
      extractedText:   combinedText,
      medicineName,
      confidence,
      isFake,
      matchedWith,
      medicineDetails,
      aiData,
      ocrFailed,
      message: isFake
        ? `Not found in local database — AI analysis for ${medicineName}`
        : `Matched in database: ${matchedWith}`,
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

// ── Add this function to your ocr.controller.js ───────────────────────────────
// POST /api/ocr/fake-detect

export const fakeDetect = async (req, res) => {
  try {
    if (!req.file || !req.file.processedBuffer) {
      return res.status(400).json({ message: "Image not uploaded or processed" });
    }

    const buffer   = req.file.processedBuffer;
    const filename = req.file.originalname;
    const mimetype = req.file.mimetype;

    // ── Step 1: Run OCR ──────────────────────────────────────────────────────
    const [text2, text1] = await Promise.all([
      runOCR(buffer, filename, mimetype, 2),
      runOCR(buffer, filename, mimetype, 1),
    ]);

    const rawText      = text2.length >= text1.length ? text2 : text1;
    const combinedText = [text2, text1].filter(Boolean).join("\n").trim();

    if (!combinedText || combinedText.length < 3) {
      return res.status(422).json({
        message: "Could not extract text from this image. Please upload a clearer, well-lit photo of the medicine packaging.",
      });
    }

    // ── Step 2: AI Fake Detection Analysis ──────────────────────────────────
    const fakeAnalysis = await groq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `You are a pharmaceutical expert specializing in counterfeit medicine detection in Pakistan.

Analyze this text extracted from a medicine packaging image and determine if it shows signs of being FAKE or COUNTERFEIT.

Extracted Text:
"""${combinedText}"""

Evaluate based on:
1. Spelling errors in medicine name, manufacturer, or instructions
2. Missing required information (batch number, expiry date, registration number)
3. Incorrect or suspicious manufacturer name
4. Poor grammar or unusual language
5. Missing DRAP (Drug Regulatory Authority Pakistan) registration
6. Suspicious or missing active ingredients
7. Incorrect or incomplete dosage information
8. Any other red flags for Pakistani medicine packaging

Return ONLY valid JSON:
{
  "medicineName": "identified medicine name",
  "manufacturer": "manufacturer name from packaging",
  "batchNumber": "batch number if found or null",
  "expiryDate": "expiry date if found or null",
  "registrationNumber": "DRAP or registration number if found or null",
  "verdict": "AUTHENTIC or FAKE or SUSPICIOUS",
  "confidenceScore": 85,
  "fakeIndicators": ["specific reason 1 why it seems fake", "specific reason 2"],
  "authenticityFactors": ["specific reason 1 why it seems authentic", "specific reason 2"],
  "missingElements": ["element 1 that should be on packaging but is missing"],
  "spellingErrors": ["error 1 found in text"],
  "overallRisk": "LOW or MEDIUM or HIGH",
  "recommendation": "One sentence advice for the user",
  "detectedIngredients": ["ingredient 1", "ingredient 2"],
  "detectedDosage": "dosage information if found"
}`
      }],
      max_tokens: 800,
      temperature: 0.1,
    });

    const fakeContent = fakeAnalysis.choices[0]?.message?.content?.trim()
      .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

    let analysisResult;
    try {
      analysisResult = JSON.parse(fakeContent);
    } catch {
      return res.status(422).json({ message: "Could not analyze packaging. Please try a clearer image." });
    }

    // ── Step 3: Determine isFake from verdict ────────────────────────────────
    const isFake      = analysisResult.verdict === "FAKE";
    const isSuspicious = analysisResult.verdict === "SUSPICIOUS";
    const confidence  = analysisResult.confidenceScore || 70;

    // ── Step 4: Check DB for medicine match ──────────────────────────────────
    let matchedWith     = null;
    let medicineDetails = null;

    if (analysisResult.medicineName) {
      const cleanName = analysisResult.medicineName.toLowerCase().trim();
      const words     = cleanName.split(" ").filter(w => w.length > 2);
      const approved  = await Medicine.find({ isApproved: true }).select("name brand generic");

      for (const med of approved) {
        const mName  = med.name.toLowerCase().trim();
        const mBrand = med.brand.toLowerCase().trim();
        const match  =
          words.some(w => mName.includes(w) || w.includes(mName) || mBrand.includes(w)) ||
          cleanName.includes(mName) || cleanName.includes(mBrand);

        if (match) {
          matchedWith     = `${med.name} (${med.brand})`;
          medicineDetails = await Medicine.findById(med._id).select("-createdBy -ocrData -__v");
          break;
        }
      }
    }

    // ── Step 5: Save to OCRResult DB ─────────────────────────────────────────
    await OCRResult.create({
      imagePath:       req.file.path || null,
      rawText:         combinedText,
      medicineName:    analysisResult.medicineName || "Unknown",
      confidence,
      isFake:          isFake || isSuspicious,
      matchedWith,
      similarityScore: matchedWith ? 1 : 0,
      scannedBy:       req.user?._id || null,
    });

    // ── Step 6: Respond ───────────────────────────────────────────────────────
    res.json({
      success:           true,
      extractedText:     combinedText,
      medicineName:      analysisResult.medicineName,
      manufacturer:      analysisResult.manufacturer,
      batchNumber:       analysisResult.batchNumber,
      expiryDate:        analysisResult.expiryDate,
      registrationNumber: analysisResult.registrationNumber,
      verdict:           analysisResult.verdict,           // AUTHENTIC / FAKE / SUSPICIOUS
      confidenceScore:   confidence,
      fakeIndicators:    analysisResult.fakeIndicators || [],
      authenticityFactors: analysisResult.authenticityFactors || [],
      missingElements:   analysisResult.missingElements || [],
      spellingErrors:    analysisResult.spellingErrors || [],
      overallRisk:       analysisResult.overallRisk || "MEDIUM",
      recommendation:    analysisResult.recommendation || "",
      detectedIngredients: analysisResult.detectedIngredients || [],
      detectedDosage:    analysisResult.detectedDosage || "",
      matchedWith,
      medicineDetails,
      isFake:            isFake || isSuspicious,
      message: analysisResult.verdict === "AUTHENTIC"
        ? `✅ Packaging appears authentic${matchedWith ? ` — matched with ${matchedWith}` : ""}`
        : analysisResult.verdict === "FAKE"
        ? `🚨 Suspicious packaging detected — ${analysisResult.fakeIndicators?.[0] || "multiple red flags found"}`
        : `⚠️ Cannot fully verify — please check with your pharmacist`,
    });

  } catch (error) {
    console.error("Fake detect error:", error.message);
    res.status(500).json({ message: "Analysis failed. Please try again." });
  }
};
