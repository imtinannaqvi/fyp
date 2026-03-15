// Controllers/reminder.controller.js
import Groq from "groq-sdk";
import axios from "axios";
import Reminder from "../models/Reminder.js";

// ── Generate personalized message using Groq ──────────────────────────────────
export const generateReminderMessage = async (reminder) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `You are an energetic, motivational health coach sending a WhatsApp medicine reminder.

Medicine: ${reminder.medicineName}
Dosage: ${reminder.dosage}
Notes: ${reminder.notes || "none"}

Generate a SHORT (4-5 lines only) WhatsApp message with this structure:
Line 1: One punchy, energetic opening line with a power emoji (no greetings like "hey" or "hi")
Line 2: 💊 Medicine + dosage in one clear line
Line 3: 🍽️ Food timing based on notes (before/after/with meal)
Line 4: One short motivational line that connects health to strength/success
Line 5: — Medico Guidance 💪

Rules:
- Sound like an energetic coach, not a robot
- Be punchy and inspiring
- No asterisks, no markdown, no bold
- Keep every line short and powerful
- Total must be 4-5 lines only`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.9,
    max_tokens: 200,
  });

  return response.choices[0]?.message?.content?.trim() ||
    `💥 Your health doesn't take a day off — neither should you!\n\n💊 Take your ${reminder.medicineName} — ${reminder.dosage}\n🍽️ ${reminder.notes || "Take as directed by your doctor"}\n\nStay strong, stay consistent. You've got this! 🔥\n— Medico Guidance 💪`;
};

// ── Send WhatsApp message via Green API ───────────────────────────────────────
export const sendWhatsAppMessage = async (phone, message) => {
  const GREEN_API_URL = `https://7107.api.greenapi.com/waInstance${process.env.GREEN_API_INSTANCE}`;
  const GREEN_API_TOKEN = process.env.GREEN_API_TOKEN;

  const cleanPhone = phone.replace(/\D/g, "");
  const chatId = `${cleanPhone}@c.us`;

  const response = await axios.post(
    `${GREEN_API_URL}/sendMessage/${GREEN_API_TOKEN}`,
    { chatId, message },
    { headers: { "Content-Type": "application/json" } }
  );

  return response.data;
};

// ── Create a new reminder ─────────────────────────────────────────────────────
export const createReminder = async (req, res) => {
  try {
    const { phone, medicineName, dosage, frequency, times, startDate, endDate, notes } = req.body;

    if (!phone || !medicineName || !dosage || !times?.length || !startDate) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const reminder = await Reminder.create({
      userId:    req.user?._id || null,
      phone:     cleanPhone,
      medicineName,
      dosage,
      frequency: frequency || "daily",
      times,
      startDate: new Date(startDate),
      endDate:   endDate ? new Date(endDate) : null,
      notes:     notes || "",
      isActive:  true,
    });

    // Send WhatsApp confirmation immediately
    try {
      const confirmMsg = `✅ Reminder Set!\n\nYour reminder for ${medicineName} (${dosage}) has been scheduled at ${times.join(", ")}.\n\nMedico Guidance will remind you on time! 💪`;
      await sendWhatsAppMessage(cleanPhone, confirmMsg);
    } catch (wpErr) {
      console.error("WhatsApp confirmation failed:", wpErr.message);
    }

    res.status(201).json({ success: true, message: "Reminder created successfully", reminder });
  } catch (error) {
    console.error("Create reminder error:", error);
    res.status(500).json({ message: "Failed to create reminder", error: error.message });
  }
};

// ── Get all reminders for logged-in user ──────────────────────────────────────
export const getUserReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, reminders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reminders" });
  }
};

// ── Toggle reminder active/inactive ──────────────────────────────────────────
export const toggleReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });

    reminder.isActive = !reminder.isActive;
    await reminder.save();

    res.json({
      success: true,
      isActive: reminder.isActive,
      message: `Reminder ${reminder.isActive ? "activated" : "paused"}`,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle reminder" });
  }
};

// ── Delete a reminder ─────────────────────────────────────────────────────────
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json({ success: true, message: "Reminder deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete reminder" });
  }
};