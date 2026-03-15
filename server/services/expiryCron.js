// services/expiryCron.js
import cron from "node-cron";
import MedicineExpiry from "../models/MedicineExpiry.js";
import { sendWhatsAppMessage } from "../Controllers/reminder.controller.js";

export const startExpiryCron = () => {
  // Runs every day at 9:00 AM PKT
  cron.schedule("0 4 * * *", async () => { // 4 UTC = 9 AM PKT
    try {
      const now = new Date();

      // ── 7-day alert ──────────────────────────────────────────────────────────
      const in7Days = new Date();
      in7Days.setDate(in7Days.getDate() + 7);
      in7Days.setHours(23, 59, 59, 999);
      const from7 = new Date();
      from7.setDate(from7.getDate() + 6);
      from7.setHours(0, 0, 0, 0);

      const expiring7 = await MedicineExpiry.find({
        isActive:   true,
        alertSent7: false,
        expiryDate: { $gte: from7, $lte: in7Days },
      });

      for (const tracker of expiring7) {
        try {
          const expDate = new Date(tracker.expiryDate).toLocaleDateString("en-PK", {
            day: "numeric", month: "long", year: "numeric"
          });
          const msg = `⚠️ Medicine Expiry Alert!\n\n💊 ${tracker.medicineName} expires in 7 days on ${expDate}.\n\nPlease check your stock and consult your doctor if needed.\n\n— Medico Guidance 🏥`;
          await sendWhatsAppMessage(tracker.phone, msg);
          await MedicineExpiry.findByIdAndUpdate(tracker._id, { alertSent7: true });
          console.log(`[ExpiryCron] ✅ 7-day alert sent for ${tracker.medicineName}`);
        } catch (err) {
          console.error(`[ExpiryCron] ❌ Failed for ${tracker._id}:`, err.message);
        }
      }

      // ── Expiry day alert ─────────────────────────────────────────────────────
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const expiringToday = await MedicineExpiry.find({
        isActive:     true,
        alertSentExp: false,
        expiryDate:   { $gte: todayStart, $lte: todayEnd },
      });

      for (const tracker of expiringToday) {
        try {
          const msg = `🚨 Medicine Expired Today!\n\n💊 ${tracker.medicineName} has expired today.\n\nDo NOT use this medicine. Dispose of it safely and get a fresh supply.\n\n— Medico Guidance 🏥`;
          await sendWhatsAppMessage(tracker.phone, msg);
          await MedicineExpiry.findByIdAndUpdate(tracker._id, { alertSentExp: true, isActive: false });
          console.log(`[ExpiryCron] ✅ Expiry alert sent for ${tracker.medicineName}`);
        } catch (err) {
          console.error(`[ExpiryCron] ❌ Failed for ${tracker._id}:`, err.message);
        }
      }

    } catch (err) {
      console.error("[ExpiryCron] Error:", err.message);
    }
  });

  console.log("✅ Medicine expiry cron job started");
};