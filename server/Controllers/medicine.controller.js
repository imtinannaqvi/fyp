import Medicine from "../models/Medicine.js";
import { detectDuplicateMedicine } from "../utils/fakeDetection.js";
import Groq from "groq-sdk";

// ------------------------
// Create Medicine
// ------------------------
export const createMedicine = async (req, res) => {
  try {
    const { name } = req.body;

    const duplicateCheck = await detectDuplicateMedicine(name);
    if (duplicateCheck.isDuplicate) {
      return res.status(400).json({
        message: "Potential duplicate medicine detected",
        matchedWith: duplicateCheck.matchedWith,
        similarityScore: duplicateCheck.similarityScore,
      });
    }

    const parseArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch { return [val]; }
    };

    const parseObject = (val) => {
      if (!val) return {};
      if (typeof val === "object") return val;
      try { return JSON.parse(val); } catch { return {}; }
    };

    const medicine = await Medicine.create({
      name:        req.body.name,
      brand:       req.body.brand,
      generic:     req.body.generic,
      category:    req.body.category,
      description: req.body.description,
      price:       req.body.price,
      stock:       req.body.stock,
      dosage:      req.body.dosage,
      barcode:     req.body.barcode || "",
      dosageGuide: parseObject(req.body.dosageGuide),
      sideEffects:       parseArray(req.body.sideEffects),
      longTermEffects:   parseArray(req.body.longTermEffects),
      contraindications: parseArray(req.body.contraindications),
      foodInteractions:  parseArray(req.body.foodInteractions),
      drugInteractions:  parseArray(req.body.drugInteractions),
      warnings:          parseArray(req.body.warnings),
      requiresPrescription: req.body.requiresPrescription === "true" || req.body.requiresPrescription === true,
      isCommonlyMisused:    req.body.isCommonlyMisused === "true" || req.body.isCommonlyMisused === true,
      safeAlternatives: parseArray(req.body.safeAlternatives),
      aiExplanation: req.body.aiExplanation,
      ocrData:       req.body.ocrData,
      image: req.file ? `/uploads/${req.file.originalname}` : req.body.image,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Medicine created successfully", medicine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------------
// Get All Medicines
// ------------------------
export const getMedicines = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;
    const filter = {};

    if (req.query.q) {
      filter.$or = [
        { name:     { $regex: req.query.q, $options: "i" } },
        { brand:    { $regex: req.query.q, $options: "i" } },
        { generic:  { $regex: req.query.q, $options: "i" } },
        { category: { $regex: req.query.q, $options: "i" } },
      ];
    }

    if (req.query.category)             filter.category             = { $regex: req.query.category, $options: "i" };
    if (req.query.requiresPrescription) filter.requiresPrescription = req.query.requiresPrescription === "true";
    if (req.query.isApproved)           filter.isApproved           = req.query.isApproved === "true";
    if (req.query.isSuspicious)         filter.isSuspicious         = req.query.isSuspicious === "true";
    if (req.query.isCommonlyMisused)    filter.isCommonlyMisused    = req.query.isCommonlyMisused === "true";

    const [medicines, total] = await Promise.all([
      Medicine.find(filter)
        .populate("createdBy", "name email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Medicine.countDocuments(filter),
    ]);

    res.json({ total, page, pages: Math.ceil(total / limit), medicines });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------------
// Get Single Medicine
// ------------------------
export const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
      .populate("createdBy", "name email");
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch medicine", error: error.message });
  }
};

// ------------------------
// Search Medicines
// ------------------------
export const searchMedicines = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Search query is required" });

    const medicines = await Medicine.find({
      $or: [
        { name:     { $regex: q, $options: "i" } },
        { brand:    { $regex: q, $options: "i" } },
        { generic:  { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
      isApproved: true,
    })
      .select("name brand generic category description dosage requiresPrescription isCommonlyMisused image")
      .limit(20)
      .sort({ name: 1 });

    res.json({ total: medicines.length, medicines });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------------
// Autocomplete Suggestions
// ------------------------
// Replace your existing autocompleteMedicines function with this fixed version

export const autocompleteMedicines = async (req, res) => {
  try {
    const { q } = req.query;

    // Return empty suggestions if query is missing or too short
    if (!q || q.trim().length < 1) {
      return res.json({ suggestions: [] });
    }

    // Escape regex special characters to prevent regex errors
    const escapeRegex = (text) =>
      text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const safeQuery = escapeRegex(q.trim());

    // IMPORTANT:
    // Removed `isApproved: true` because many medicines may not be approved yet.
    // This was the main reason no data was being returned.
    const medicines = await Medicine.find({
      $or: [
        { name: { $regex: `^${safeQuery}`, $options: "i" } },
        { brand: { $regex: `^${safeQuery}`, $options: "i" } },
        { generic: { $regex: `^${safeQuery}`, $options: "i" } },
        { category: { $regex: `^${safeQuery}`, $options: "i" } },
      ],
    })
      .select("name brand generic category")
      .limit(10)
      .sort({ name: 1 })
      .lean();

    // If medicines found in database, return them immediately
    if (medicines.length > 0) {
      return res.json({
        suggestions: medicines.map((m) => ({
          _id: m._id,
          name: m.name || "",
          brand: m.brand || "",
          generic: m.generic || "",
          category: m.category || "",
        })),
      });
    }

    // If no GROQ API key is configured, return empty suggestions
    if (!process.env.GROQ_API_KEY) {
      return res.json({ suggestions: [] });
    }

    // Optional AI fallback
    try {
      const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a medicine autocomplete assistant.
Return ONLY a valid JSON array with up to 8 objects.
Each object must contain:
"_id", "name", "brand", "generic", "category".
Set "_id" to null.
No explanation, no markdown, only JSON.`,
          },
          {
            role: "user",
            content: `Suggest medicines matching: "${q.trim()}"`,
          },
        ],
        max_tokens: 400,
        temperature: 0.2,
      });

      const text =
        response.choices?.[0]?.message?.content?.trim() || "[]";

      const clean = text.replace(/```json|```/g, "").trim();

      let aiSuggestions = [];

      try {
        aiSuggestions = JSON.parse(clean);
      } catch {
        aiSuggestions = [];
      }

      return res.json({
        suggestions: Array.isArray(aiSuggestions)
          ? aiSuggestions
          : [],
      });
    } catch (groqError) {
      console.error("GROQ fallback failed:", groqError.message);

      // Do NOT return 500 if GROQ fails
      return res.json({ suggestions: [] });
    }
  } catch (error) {
    console.error("Autocomplete error:", error);

    // Always return empty suggestions instead of HTTP 500
    return res.json({
      suggestions: [],
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ------------------------
// Update Medicine
// ------------------------
export const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });

    const parseArray = (val, fallback) => {
      if (!val) return fallback;
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch { return [val]; }
    };

    const parseObject = (val, fallback) => {
      if (!val) return fallback;
      if (typeof val === "object") return val;
      try { return JSON.parse(val); } catch { return fallback; }
    };

    medicine.name        = req.body.name        || medicine.name;
    medicine.brand       = req.body.brand       || medicine.brand;
    medicine.generic     = req.body.generic     || medicine.generic;
    medicine.category    = req.body.category    || medicine.category;
    medicine.description = req.body.description || medicine.description;
    medicine.price       = req.body.price       ?? medicine.price;
    medicine.stock       = req.body.stock       ?? medicine.stock;
    medicine.dosage      = req.body.dosage      || medicine.dosage;
    medicine.barcode     = req.body.barcode     || medicine.barcode;
    medicine.dosageGuide = parseObject(req.body.dosageGuide, medicine.dosageGuide);
    medicine.sideEffects       = parseArray(req.body.sideEffects,       medicine.sideEffects);
    medicine.longTermEffects   = parseArray(req.body.longTermEffects,   medicine.longTermEffects);
    medicine.contraindications = parseArray(req.body.contraindications, medicine.contraindications);
    medicine.foodInteractions  = parseArray(req.body.foodInteractions,  medicine.foodInteractions);
    medicine.drugInteractions  = parseArray(req.body.drugInteractions,  medicine.drugInteractions);
    medicine.warnings          = parseArray(req.body.warnings,          medicine.warnings);

    if (req.body.requiresPrescription !== undefined)
      medicine.requiresPrescription = req.body.requiresPrescription === "true" || req.body.requiresPrescription === true;
    if (req.body.isCommonlyMisused !== undefined)
      medicine.isCommonlyMisused = req.body.isCommonlyMisused === "true" || req.body.isCommonlyMisused === true;
    if (req.body.isApproved !== undefined)
      medicine.isApproved = req.body.isApproved === "true" || req.body.isApproved === true;
    if (req.body.isSuspicious !== undefined)
      medicine.isSuspicious = req.body.isSuspicious === "true" || req.body.isSuspicious === true;

    medicine.safeAlternatives = parseArray(req.body.safeAlternatives, medicine.safeAlternatives);
    medicine.aiExplanation    = req.body.aiExplanation || medicine.aiExplanation;
    medicine.ocrData          = req.body.ocrData       || medicine.ocrData;

    if (req.file) medicine.image = `/uploads/${req.file.originalname}`;

    await medicine.save();
    res.json({ message: "Medicine updated successfully", medicine });
  } catch (error) {
    res.status(500).json({ message: "Failed to update medicine", error: error.message });
  }
};

// ------------------------
// Delete Medicine
// ------------------------
export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });
    res.json({ message: "Medicine deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete medicine", error: error.message });
  }
};

// ------------------------
// Approve Medicine (Admin)
// ------------------------
export const approveMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, isSuspicious: false },
      { new: true }
    );
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });
    res.json({ message: "Medicine approved", medicine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------------
// Reject Medicine (Admin)
// ------------------------
export const rejectMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { isApproved: false, isSuspicious: true },
      { new: true }
    );
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });
    res.json({ message: "Medicine marked as suspicious", medicine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------------
// Barcode Search ✅ Fixed — no dynamic import
// ------------------------
