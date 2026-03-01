import Groq from "groq-sdk"
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Generate AI Explanation for a medicine ────────────────────────────────────
export const generateMedicineExplanation = async (medicine) => {
  try {
    const prompt = `
You are a medical education assistant. Write a simple, easy-to-understand explanation for the following medicine. 
Use plain language that a non-medical person in Pakistan can understand.
Keep it under 150 words.

Medicine Name: ${medicine.name}
Brand: ${medicine.brand}
Generic/Chemical Name: ${medicine.generic || "N/A"}
Category: ${medicine.category || "N/A"}
Description: ${medicine.description || "N/A"}
Side Effects: ${medicine.sideEffects?.join(", ") || "N/A"}
Long Term Effects: ${medicine.longTermEffects?.join(", ") || "N/A"}
Contraindications: ${medicine.contraindications?.join(", ") || "N/A"}

Write the explanation in this format:
1. What it is and what it does
2. Who should not take it
3. Important warning
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",  // ✅ updated
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error("Groq AI Error:", error.message);
    return null;
  }
};

// ── Generate personalized dosage recommendation ───────────────────────────────
export const generateDosageRecommendation = async (medicine, userProfile) => {
  try {
    const prompt = `
You are a medical dosage advisor. Based on the medicine details and patient profile below, 
provide a safe and personalized dosage recommendation.
Keep it under 100 words. Be specific and clear.
Always end with "Consult your doctor before taking any medicine."

Medicine: ${medicine.name} (${medicine.generic || medicine.brand})
Category: ${medicine.category || "N/A"}
Standard Dosage: ${medicine.dosage || "N/A"}
Standard Guide - Adult: ${medicine.dosageGuide?.adult || "N/A"}
Standard Guide - Child: ${medicine.dosageGuide?.child || "N/A"}
Standard Guide - Elderly: ${medicine.dosageGuide?.elderly || "N/A"}

Patient Profile:
- Age: ${userProfile.age || "Not provided"}
- Weight: ${userProfile.weight ? userProfile.weight + "kg" : "Not provided"}
- Gender: ${userProfile.gender || "Not provided"}
- Medical Conditions: ${userProfile.conditions?.join(", ") || "None"}
- Known Allergies: ${userProfile.allergies?.join(", ") || "None"}

Provide personalized dosage recommendation for this specific patient.
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",  // ✅ fixed — was llama3-8b-8192
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.5,
    });

    return response.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error("Groq Dosage Error:", error.message);
    return null;
  }
};