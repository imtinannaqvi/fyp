import Medicine from "../models/Medicine.js";
import User from "../models/user.js";
import Groq from "groq-sdk";

// ── Helper: Generate AI explanation ──────────────────────────────────────────
const generateMedicineExplanation = async (medicine) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
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
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
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

// ── Helper: Detect overdose/multiple-tablet intent ─────────────────────────
const detectOverdoseIntent = (message) => {
  const lower = message.toLowerCase();
  // matches: "took 2 tabs", "took 3 tablets", "ate 5 pills", "took many tabs", "took too many", "overdose"
  return /took\s+(\d+|many|too many|several|multiple|a lot of)\s*(tab|tablet|pill|capsule|cap|mg|dose)/i.test(lower) ||
    /ate\s+(\d+|many|too many|several|multiple)\s*(tab|tablet|pill|capsule|cap)/i.test(lower) ||
    /overdose|over dose|over-dose/i.test(lower) ||
    /(\d+|many|too many)\s*(tab|tablet|pill|capsule)s?\s*(of|at once|together)/i.test(lower);
};

// ── Helper: Detect medicine name from user message ────────────────────────────
const extractMedicineFromMessage = async (userMessage) => {
  try {
    const medicines = await Medicine.find({ isApproved: true })
      .select("name brand generic");

    const msgLower = userMessage.toLowerCase();

    // Check if any medicine name/brand/generic matches the message
    for (const med of medicines) {
      if (
        msgLower.includes(med.name.toLowerCase()) ||
        (med.brand && msgLower.includes(med.brand.toLowerCase())) ||
        (med.generic && msgLower.includes(med.generic.toLowerCase()))
      ) {
        return med;
      }
    }
    return null;
  } catch (err) {
    console.error("Medicine extract error:", err.message);
    return null;
  }
};

// ── Helper: Build medicine context string ─────────────────────────────────────
const buildMedicineContext = (medicine) => {
  return `
MEDICINE FOUND IN DATABASE:
- Name: ${medicine.name}
- Brand: ${medicine.brand || "N/A"}
- Generic: ${medicine.generic || "N/A"}
- Category: ${medicine.category || "N/A"}
- Description: ${medicine.description || "N/A"}
- Dosage: ${medicine.dosage || "N/A"}
- Side Effects: ${Array.isArray(medicine.sideEffects) ? medicine.sideEffects.join(", ") : medicine.sideEffects || "N/A"}
- Contraindications: ${Array.isArray(medicine.contraindications) ? medicine.contraindications.join(", ") : medicine.contraindications || "N/A"}
- Food Interactions: ${Array.isArray(medicine.foodInteractions) ? medicine.foodInteractions.join(", ") : medicine.foodInteractions || "N/A"}
- Requires Prescription: ${medicine.requiresPrescription ? "Yes" : "No"}
- AI Explanation: ${medicine.aiExplanation || "N/A"}
`;
};

// ── Generate & Save AI Explanation (Admin) ────────────────────────────────────
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
      medicine:        medicine.name,
      brand:           medicine.brand,
      userProfile: {
        age:        user.age,
        weight:     user.weight,
        gender:     user.gender,
        conditions: user.conditions,
        allergies:  user.allergies,
      },
      standardDosage:  medicine.dosage || "Not specified",
      recommendation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Bulk generate explanations (Admin) ───────────────────────────────────────
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

// ── MediBot Chat ──────────────────────────────────────────────────────────────
// POST /api/ai/medibot
export const medibotChat = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages))
      return res.status(400).json({ message: "Messages array is required" });

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // ── Detect medicine in latest user message ────────────────────────────────
    const lastUserMessage = [...messages].reverse().find(m => m.role === "user")?.content || "";
    const matchedMedicine = await extractMedicineFromMessage(lastUserMessage);
    const medicineContext = matchedMedicine ? buildMedicineContext(matchedMedicine) : "";

    const isOverdose = detectOverdoseIntent(lastUserMessage);

    const overdoseInstruction = isOverdose ? `
⚠️ OVERDOSE / MULTIPLE DOSE ALERT DETECTED:
The user has mentioned taking multiple tablets or a potentially dangerous dose.
You MUST:
1. Immediately warn them this is DANGEROUS and they should NOT do this.
2. Tell them the safe/standard dosage of the medicine if known.
3. List the serious risks and overdose symptoms for this medicine.
4. Strongly advise them to contact a doctor or go to emergency NOW if they already took too many.
5. Tell them NOT to take more doses.
Be urgent, caring, and clear. This is a safety emergency response.
` : "";

    const systemPrompt = `You are MediBot, an AI medicine safety assistant for Medico Guidance — a Pakistani health web app.
Your job is to:
1. Answer questions about self-medication risks and medicine safety
2. Explain dangers of specific medicines when misused (e.g. Panadol overdose, antibiotic resistance)
3. Guide users to the right feature of the app when relevant
4. Answer general medicine safety questions in simple, clear English
5. When a medicine is mentioned, use the provided database info to give accurate, specific details

Available app pages you can refer users to:
- /search → Search any medicine for info, dosage, side effects
- /symptoms → Check symptoms
- /interactions → Check drug interactions
- /ocr → Scan a medicine image
- /prescription → Scan a prescription
- /reminders → Set medicine reminders
- /awareness → Self-medication awareness page

Rules:
- Keep responses SHORT (3–5 sentences max)
- Use simple language suitable for Pakistani users
- When relevant, suggest an app page in this exact format: [GO:/path|Button Label]
- Never diagnose. Always recommend consulting a doctor for serious concerns.
- Be friendly and caring in tone
- If medicine database info is provided below, USE IT to give accurate details about that specific medicine

${overdoseInstruction}
${medicineContext ? `\n${medicineContext}\nUse the above medicine data to answer accurately.` : ""}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 400,
      temperature: 0.5,
    });

    const reply = response.choices?.[0]?.message?.content?.trim();
    if (!reply) return res.status(500).json({ message: "No response from AI" });

    // ── Return reply + matched medicine details if found ──────────────────────
    res.json({
      reply,
      overdoseAlert: isOverdose,
      ...(matchedMedicine && {
        medicineFound: {
          id:                  matchedMedicine._id,
          name:                matchedMedicine.name,
          brand:               matchedMedicine.brand,
          generic:             matchedMedicine.generic,
          category:            matchedMedicine.category,
          dosage:              matchedMedicine.dosage,
          sideEffects:         matchedMedicine.sideEffects,
          contraindications:   matchedMedicine.contraindications,
          requiresPrescription: matchedMedicine.requiresPrescription,
          aiExplanation:       matchedMedicine.aiExplanation,
        }
      }),
    });

  } catch (err) {
    console.error("MediBot error:", err.message);
    res.status(500).json({ message: err.message });
  }
};