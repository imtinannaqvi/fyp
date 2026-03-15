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
      sideEffects:        drug.adverse_reactions?.[0] ? [drug.adverse_reactions[0].substring(0, 300)] : [],
      contraindications:  drug.contraindications?.[0] ? [drug.contraindications[0].substring(0, 300)] : [],
      warnings:           drug.warnings?.[0] ? [drug.warnings[0].substring(0, 300)] : [],
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
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `You are a medical information assistant. Provide detailed information about the medicine "${medicineName}".
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
  "foodInteractions": ["food to avoid 1", "food to avoid 2"],
  "drugInteractions": ["drug interaction 1", "drug interaction 2"],
  "warnings": ["warning 1", "warning 2"],
  "whoShouldNotTake": ["pregnant women", "patients with kidney disease"],
  "foodTiming": "Take after meals to reduce stomach irritation",
  "pregnancyWarning": "Safety information during pregnancy",
  "breastfeedingWarning": "Safety information during breastfeeding",
  "requiresPrescription": true,
  "isCommonlyMisused": false,
  "safeAlternatives": ["alternative 1", "alternative 2"],
  "aiExplanation": "simple explanation a non-medical person can understand (3-4 sentences)"
}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1200,
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

// ── Helper: Enrich existing DB medicine with missing fields via Groq ──────────
const enrichMedicineFromGroq = async (medicine) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `You are a medical information assistant. Enrich the following medicine data for "${medicine.name}".
Only fill in the missing/empty fields listed below. Respond ONLY in valid JSON, no extra text.

Return ONLY this JSON structure:
{
  "whoShouldNotTake": ["group 1 who should avoid", "group 2 who should avoid"],
  "foodTiming": "When and how to take with food (e.g. Take after meals)",
  "pregnancyWarning": "Is this medicine safe during pregnancy? Explain briefly.",
  "breastfeedingWarning": "Is this medicine safe during breastfeeding? Explain briefly.",
  "foodInteractions": ["food/drink to avoid 1", "food/drink to avoid 2"],
  "sideEffects": ["common side effect 1", "common side effect 2", "common side effect 3"],
  "longTermEffects": ["long term effect 1", "long term effect 2"],
  "dosageGuide": {
    "adult": "adult dosage",
    "child": "child dosage",
    "elderly": "elderly dosage",
    "notes": "take with food or any important note"
  },
  "aiExplanation": "Simple 2-3 sentence explanation for a non-medical Pakistani person"
}

Medicine context:
- Name: ${medicine.name}
- Generic: ${medicine.generic || "unknown"}
- Category: ${medicine.category || "unknown"}
- Description: ${medicine.description || "not provided"}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content?.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("Enrich error:", err.message);
    return null;
  }
};

// ── Check if medicine needs enrichment ───────────────────────────────────────
const needsEnrichment = (medicine) => {
  return (
    !medicine.isEnriched &&
    (
      !medicine.whoShouldNotTake?.length ||
      !medicine.pregnancyWarning ||
      !medicine.breastfeedingWarning ||
      !medicine.foodTiming ||
      !medicine.aiExplanation ||
      !medicine.sideEffects?.length ||
      !medicine.foodInteractions?.length
    )
  );
};

// ── Main Smart Search Controller ──────────────────────────────────────────────
export const smartSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Search query is required" });

    // ── Step 1: Check DB first ───────────────────────────────────────────────
    const dbMedicines = await Medicine.find({
      $or: [
        { name:    { $regex: q, $options: "i" } },
        { brand:   { $regex: q, $options: "i" } },
        { generic: { $regex: q, $options: "i" } },
      ],
    }).limit(5);

    if (dbMedicines.length > 0) {
      // ── Auto-enrich medicines missing key fields ──────────────────────────
      const enrichedMedicines = await Promise.all(
        dbMedicines.map(async (med) => {
          if (needsEnrichment(med)) {
            console.log(`[Enrich] Enriching ${med.name}...`);
            const enriched = await enrichMedicineFromGroq(med);
            if (enriched) {
              // Only update fields that are actually missing
              const updates = { isEnriched: true };
              if (!med.whoShouldNotTake?.length && enriched.whoShouldNotTake?.length)
                updates.whoShouldNotTake = enriched.whoShouldNotTake;
              if (!med.pregnancyWarning && enriched.pregnancyWarning)
                updates.pregnancyWarning = enriched.pregnancyWarning;
              if (!med.breastfeedingWarning && enriched.breastfeedingWarning)
                updates.breastfeedingWarning = enriched.breastfeedingWarning;
              if (!med.foodTiming && enriched.foodTiming)
                updates.foodTiming = enriched.foodTiming;
              if (!med.aiExplanation && enriched.aiExplanation)
                updates.aiExplanation = enriched.aiExplanation;
              if (!med.sideEffects?.length && enriched.sideEffects?.length)
                updates.sideEffects = enriched.sideEffects;
              if (!med.foodInteractions?.length && enriched.foodInteractions?.length)
                updates.foodInteractions = enriched.foodInteractions;
              if (!med.longTermEffects?.length && enriched.longTermEffects?.length)
                updates.longTermEffects = enriched.longTermEffects;
              if (enriched.dosageGuide && !med.dosageGuide?.adult)
                updates.dosageGuide = enriched.dosageGuide;

              // Save to DB so next search is instant
              await Medicine.findByIdAndUpdate(med._id, updates);

              // Return merged medicine to user immediately
              return { ...med.toObject(), ...updates };
            }
          }
          return med.toObject();
        })
      );

      return res.json({
        source:    "database",
        fromDB:    true,
        total:     enrichedMedicines.length,
        medicines: enrichedMedicines,
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
        note: "⚠️ AI-generated information — consult a doctor before use.",
      });
    }

    res.status(404).json({
      message: `No information found for "${q}". Please check the medicine name and try again.`,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};