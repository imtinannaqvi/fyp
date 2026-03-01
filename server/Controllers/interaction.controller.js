import Groq from "groq-sdk";

// POST /api/interaction/check
export const checkInteraction = async (req, res) => {
  try {
    // ✅ Initialize INSIDE the function so dotenv is already loaded
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const { medicines } = req.body;

    if (!medicines || medicines.length < 2) {
      return res.status(400).json({ message: "Please provide at least 2 medicine names" });
    }

    const medicineList = medicines.join(", ");

    const prompt = `
You are a clinical pharmacist expert. Analyze drug interactions between these medicines: ${medicineList}

For EACH pair combination, provide interaction analysis.

Respond ONLY with valid JSON in this exact format:
{
  "overall": "safe" or "warning" or "danger",
  "summary": "One line overall summary",
  "interactions": [
    {
      "medicine1": "name",
      "medicine2": "name",
      "severity": "none" or "mild" or "moderate" or "severe",
      "title": "Short interaction title",
      "effect": "What happens when taken together",
      "mechanism": "Why this interaction occurs",
      "recommendation": "What patient should do",
      "timeframe": "When effect occurs e.g. immediately, within hours"
    }
  ],
  "generalTips": [
    "Tip 1",
    "Tip 2"
  ]
}

If no interaction exists between a pair, still include it with severity "none".
Be medically accurate. Base on real pharmacology.
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 2000,
    });

    const raw = response.choices[0]?.message?.content || "";

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ message: "AI response parsing failed" });
    }

    const result = JSON.parse(jsonMatch[0]);
    res.json(result);

  } catch (error) {
    console.error("Interaction check error:", error);
    res.status(500).json({ message: "Failed to check interactions" });
  }
};