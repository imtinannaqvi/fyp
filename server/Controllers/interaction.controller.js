import Groq from "groq-sdk";
import Interaction from "../models/interaction.js"

export const checkInteraction = async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { medicines } = req.body;

    if (!medicines || medicines.length < 2) {
      return res.status(400).json({ message: "Please provide at least 2 medicine names" });
    }

    const cleaned = medicines.map((m) => m.trim().toLowerCase());

    // ── Layer 1: Check MongoDB for known interactions ──
    const dbResults = [];
    for (let i = 0; i < cleaned.length; i++) {
      for (let j = i + 1; j < cleaned.length; j++) {
        const a = cleaned[i], b = cleaned[j];
        const found = await Interaction.findOne({
          $or: [
            { medicineA: a, medicineB: b },
            { medicineA: b, medicineB: a },
          ],
        });
        if (found) dbResults.push(found);
      }
    }

    // ── Layer 2: If DB has all pairs covered, return without AI call ──
    const totalPairs = (cleaned.length * (cleaned.length - 1)) / 2;
    if (dbResults.length === totalPairs) {
      return res.json(formatDbResults(dbResults, cleaned));
    }

    // ── Layer 3: Call Groq AI for remaining/unknown pairs ──
    const prompt = buildPrompt(medicines);
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

    // ── Optional: Save new AI-found interactions to DB for future use ──
    for (const interaction of result.interactions) {
      if (interaction.severity !== "none") {
        const exists = await Interaction.findOne({
          $or: [
            { medicineA: interaction.medicine1.toLowerCase(), medicineB: interaction.medicine2.toLowerCase() },
            { medicineA: interaction.medicine2.toLowerCase(), medicineB: interaction.medicine1.toLowerCase() },
          ],
        });
        if (!exists) {
          await Interaction.create({
            medicineA: interaction.medicine1.toLowerCase(),
            medicineB: interaction.medicine2.toLowerCase(),
            severity: mapSeverity(interaction.severity),
            description: interaction.effect,
            recommendation: interaction.recommendation,
            source: "AI-generated (Groq/LLaMA)",
          });
        }
      }
    }

    res.json(result);

  } catch (error) {
    console.error("Interaction check error:", error);
    res.status(500).json({ message: "Failed to check interactions" });
  }
};

// Maps Groq severity format → your DB enum
function mapSeverity(groqSeverity) {
  const map = { none: "low", mild: "low", moderate: "moderate", severe: "critical" };
  return map[groqSeverity] || "low";
}

// Formats DB results into same shape as Groq response
function formatDbResults(dbResults, medicines) {
  const severityMap = { low: "mild", moderate: "moderate", high: "severe", critical: "severe" };
  const overallSeverities = dbResults.map((r) => r.severity);

  let overall = "safe";
  if (overallSeverities.includes("critical") || overallSeverities.includes("high")) overall = "danger";
  else if (overallSeverities.includes("moderate")) overall = "warning";

  return {
    overall,
    summary: `Found ${dbResults.length} known interaction(s) from database.`,
    source: "database",
    interactions: dbResults.map((r) => ({
      medicine1: r.medicineA,
      medicine2: r.medicineB,
      severity: severityMap[r.severity] || "mild",
      title: `${r.medicineA} + ${r.medicineB}`,
      effect: r.description,
      mechanism: "See clinical reference.",
      recommendation: r.recommendation,
      timeframe: "Varies",
    })),
    generalTips: ["Always consult a pharmacist before combining medicines."],
  };
}

function buildPrompt(medicines) {
  const medicineList = medicines.join(", ");
  return `
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
      "timeframe": "When effect occurs"
    }
  ],
  "generalTips": ["Tip 1", "Tip 2"]
}

If no interaction exists between a pair, still include it with severity "none".
Be medically accurate. Base on real pharmacology.`;
}