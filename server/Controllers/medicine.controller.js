import Medicine from "../models/Medicine.js";
import { detectDuplicateMedicine } from "../utils/fakeDetection.js";

// ------------------------
// Create Medicine
// ------------------------
export const createMedicine = async (req, res) => {
  try {
    const { name } = req.body;

    // Duplicate check
    const duplicateCheck = await detectDuplicateMedicine(name);
    if (duplicateCheck.isDuplicate) {
      return res.status(400).json({
        message: "Potential duplicate medicine detected",
        matchedWith: duplicateCheck.matchedWith,
        similarityScore: duplicateCheck.similarityScore,
      });
    }

    // Parse array fields if sent as JSON strings (from form-data)
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
      // Basic Info
      name:        req.body.name,
      brand:       req.body.brand,
      generic:     req.body.generic,
      category:    req.body.category,
      description: req.body.description,
      price:       req.body.price,
      stock:       req.body.stock,

      // Dosage
      dosage:      req.body.dosage,
      dosageGuide: parseObject(req.body.dosageGuide),

      // Side Effects
      sideEffects:     parseArray(req.body.sideEffects),
      longTermEffects: parseArray(req.body.longTermEffects),

      // Safety
      contraindications: parseArray(req.body.contraindications),
      foodInteractions:  parseArray(req.body.foodInteractions),
      drugInteractions:  parseArray(req.body.drugInteractions),
      warnings:          parseArray(req.body.warnings),

      // Classification
      requiresPrescription: req.body.requiresPrescription === "true" || req.body.requiresPrescription === true,
      isCommonlyMisused:    req.body.isCommonlyMisused === "true" || req.body.isCommonlyMisused === true,
      safeAlternatives:     parseArray(req.body.safeAlternatives),

      // AI/OCR
      aiExplanation: req.body.aiExplanation,
      ocrData:       req.body.ocrData,

      // Image
      image: req.file ? `/uploads/${req.file.originalname}` : req.body.image,

      // Admin
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Medicine created successfully", medicine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------------
// Get All Medicines (with search + filter + pagination)
// ------------------------
export const getMedicines = async (req, res) => {
  try {
    const page     = parseInt(req.query.page)     || 1;
    const limit    = parseInt(req.query.limit)    || 10;
    const skip     = (page - 1) * limit;

    // Build query filters
    const filter = {};

    // Text search — name, brand, generic, category
    if (req.query.q) {
      filter.$or = [
        { name:     { $regex: req.query.q, $options: "i" } },
        { brand:    { $regex: req.query.q, $options: "i" } },
        { generic:  { $regex: req.query.q, $options: "i" } },
        { category: { $regex: req.query.q, $options: "i" } },
      ];
    }

    if (req.query.category)            filter.category            = { $regex: req.query.category, $options: "i" };
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

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      medicines,
    });
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
// Search Medicines (dedicated search endpoint)
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
      isApproved: true,   // only return approved medicines in public search
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

    // Basic Info
    medicine.name        = req.body.name        || medicine.name;
    medicine.brand       = req.body.brand       || medicine.brand;
    medicine.generic     = req.body.generic     || medicine.generic;
    medicine.category    = req.body.category    || medicine.category;
    medicine.description = req.body.description || medicine.description;
    medicine.price       = req.body.price       ?? medicine.price;
    medicine.stock       = req.body.stock       ?? medicine.stock;

    // Dosage
    medicine.dosage      = req.body.dosage      || medicine.dosage;
    medicine.dosageGuide = parseObject(req.body.dosageGuide, medicine.dosageGuide);

    // Side Effects
    medicine.sideEffects     = parseArray(req.body.sideEffects,     medicine.sideEffects);
    medicine.longTermEffects = parseArray(req.body.longTermEffects, medicine.longTermEffects);

    // Safety
    medicine.contraindications = parseArray(req.body.contraindications, medicine.contraindications);
    medicine.foodInteractions  = parseArray(req.body.foodInteractions,  medicine.foodInteractions);
    medicine.drugInteractions  = parseArray(req.body.drugInteractions,  medicine.drugInteractions);
    medicine.warnings          = parseArray(req.body.warnings,          medicine.warnings);

    // Classification
    if (req.body.requiresPrescription !== undefined)
      medicine.requiresPrescription = req.body.requiresPrescription === "true" || req.body.requiresPrescription === true;
    if (req.body.isCommonlyMisused !== undefined)
      medicine.isCommonlyMisused = req.body.isCommonlyMisused === "true" || req.body.isCommonlyMisused === true;
    if (req.body.isApproved !== undefined)
      medicine.isApproved = req.body.isApproved === "true" || req.body.isApproved === true;
    if (req.body.isSuspicious !== undefined)
      medicine.isSuspicious = req.body.isSuspicious === "true" || req.body.isSuspicious === true;

    medicine.safeAlternatives = parseArray(req.body.safeAlternatives, medicine.safeAlternatives);

    // AI/OCR
    medicine.aiExplanation = req.body.aiExplanation || medicine.aiExplanation;
    medicine.ocrData       = req.body.ocrData       || medicine.ocrData;

    // Image
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
// Approve / Reject Medicine (Admin)
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