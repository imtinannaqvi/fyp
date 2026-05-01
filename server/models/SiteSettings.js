import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema({
  logoLight: { type: String, default: null },  // base64 or URL
  logoDark:  { type: String, default: null },
  siteName:  { type: String, default: "MedicoGuidance" },
  tagline:   { type: String, default: "Pakistan's AI Medicine Safety Platform" },
  contactEmail: { type: String, default: "" },
  contactPhone: { type: String, default: "" },
  maintenanceMode: { type: Boolean, default: false },
  showSiteName:    { type: Boolean, default: true },
  lastChangedBy: {
    adminId:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminName: { type: String },
    adminEmail:{ type: String },
    changedAt: { type: Date, default: Date.now },
  },
}, { timestamps: true });

const SiteSettings = mongoose.models.SiteSettings || mongoose.model("SiteSettings", siteSettingsSchema);
export default SiteSettings;
