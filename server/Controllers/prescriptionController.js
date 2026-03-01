import Tesseract from "tesseract.js";
import Groq from "groq-sdk";
import Medicine from "../models/Medicine.js";

export const scanPrescription = async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    if (!req.file || !req.file.processedBuffer) {
      return res.status(400).json({ message: "Please upload a prescription image" });
    }

    // ── Step 1: OCR ──────────────────────────────────────────────────────────
    const { data: { text, confidence } } = await Tesseract.recognize(
      req.file.processedBuffer,
      "eng"
    );

    if (!text || text.trim().length < 3) {
      return res.status(422).json({
        message: "Could not read prescription. Please upload a clearer image.",
      });
    }

    // ── Step 2: Extract medicine names using Groq AI ─────────────────────────
    const extractResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `
You are a medical prescription reader. Extract all medicine names from this prescription text.
Prescription text: "${text}"

Respond ONLY in valid JSON format:
{
  "medicineNames": ["medicine1", "medicine2"],
  "doctorName": "doctor name if visible or null",
  "patientName": "patient name if visible or null",
  "date": "date if visible or null"
}
Extract only medicine names. Ignore dosage numbers, clinic names, addresses.`
      }],
      max_tokens: 400,
      temperature: 0.2,
    });

    const extractContent = extractResponse.choices[0]?.message?.content?.trim();
    const extractJson    = extractContent.match(/\{[\s\S]*\}/);

    if (!extractJson) {
      return res.status(500).json({ message: "Failed to read prescription. Try again." });
    }

    const extracted = JSON.parse(extractJson[0]);

    if (!extracted.medicineNames || extracted.medicineNames.length === 0) {
      return res.status(404).json({
        message: "No medicines found in prescription. Please upload a clearer image.",
        rawText: text,
      });
    }

    // ── Step 3: Get full info for each medicine ───────────────────────────────
    const medicinesInfo = await Promise.all(
      extracted.medicineNames.map(async (medName) => {
        const dbMedicine = await Medicine.findOne({
          $or: [
            { name:    { $regex: medName, $options: "i" } },
            { generic: { $regex: medName, $options: "i" } },
            { brand:   { $regex: medName, $options: "i" } },
          ],
        }).select("name brand generic category description dosage sideEffects contraindications foodInteractions requiresPrescription aiExplanation");

        if (dbMedicine) {
          return { name: dbMedicine.name, source: "database", inDatabase: true, details: dbMedicine };
        }

        const aiRes = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{
            role: "user",
            content: `Give brief info about medicine "${medName}" in JSON only:
{
  "name": "${medName}",
  "use": "what it is used for",
  "sideEffects": ["side effect 1", "side effect 2"],
  "warning": "main warning"
}`
          }],
          max_tokens: 200,
          temperature: 0.3,
        });

        const aiContent = aiRes.choices[0]?.message?.content?.trim();
        const aiJson    = aiContent.match(/\{[\s\S]*\}/);
        const aiData    = aiJson ? JSON.parse(aiJson[0]) : { name: medName };

        return { name: medName, source: "AI Generated", inDatabase: false, details: aiData };
      })
    );

    // ── Step 4: Check interactions using Groq AI ──────────────────────────────
    let interactionResult = { hasInteractions: false, total: 0, details: [] };

    if (extracted.medicineNames.length >= 2) {
      try {
        const intResponse = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{
            role: "user",
            content: `Analyze drug interactions between: ${extracted.medicineNames.join(", ")}
Respond ONLY in valid JSON:
{
  "overall": "safe" or "warning" or "danger",
  "interactions": [
    {
      "medicine1": "name",
      "medicine2": "name",
      "severity": "none" or "mild" or "moderate" or "severe",
      "effect": "what happens",
      "recommendation": "what to do"
    }
  ]
}`
          }],
          max_tokens: 800,
          temperature: 0.2,
        });

        const intContent = intResponse.choices[0]?.message?.content?.trim();
        const intJson    = intContent.match(/\{[\s\S]*\}/);

        if (intJson) {
          const intData = JSON.parse(intJson[0]);
          const serious = intData.interactions?.filter(i => i.severity !== "none") || [];
          interactionResult = {
            hasInteractions: serious.length > 0,
            overall:         intData.overall,
            total:           serious.length,
            details:         intData.interactions || [],
          };
        }
      } catch (e) {
        console.error("Interaction check failed:", e.message);
      }
    }

    // ── Step 5: Return full analysis ─────────────────────────────────────────
    res.json({
      ocrConfidence: Math.round(confidence),
      rawText:       text,
      prescriptionInfo: {
        doctorName:  extracted.doctorName,
        patientName: extracted.patientName,
        date:        extracted.date,
      },
      totalMedicines: medicinesInfo.length,
      medicines:      medicinesInfo,
      interactions:   interactionResult,
      warning: "⚠️ Always follow your doctor's instructions. This analysis is for information only.",
    });

  } catch (error) {
    console.error("Prescription Scanner Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};