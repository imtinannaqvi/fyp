// Controllers/expiry.controller.js
import MedicineExpiry from "../models/MedicineExpiry.js";
import { sendWhatsAppMessage } from "./reminder.controller.js";

// ── Create expiry tracker ─────────────────────────────────────────────────────
export const createExpiry = async (req, res) => {
  try {
    const { phone, medicineName, expiryDate, batchNumber, notes } = req.body;

    if (!phone || !medicineName || !expiryDate) {
      return res.status(400).json({ message: "Phone, medicine name and expiry date are required" });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const expiry = new Date(expiryDate);
    if (expiry <= new Date()) {
      return res.status(400).json({ message: "Expiry date must be in the future" });
    }

    const tracker = await MedicineExpiry.create({
      userId:       req.user._id,
      phone:        cleanPhone,
      medicineName,
      expiryDate:   expiry,
      batchNumber:  batchNumber || "",
      notes:        notes || "",
    });

    // Send confirmation WhatsApp
    try {
      const daysLeft = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
      const msg = `✅ Expiry Tracker Set!\n\n💊 ${medicineName} expires on ${expiry.toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })} (${daysLeft} days left)\n\nMedico Guidance will alert you 7 days before expiry! 🔔`;
      await sendWhatsAppMessage(cleanPhone, msg);
    } catch (err) {
      console.error("WhatsApp confirmation failed:", err.message);
    }

    res.status(201).json({ success: true, message: "Expiry tracker created", tracker });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Get user's expiry trackers ─────────────────────────────────────────────────
export const getUserExpiries = async (req, res) => {
  try {
    const trackers = await MedicineExpiry.find({ userId: req.user._id })
      .sort({ expiryDate: 1 });
    res.json({ success: true, trackers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Delete expiry tracker ─────────────────────────────────────────────────────
export const deleteExpiry = async (req, res) => {
  try {
    const tracker = await MedicineExpiry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!tracker) return res.status(404).json({ message: "Tracker not found" });
    res.json({ success: true, message: "Tracker deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};