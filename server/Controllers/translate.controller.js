// ── Add this function to your existing ai.controller.js ──────────────────────
// Also add to ai.routes.js:  router.post("/translate", translateMedicine);

import Groq from "groq-sdk";

export const translateMedicine = async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const { medicine } = req.body;

    if (!medicine || !medicine.name) {
      return res.status(400).json({ message: "Medicine data is required" });
    }

    // Build only the fields that exist
    const fieldsToTranslate = {
      name:                 medicine.name,
      description:          medicine.description,
      aiExplanation:        medicine.aiExplanation,
      dosage:               medicine.dosage,
      sideEffects:          medicine.sideEffects,
      contraindications:    medicine.contraindications,
      warnings:             medicine.warnings,
      drugInteractions:     medicine.drugInteractions,
      foodInteractions:     medicine.foodInteractions,
      longTermEffects:      medicine.longTermEffects,
      whoShouldNotTake:     medicine.whoShouldNotTake,
      pregnancyWarning:     medicine.pregnancyWarning,
      breastfeedingWarning: medicine.breastfeedingWarning,
      foodTiming:           medicine.foodTiming,
      dosageGuide:          medicine.dosageGuide,
      safeAlternatives:     medicine.safeAlternatives,
    };

    // Remove undefined/null/empty fields
    const cleaned = Object.fromEntries(
      Object.entries(fieldsToTranslate).filter(([_, v]) =>
        v !== undefined && v !== null && v !== "" &&
        !(Array.isArray(v) && v.length === 0)
      )
    );

    const prompt = `You are a medical translator. Translate the following medicine information from English to Urdu.

STRICT RULES:
- Translate ALL text values to Urdu
- Keep all JSON keys in English (do not translate keys)
- Keep medicine names, brand names, and drug names in English (just transliterate if needed)
- Arrays should remain arrays, objects should remain objects
- Preserve the exact same JSON structure
- Use simple, easy-to-understand Urdu that a common Pakistani person can read
- Do NOT add any extra text, explanation, or markdown — respond ONLY with valid JSON

Input JSON:
${JSON.stringify(cleaned, null, 2)}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 3000,
    });

    const raw = response.choices[0]?.message?.content || "";

    // Extract JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ message: "Translation parsing failed" });
    }

    const translated = JSON.parse(jsonMatch[0]);

    return res.json({ success: true, translated });

  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ message: "Translation failed", error: error.message });
  }
};