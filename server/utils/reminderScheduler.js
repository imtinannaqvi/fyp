import cron     from "node-cron";
import Reminder from "../models/Reminder.js";
import { sendWhatsApp } from "./callmebot.js";

export const startReminderScheduler = () => {
  // Runs every minute
  cron.schedule("* * * * *", async () => {
    const now    = new Date();
    const hour   = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    const current = `${hour}:${minute}`;
    const today   = now.toISOString().split("T")[0];

    try {
      const reminders = await Reminder.find({
        isActive:  true,
        startDate: { $lte: now },                          // started
        $or: [{ endDate: null }, { endDate: { $gte: now } }], // not expired
      });

      for (const r of reminders) {
        if (!r.times.includes(current)) continue;
        if (r.frequency === "as-needed")  continue; // no auto reminder for as-needed

        const msg =
          `⏰ *Medicine Reminder!*\n\n` +
          `💊 Time to take: *${r.medicineName}*\n` +
          `📏 Dosage: *${r.dosage}*\n` +
          (r.notes ? `📝 Note: ${r.notes}\n` : "") +
          `\nTake care of your health! 🌿 — MedicoGuide`;

        await sendWhatsApp(r.phone, msg).catch(e =>
          console.error(`Failed to send to ${r.phone}:`, e.message)
        );
      }
    } catch (err) {
      console.error("Scheduler error:", err.message);
    }
  });

  console.log("✅ WhatsApp reminder scheduler started");
};
