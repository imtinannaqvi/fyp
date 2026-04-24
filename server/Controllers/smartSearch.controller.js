import axios from "axios";
import Medicine from "../models/Medicine.js";
import Groq from "groq-sdk";

// ── AI: Generate complete medicine data ───────────────────────────────────────
const getFullAIData = async (medicineName, context = "") => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `You are a senior clinical pharmacist. Provide COMPLETE, ACCURATE, DETAILED medical information about "${medicineName}".
${context ? `Additional context from label/FDA data:\n"""\n${context.slice(0, 800)}\n"""` : ""}

Respond ONLY in valid JSON, no markdown, no extra text:
{
  "name": "brand name",
  "generic": "generic/INN name",
  "brand": "brand name",
  "category": "pharmacological category",
  "description": "clear 3-4 sentence explanation of what this medicine treats and how it works",
  "dosage": "standard dosage e.g. 625mg twice daily",
  "dosageGuide": {
    "adult": "adult dosage with frequency",
    "child": "pediatric dosage or age restriction",
    "elderly": "elderly dose adjustment",
    "notes": "take with food/water, timing notes"
  },
  "sideEffects": ["effect 1", "effect 2", "effect 3", "effect 4", "effect 5"],
  "longTermEffects": ["effect 1", "effect 2", "effect 3"],
  "warnings": ["warning 1", "warning 2", "warning 3", "warning 4"],
  "contraindications": ["contraindication 1", "contraindication 2", "contraindication 3"],
  "drugInteractions": ["drug 1", "drug 2", "drug 3", "drug 4"],
  "foodInteractions": ["food 1", "food 2"],
  "whoShouldNotTake": ["group 1", "group 2", "group 3"],
  "foodTiming": "when and how to take with food",
  "pregnancyWarning": "pregnancy safety — category and reason",
  "breastfeedingWarning": "breastfeeding safety information",
  "requiresPrescription": true,
  "isCommonlyMisused": false,
  "safeAlternatives": ["alternative 1", "alternative 2"],
  "aiExplanation": "simple 3-4 sentence explanation for a non-medical Pakistani person"
}`
      }],
      max_tokens: 1500,
      temperature: 0.2,
    });
    const content = response.choices[0]?.message?.content?.trim();
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch (err) {
    console.error("AI error:", err.message);
    return null;
  }
};

// ── OpenFDA raw fetch ─────────────────────────────────────────────────────────
const fetchFromOpenFDA = async (medicineName) => {
  try {
    const res = await axios.get(
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${medicineName}"&limit=1`,
      { timeout: 8000 }
    );
    const drug = res.data?.results?.[0];
    if (!drug) return null;
    // Return raw context for AI to clean up
    return {
      name:    drug.openfda?.brand_name?.[0]        || medicineName,
      generic: drug.openfda?.generic_name?.[0]      || null,
      brand:   drug.openfda?.manufacturer_name?.[0] || null,
      rawContext: [
        drug.description?.[0] || "",
        drug.dosage_and_administration?.[0] || "",
        drug.adverse_reactions?.[0] || "",
        drug.warnings?.[0] || "",
        drug.contraindications?.[0] || "",
      ].join(" ").slice(0, 800),
    };
  } catch { return null; }
};

// ── Check if medicine needs AI enrichment ────────────────────────────────────
const isIncomplete = (med) => (
  !med.sideEffects?.length       ||
  !med.warnings?.length          ||
  !med.contraindications?.length ||
  !med.drugInteractions?.length  ||
  !med.aiExplanation             ||
  !med.dosageGuide?.adult        ||
  !med.pregnancyWarning          ||
  !med.description               ||
  !med.category                  ||
  !med.foodInteractions?.length  ||
  !med.whoShouldNotTake?.length  ||
  !med.longTermEffects?.length
);

// ── Merge AI data into medicine object (only fill missing fields) ─────────────
const mergeAI = (base, ai) => {
  const u = {};
  if (!base.description              || base.description.length < 30) u.description          = ai.description;
  if (!base.category                 ) u.category             = ai.category;
  if (!base.dosage                   ) u.dosage               = ai.dosage;
  if (!base.dosageGuide?.adult       ) u.dosageGuide          = ai.dosageGuide;
  if (!base.sideEffects?.length      ) u.sideEffects          = ai.sideEffects;
  if (!base.longTermEffects?.length  ) u.longTermEffects      = ai.longTermEffects;
  if (!base.warnings?.length         ) u.warnings             = ai.warnings;
  if (!base.contraindications?.length) u.contraindications    = ai.contraindications;
  if (!base.drugInteractions?.length ) u.drugInteractions     = ai.drugInteractions;
  if (!base.foodInteractions?.length ) u.foodInteractions     = ai.foodInteractions;
  if (!base.whoShouldNotTake?.length ) u.whoShouldNotTake     = ai.whoShouldNotTake;
  if (!base.foodTiming               ) u.foodTiming           = ai.foodTiming;
  if (!base.pregnancyWarning         ) u.pregnancyWarning     = ai.pregnancyWarning;
  if (!base.breastfeedingWarning     ) u.breastfeedingWarning = ai.breastfeedingWarning;
  if (!base.aiExplanation            ) u.aiExplanation        = ai.aiExplanation;
  if (!base.safeAlternatives?.length ) u.safeAlternatives     = ai.safeAlternatives;
  if (base.requiresPrescription == null) u.requiresPrescription = ai.requiresPrescription;
  return u;
};

// ── Main Smart Search ─────────────────────────────────────────────────────────
export const smartSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Search query is required" });

    // ── Step 1: Check local DB ────────────────────────────────────────────────
    const dbMedicines = await Medicine.find({
      $or: [
        { name:    { $regex: q, $options: "i" } },
        { brand:   { $regex: q, $options: "i" } },
        { generic: { $regex: q, $options: "i" } },
      ],
    }).limit(5);

    if (dbMedicines.length > 0) {
      const enriched = await Promise.all(
        dbMedicines.map(async (med) => {
          const obj = med.toObject();
          if (isIncomplete(med)) {
            console.log(`[AI Enrich] ${med.name}`);
            const ai = await getFullAIData(med.name, obj.description || "");
            if (ai) {
              const updates = { isEnriched: true, ...mergeAI(obj, ai) };
              await Medicine.findByIdAndUpdate(med._id, updates);
              return { ...obj, ...updates };
            }
          }
          return obj;
        })
      );
      return res.json({ source: "database", fromDB: true, total: enriched.length, medicines: enriched });
    }

    // ── Step 2: Try OpenFDA — then clean with AI ──────────────────────────────
    const fda = await fetchFromOpenFDA(q);
    if (fda) {
      console.log(`[AI Clean] Cleaning OpenFDA data for ${q}`);
      const ai = await getFullAIData(fda.name || q, fda.rawContext || "");
      if (ai) {
        const result = {
          ...ai,
          name:    fda.name    || ai.name,
          generic: fda.generic || ai.generic,
          brand:   fda.brand   || ai.brand,
          source:  "OpenFDA",
        };
        return res.json({ source: "OpenFDA", fromDB: false, total: 1, medicines: [result] });
      }
    }

    // ── Step 3: Pure AI generation ────────────────────────────────────────────
    console.log(`[AI Generate] ${q}`);
    const ai = await getFullAIData(q);
    if (ai) {
      ai.source = "AI Generated";
      return res.json({ source: "AI Generated", fromDB: false, total: 1, medicines: [ai] });
    }

    res.status(404).json({ message: `No information found for "${q}". Please check the spelling and try again.` });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
