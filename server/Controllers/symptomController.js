import Groq from "groq-sdk";
import Medicine from "../models/Medicine.js";

// ── Symptom Checker ───────────────────────────────────────────────────────────
// POST /api/symptom/check
export const checkSymptoms = async (req, res) => {
  try {
    // ✅ Initialize inside function
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        message: "Please provide symptoms array e.g. ['headache', 'fever']",
      });
    }

    const symptomList = symptoms.join(", ");

    const prompt = `
You are a medical assistant helping Pakistani users understand what medicines they might need.
A user has the following symptoms: ${symptomList}

Respond ONLY in valid JSON format with no extra text:
{
  "possibleCondition": "what condition these symptoms suggest",
  "severity": "mild/moderate/severe",
  "suggestedMedicines": [
    {
      "name": "medicine name",
      "reason": "why this medicine helps",
      "dosage": "basic dosage info",
      "warning": "important warning"
    }
  ],
  "homeRemedies": ["remedy 1", "remedy 2"],
  "whenToSeeDoctor": "when should they visit a doctor",
  "disclaimer": "always consult a doctor before taking any medicine"
}
Suggest maximum 3 medicines. Focus on commonly available Pakistani medicines.
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content?.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ message: "Failed to analyze symptoms. Try again." });
    }

    const aiResult = JSON.parse(jsonMatch[0]);

    // ── Enrich with DB data if available ─────────────────────────────────────
    const enrichedMedicines = await Promise.all(
      aiResult.suggestedMedicines.map(async (suggestion) => {
        const dbMedicine = await Medicine.findOne({
          $or: [
            { name:    { $regex: suggestion.name, $options: "i" } },
            { generic: { $regex: suggestion.name, $options: "i" } },
          ],
          isApproved: true,
        }).select("name brand generic description sideEffects contraindications requiresPrescription aiExplanation");

        return {
          ...suggestion,
          inDatabase:  !!dbMedicine,
          medicineId:  dbMedicine?._id || null,
          fullDetails: dbMedicine || null,
        };
      })
    );

    res.json({
      symptoms:           symptomList,
      possibleCondition:  aiResult.possibleCondition,
      severity:           aiResult.severity,
      suggestedMedicines: enrichedMedicines,
      homeRemedies:       aiResult.homeRemedies,
      whenToSeeDoctor:    aiResult.whenToSeeDoctor,
      disclaimer:         "⚠️ " + aiResult.disclaimer,
    });

  } catch (error) {
    console.error("Symptom Checker Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};