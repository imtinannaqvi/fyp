import Reminder from "../models/reminder.js";

// Get all reminders for logged-in user
export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ 
      user: req.user._id,
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json({ reminders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reminders" });
  }
};

// Create new reminder
export const createReminder = async (req, res) => {
  try {
    const { medicineName, dosage, frequency, times, startDate, endDate, notes } = req.body;

    if (!medicineName || !dosage || !times || times.length === 0 || !startDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const reminder = await Reminder.create({
      user: req.user._id,
      medicineName,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
      notes
    });

    res.status(201).json({ reminder, message: "Reminder created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to create reminder" });
  }
};

// Update reminder
export const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { medicineName, dosage, frequency, times, startDate, endDate, notes } = req.body;

    const reminder = await Reminder.findOne({ _id: id, user: req.user._id });
    
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    reminder.medicineName = medicineName || reminder.medicineName;
    reminder.dosage = dosage || reminder.dosage;
    reminder.frequency = frequency || reminder.frequency;
    reminder.times = times || reminder.times;
    reminder.startDate = startDate || reminder.startDate;
    reminder.endDate = endDate;
    reminder.notes = notes;

    await reminder.save();

    res.json({ reminder, message: "Reminder updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update reminder" });
  }
};

// Delete reminder
export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findOneAndDelete({ 
      _id: id, 
      user: req.user._id 
    });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete reminder" });
  }
};

// Log adherence (mark as taken/missed)
export const logAdherence = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, taken } = req.body;

    const reminder = await Reminder.findOne({ _id: id, user: req.user._id });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    reminder.adherenceLog.push({
      date: new Date(date),
      time,
      taken,
      takenAt: taken ? new Date() : null
    });

    await reminder.save();

    res.json({ message: "Adherence logged successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to log adherence" });
  }
};

// Get adherence statistics
export const getAdherenceStats = async (req, res) => {
  try {
    const reminders = await Reminder.find({ 
      user: req.user._id,
      isActive: true 
    });

    let totalDoses = 0;
    let takenDoses = 0;

    reminders.forEach(reminder => {
      reminder.adherenceLog.forEach(log => {
        totalDoses++;
        if (log.taken) takenDoses++;
      });
    });

    const adherenceRate = totalDoses > 0 ? ((takenDoses / totalDoses) * 100).toFixed(1) : 0;

    res.json({
      totalDoses,
      takenDoses,
      missedDoses: totalDoses - takenDoses,
      adherenceRate: parseFloat(adherenceRate)
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
};
