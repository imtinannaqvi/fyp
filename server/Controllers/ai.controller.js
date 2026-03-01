import Medicine from "../models/Medicine.js";
import User from "../models/user.js";
import Groq from "groq-sdk";

// ── Helper: Generate AI explanation ──────────────────────────────────────────
const generateMedicineExplanation = async (medicine) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); // ✅ inside function
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Explain the medicine "${medicine.name}" (${medicine.generic || ""}) in simple words that a non-medical person in Pakistan can understand. 
Include: what it is used for, how it works, key warnings. Keep it to 3-4 sentences. No JSON, just plain text.`
      }],
      max_tokens: 300,
      temperature: 0.4,
    });
    return response.choices[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error("Explanation error:", err.message);
    return null;
  }
};

// ── Helper: Generate personalized dosage ─────────────────────────────────────
const generateDosageRecommendation = async (medicine, user) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); // ✅ inside function
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `You are a clinical pharmacist. Give a personalized dosage recommendation for:
Medicine: ${medicine.name} (${medicine.generic || ""})
Standard dosage: ${medicine.dosage || "not specified"}
Patient profile:
- Age: ${user.age || "unknown"}
- Weight: ${user.weight || "unknown"} kg
- Gender: ${user.gender || "unknown"}
- Medical conditions: ${user.conditions?.join(", ") || "none"}
- Allergies: ${user.allergies?.join(", ") || "none"}

Give a specific dosage recommendation for this patient. Include any warnings based on their conditions or allergies. Keep it to 3-4 sentences. Plain text only.`
      }],
      max_tokens: 300,
      temperature: 0.3,
    });
    return response.choices[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error("Dosage error:", err.message);
    return null;
  }
};

// ── Generate & Save AI Explanation (Admin) ────────────────────────────────────
// POST /api/ai/explain/:medicineId
export const generateExplanation = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.medicineId);
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });

    const explanation = await generateMedicineExplanation(medicine);
    if (!explanation) return res.status(500).json({ message: "Failed to generate explanation." });

    medicine.aiExplanation = explanation;
    await medicine.save();

    res.json({
      message:      "AI explanation generated successfully",
      medicineName: medicine.name,
      explanation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Get Personalized Dosage ───────────────────────────────────────────────────
// GET /api/ai/dosage/:medicineId
export const getPersonalizedDosage = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.medicineId);
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });

    const user = await User.findById(req.user._id).select(
      "age weight gender conditions allergies"
    );

    if (!user.age && !user.weight && !user.conditions?.length) {
      return res.status(400).json({
        message: "Please complete your health profile first (age, weight, conditions) for personalized dosage.",
      });
    }

    const recommendation = await generateDosageRecommendation(medicine, user);
    if (!recommendation) return res.status(500).json({ message: "Failed to generate dosage." });

    res.json({
      medicine:           medicine.name,
      brand:              medicine.brand,
      userProfile: {
        age:        user.age,
        weight:     user.weight,
        gender:     user.gender,
        conditions: user.conditions,
        allergies:  user.allergies,
      },
      standardDosage:     medicine.dosage || "Not specified",
      recommendation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Bulk generate explanations (Admin) ───────────────────────────────────────
// POST /api/ai/explain-all
export const generateAllExplanations = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      $or: [
        { aiExplanation: null },
        { aiExplanation: "" },
        { aiExplanation: { $exists: false } },
      ],
    });

    if (medicines.length === 0) {
      return res.json({ message: "All medicines already have AI explanations" });
    }

    let successCount = 0;
    let failCount    = 0;

    for (const medicine of medicines) {
      const explanation = await generateMedicineExplanation(medicine);
      if (explanation) {
        medicine.aiExplanation = explanation;
        await medicine.save();
        successCount++;
      } else {
        failCount++;
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    res.json({
      message: `Done! Generated ${successCount} explanations. Failed: ${failCount}`,
      successCount,
      failCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};