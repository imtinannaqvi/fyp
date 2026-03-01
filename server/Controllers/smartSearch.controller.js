import axios from "axios";
import Medicine from "../models/Medicine.js";
import Groq from "groq-sdk";

// ── Helper: Fetch from OpenFDA API ────────────────────────────────────────────
const fetchFromOpenFDA = async (medicineName) => {
  try {
    const response = await axios.get(
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${medicineName}"&limit=1`
    );

    const drug = response.data?.results?.[0];
    if (!drug) return null;

    return {
      name:               drug.openfda?.brand_name?.[0]        || medicineName,
      generic:            drug.openfda?.generic_name?.[0]      || null,
      brand:              drug.openfda?.manufacturer_name?.[0] || "Unknown",
      description:        drug.description?.[0]                || null,
      dosage:             drug.dosage_and_administration?.[0]  || null,
      sideEffects:        drug.adverse_reactions?.[0]
                            ? [drug.adverse_reactions[0].substring(0, 300)]
                            : [],
      contraindications:  drug.contraindications?.[0]
                            ? [drug.contraindications[0].substring(0, 300)]
                            : [],
      warnings:           drug.warnings?.[0]
                            ? [drug.warnings[0].substring(0, 300)]
                            : [],
      requiresPrescription: true,
      source: "OpenFDA",
    };
  } catch (error) {
    return null;
  }
};

// ── Helper: Generate full medicine info using Groq AI ─────────────────────────
const fetchFromGroqAI = async (medicineName) => {
  try {
    // ✅ Initialize inside function
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `
You are a medical information assistant. Provide detailed information about the medicine "${medicineName}".
Respond ONLY in valid JSON format with exactly these fields, no extra text:

{
  "name": "medicine brand name",
  "generic": "generic/chemical name",
  "brand": "common brand name",
  "category": "medicine category (e.g. painkiller, antibiotic)",
  "description": "what this medicine is used for (2-3 sentences)",
  "dosage": "standard dosage",
  "dosageGuide": {
    "adult": "adult dosage",
    "child": "child dosage",
    "elderly": "elderly dosage",
    "notes": "important notes"
  },
  "sideEffects": ["side effect 1", "side effect 2", "side effect 3"],
  "longTermEffects": ["long term effect 1", "long term effect 2"],
  "contraindications": ["who should not take 1", "who should not take 2"],
  "foodInteractions": ["food interaction 1", "food interaction 2"],
  "drugInteractions": ["drug interaction 1", "drug interaction 2"],
  "warnings": ["warning 1", "warning 2"],
  "requiresPrescription": true or false,
  "isCommonlyMisused": true or false,
  "safeAlternatives": ["alternative 1", "alternative 2"],
  "aiExplanation": "simple explanation a non-medical person can understand (3-4 sentences)"
}
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content?.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const data = JSON.parse(jsonMatch[0]);
    data.source = "AI Generated";
    return data;

  } catch (error) {
    console.error("Groq Smart Search Error:", error.message);
    return null;
  }
};

// ── Main Smart Search Controller ──────────────────────────────────────────────
// GET /api/medicine/smart-search?q=aspirin
export const smartSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Search query is required" });

    // ── Step 1: Check our DB first ───────────────────────────────────────────
    const dbMedicines = await Medicine.find({
      $or: [
        { name:    { $regex: q, $options: "i" } },
        { brand:   { $regex: q, $options: "i" } },
        { generic: { $regex: q, $options: "i" } },
      ],
    }).limit(5);

    if (dbMedicines.length > 0) {
      return res.json({
        source:    "database",
        fromDB:    true,
        total:     dbMedicines.length,
        medicines: dbMedicines,
      });
    }

    // ── Step 2: Try OpenFDA API ──────────────────────────────────────────────
    const fdaData = await fetchFromOpenFDA(q);

    if (fdaData) {
      return res.json({
        source:    "OpenFDA",
        fromDB:    false,
        total:     1,
        medicines: [fdaData],
        note: "This medicine was not found in our database. Data fetched from OpenFDA.",
      });
    }

    // ── Step 3: Fallback to Groq AI ──────────────────────────────────────────
    const aiData = await fetchFromGroqAI(q);

    if (aiData) {
      return res.json({
        source:    "AI Generated",
        fromDB:    false,
        total:     1,
        medicines: [aiData],
        note: "⚠️ This medicine was not found in our database or FDA records. Information is AI-generated — consult a doctor before use.",
      });
    }

    // ── Step 4: Nothing found anywhere ──────────────────────────────────────
    res.status(404).json({
      message: `No information found for "${q}". Please check the medicine name and try again.`,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};