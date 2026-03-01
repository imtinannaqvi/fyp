import User from "../models/user.js";
import Medicine from "../models/Medicine.js";

// ── Get My Profile ────────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -otp -otpExpire -resetPasswordToken -resetPasswordExpire")
      .populate("savedMedicines.medicine", "name brand category image requiresPrescription");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Update Profile ────────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name, age, weight, gender, conditions, allergies } = req.body;

    const parseArray = (val, fallback) => {
      if (!val) return fallback;
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch { return [val]; }
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        age,
        weight,
        gender,
        conditions: parseArray(conditions, []),
        allergies:  parseArray(allergies, []),
      },
      { new: true, runValidators: true }
    ).select("-password -otp -otpExpire -resetPasswordToken -resetPasswordExpire");

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Save Medicine ─────────────────────────────────────────────────────────────
export const saveMedicine = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { medicineId } = req.params;

    // Check medicine exists
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });

    // Check if already saved
    const alreadySaved = user.savedMedicines.some(
      (s) => s.medicine.toString() === medicineId
    );
    if (alreadySaved) {
      return res.status(400).json({ message: "Medicine already saved" });
    }

    user.savedMedicines.push({ medicine: medicineId });
    await user.save();

    res.json({ message: "Medicine saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Remove Saved Medicine ─────────────────────────────────────────────────────
export const removeSavedMedicine = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { medicineId } = req.params;

    user.savedMedicines = user.savedMedicines.filter(
      (s) => s.medicine.toString() !== medicineId
    );

    await user.save();
    res.json({ message: "Medicine removed from saved list" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Get Saved Medicines ───────────────────────────────────────────────────────
export const getSavedMedicines = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "savedMedicines.medicine",
      "name brand category image description requiresPrescription isCommonlyMisused"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      total: user.savedMedicines.length,
      savedMedicines: user.savedMedicines,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Add to Search History ─────────────────────────────────────────────────────
export const addSearchHistory = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: "Query is required" });

    const user = await User.findById(req.user._id);

    // Avoid duplicate consecutive searches
    const last = user.searchHistory[user.searchHistory.length - 1];
    if (last?.query === query) {
      return res.json({ message: "Already logged" });
    }

    // Keep only last 20 searches
    if (user.searchHistory.length >= 20) {
      user.searchHistory.shift(); // remove oldest
    }

    user.searchHistory.push({ query });
    await user.save();

    res.json({ message: "Search logged" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Get Search History ────────────────────────────────────────────────────────
export const getSearchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("searchHistory");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Return most recent first
    const history = [...user.searchHistory].reverse();
    res.json({ total: history.length, history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Clear Search History ──────────────────────────────────────────────────────
export const clearSearchHistory = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { searchHistory: [] });
    res.json({ message: "Search history cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};