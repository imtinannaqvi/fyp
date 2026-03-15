// services/reminderCron.js
import cron from "node-cron";
import Reminder from "../models/Reminder.js";
import { generateReminderMessage, sendWhatsAppMessage } from "../Controllers/reminder.controller.js";

export const startReminderCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // ── Use Pakistan timezone (PKT = UTC+5) ──────────────────────────────
      const pkTime  = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
      const hours   = String(pkTime.getHours()).padStart(2, "0");
      const minutes = String(pkTime.getMinutes()).padStart(2, "0");
      const currentTime = `${hours}:${minutes}`;

    //   console.log(`[Cron] PKT: ${currentTime} — searching reminders...`);

      const reminders = await Reminder.find({
  isActive: true,
  times: currentTime,
});

// console.log(`[Cron] ${currentTime} — found: ${reminders.length}`);

      for (const reminder of reminders) {
        try {
          if (reminder.frequency === "weekly") {
            if (pkTime.getDay() !== new Date(reminder.startDate).getDay()) continue;
          }
          if (reminder.frequency === "monthly") {
            if (pkTime.getDate() !== new Date(reminder.startDate).getDate()) continue;
          }
          if (reminder.frequency === "as-needed") continue;

          const message = await generateReminderMessage(reminder);
          await sendWhatsAppMessage(reminder.phone, message);

        //   console.log(`[Cron] ✅ Reminder sent to ${reminder.phone} for ${reminder.medicineName}`);
        } catch (err) {
          console.error(`[Cron] ❌ Failed for reminder ${reminder._id}:`, err.message);
        }
      }
    } catch (err) {
      console.error("[Cron] Error in reminder job:", err.message);
    }
  });

  console.log("✅ Medicine reminder cron job started");
};