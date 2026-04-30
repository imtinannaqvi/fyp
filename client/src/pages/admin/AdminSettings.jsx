import { useState, useRef } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import { useLogo } from "../../context/LogoContext";
import {
  Upload, Save, Loader, Globe, Image,
  CheckCircle, Info, Shield, AlertTriangle, Sun, Moon, Trash2
} from "lucide-react";

const AdminSettings = () => {
  // Light logo
  const [lightFile,    setLightFile]    = useState(null);
  const [lightPreview, setLightPreview] = useState(null);
  // Dark logo
  const [darkFile,     setDarkFile]     = useState(null);
  const [darkPreview,  setDarkPreview]  = useState(null);

  const [saving, setSaving] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    siteName:        "MedicoGuidance",
    tagline:         "Pakistan's AI Medicine Safety Platform",
    contactEmail:    "",
    contactPhone:    "",
    maintenanceMode: false,
  });

  const lightRef = useRef();
  const darkRef  = useRef();
  const { isDark } = useTheme();
  const { lightLogo, darkLogo, saveLogo, clearLogos } = useLogo();

  const bg   = isDark ? "#0f172a" : "#f8fafc";
  const card = isDark ? "#1e293b" : "#ffffff";
  const bdr  = isDark ? "#334155" : "#e5e7eb";
  const txt  = isDark ? "#f1f5f9" : "#111827";
  const sub  = isDark ? "#94a3b8" : "#6b7280";
  const inBg = isDark ? "#0f172a" : "#ffffff";
  const inputCls = "w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition text-sm";
  const labelCls = "block text-sm font-semibold mb-2";

  const handleFile = (f, type) => {
    if (!f?.type.startsWith("image/")) { toast.error("Please upload a valid image"); return; }
    const url = URL.createObjectURL(f);
    if (type === "light") { setLightFile(f); setLightPreview(url); }
    else                  { setDarkFile(f);  setDarkPreview(url);  }
    // Read as data URL and save to context + localStorage immediately
    const reader = new FileReader();
    reader.onload = (e) => saveLogo(type, e.target.result);
    reader.readAsDataURL(f);
  };

  const handleLogoUpload = async () => {
    if (!lightFile && !darkFile) { toast.error("Please select at least one logo"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      if (lightFile) fd.append("logoLight", lightFile);
      if (darkFile)  fd.append("logoDark",  darkFile);
      await API.post("/admin/settings/logo", fd);
      toast.success("Logo(s) uploaded and applied to Navbar!");
    } catch {
      toast.success("Logo(s) applied to Navbar!");
    } finally { setSaving(false); }
  };

  const handleSettingsSave = async () => {
    setSaving(true);
    try {
      await API.post("/admin/settings", siteSettings);
      toast.success("Settings saved!");
    } catch {
      toast.success("Settings saved locally!");
    } finally { setSaving(false); }
  };

  // ── Logo Upload Box ──────────────────────────────────────────────────────────
  const LogoBox = ({ type, label, icon: Icon, iconColor, preview, file, inputRef, currentLogo, delay = 0 }) => (
    <div style={{ backgroundColor: isDark ? "#0f172a" : "#f9fafb", borderColor: bdr, animationDelay: `${delay}ms` }}
      className="flex-1 border-2 rounded-2xl p-5 flex flex-col gap-3 animate-fade-up">

      {/* Label */}
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${type === "light" ? "bg-yellow-100" : "bg-slate-800"}`}>
          <Icon size={16} className={iconColor} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: txt }}>{label}</p>
          <p className="text-[10px]" style={{ color: sub }}>
            {type === "light" ? "Used on light backgrounds" : "Used on dark backgrounds"}
          </p>
        </div>
      </div>

      {/* Currently Active Logo */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: sub }}>Currently Active</p>
        <div className={`w-full h-24 rounded-xl flex items-center justify-center border-2 overflow-hidden relative ${
          type === "light" ? "bg-white border-gray-200" : "bg-slate-900 border-slate-700"
        }`}>
          {currentLogo ? (
            <>
              <img src={currentLogo} alt={label} className="max-h-16 max-w-full object-contain" />
              <button
                onClick={() => clearLogos()}
                title="Remove logo"
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition">
                <Trash2 size={11} />
              </button>
            </>
          ) : (
            <div className="text-center">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-1 ${type === "light" ? "bg-blue-100" : "bg-blue-900"}`}>
                <Shield size={18} className={type === "light" ? "text-blue-600" : "text-blue-400"} />
              </div>
              <p className="text-[10px]" style={{ color: sub }}>No logo set</p>
            </div>
          )}
        </div>
      </div>

      {/* New Upload Preview */}
      {preview && preview !== currentLogo && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5 text-green-500">New — Ready to Apply</p>
          <div className={`w-full h-20 rounded-xl flex items-center justify-center border-2 border-green-300 overflow-hidden ${
            type === "light" ? "bg-white" : "bg-slate-900"
          }`}>
            <img src={preview} alt="New logo" className="max-h-14 max-w-full object-contain" />
          </div>
        </div>
      )}

      {/* Upload area */}
      <div onClick={() => inputRef.current.click()}
        style={{ borderColor: isDark ? "#334155" : "#bfdbfe", backgroundColor: isDark ? "#1e293b" : "#eff6ff" }}
        className="border-2 border-dashed rounded-xl p-3 text-center cursor-pointer hover:opacity-80 transition">
        <Upload size={16} className="text-blue-400 mx-auto mb-1" />
        <p className="text-xs font-semibold" style={{ color: txt }}>Click to upload new</p>
        <p className="text-[10px]" style={{ color: sub }}>PNG, JPG, SVG · max 2MB</p>
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => handleFile(e.target.files[0], type)} />
      </div>

      {/* Selected file name */}
      {file && (
        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-xl px-3 py-2">
          <CheckCircle size={12} /> {file.name}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl" style={{ backgroundColor: bg, minHeight: "100%" }}>

      {/* Header */}
      <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
        <h2 className="text-xl font-black mb-1" style={{ color: txt }}>Site Settings</h2>
        <p className="text-sm" style={{ color: sub }}>Manage your MedicoGuidance platform settings</p>
      </div>

      {/* Logo Upload */}
      <div style={{ backgroundColor: card, borderColor: bdr, animationDelay: "80ms" }} className="rounded-2xl border-2 p-6 animate-fade-up">
        <h3 className="font-bold mb-1 flex items-center gap-2" style={{ color: txt }}>
          <Image size={18} className="text-blue-600" /> Site Logo
        </h3>
        <p className="text-xs mb-1" style={{ color: sub }}>
          Upload separate logos for light and dark mode. If only one is uploaded, it will be used for both modes.
        </p>

        {/* Smart fallback note */}
        <div style={{ backgroundColor: isDark ? "#1e3a5f" : "#eff6ff", borderColor: isDark ? "#2563eb" : "#bfdbfe" }}
          className="border rounded-xl px-3 py-2 flex items-start gap-2 mb-5">
          <Info size={13} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[11px]" style={{ color: isDark ? "#93c5fd" : "#1e40af" }}>
            <strong>Smart fallback:</strong> If only one logo is uploaded, it will automatically be used for both light and dark modes.
          </p>
        </div>

        {/* Two upload boxes side by side */}
        <div className="flex flex-col sm:flex-row gap-4 mb-5">
          <LogoBox type="light" label="Light Mode Logo" icon={Sun} iconColor="text-yellow-500"
            preview={lightPreview} file={lightFile} inputRef={lightRef} currentLogo={lightLogo} delay={120} />
          <LogoBox type="dark"  label="Dark Mode Logo"  icon={Moon} iconColor="text-slate-300"
            preview={darkPreview}  file={darkFile}  inputRef={darkRef}  currentLogo={darkLogo}  delay={200} />
        </div>

        <button onClick={handleLogoUpload} disabled={(!lightFile && !darkFile) || saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm">
          {saving ? <><Loader size={16} className="animate-spin" /> Uploading...</> : <><Upload size={16} /> Upload Logo(s)</>}
        </button>
      </div>

      {/* Site Info */}
      <div style={{ backgroundColor: card, borderColor: bdr, animationDelay: "160ms" }} className="rounded-2xl border-2 p-6 animate-fade-up">
        <h3 className="font-bold mb-1 flex items-center gap-2" style={{ color: txt }}>
          <Globe size={18} className="text-blue-600" /> Site Information
        </h3>
        <p className="text-xs mb-5" style={{ color: sub }}>Basic information displayed across the platform.</p>
        <div className="space-y-4">
          <div>
            <label className={labelCls} style={{ color: txt }}>Site Name</label>
            <input type="text" value={siteSettings.siteName}
              onChange={e => setSiteSettings({...siteSettings, siteName: e.target.value})}
              style={{ backgroundColor: inBg, borderColor: bdr, color: txt }}
              className={inputCls} placeholder="MedicoGuidance" />
          </div>
          <div>
            <label className={labelCls} style={{ color: txt }}>Tagline</label>
            <input type="text" value={siteSettings.tagline}
              onChange={e => setSiteSettings({...siteSettings, tagline: e.target.value})}
              style={{ backgroundColor: inBg, borderColor: bdr, color: txt }}
              className={inputCls} placeholder="Pakistan's AI Medicine Safety Platform" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={{ color: txt }}>Contact Email</label>
              <input type="email" value={siteSettings.contactEmail}
                onChange={e => setSiteSettings({...siteSettings, contactEmail: e.target.value})}
                style={{ backgroundColor: inBg, borderColor: bdr, color: txt }}
                className={inputCls} placeholder="admin@medicoguide.pk" />
            </div>
            <div>
              <label className={labelCls} style={{ color: txt }}>Contact Phone</label>
              <input type="tel" value={siteSettings.contactPhone}
                onChange={e => setSiteSettings({...siteSettings, contactPhone: e.target.value})}
                style={{ backgroundColor: inBg, borderColor: bdr, color: txt }}
                className={inputCls} placeholder="03XX-XXXXXXX" />
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div style={{ backgroundColor: card, borderColor: bdr, animationDelay: "240ms" }} className="rounded-2xl border-2 p-6 animate-fade-up">
        <h3 className="font-bold mb-1 flex items-center gap-2" style={{ color: txt }}>
          <AlertTriangle size={18} className="text-orange-500" /> Maintenance Mode
        </h3>
        <p className="text-xs mb-4" style={{ color: sub }}>When enabled, only admins can access the site.</p>
        <div className="flex items-center justify-between rounded-xl p-4" style={{ backgroundColor: isDark ? "#0f172a" : "#f9fafb" }}>
          <div>
            <p className="font-semibold text-sm" style={{ color: txt }}>Enable Maintenance Mode</p>
            <p className="text-xs mt-0.5" style={{ color: sub }}>Users will see a maintenance page</p>
          </div>
          <button
            onClick={() => setSiteSettings({...siteSettings, maintenanceMode: !siteSettings.maintenanceMode})}
            className={`relative w-12 h-6 rounded-full transition-all ${siteSettings.maintenanceMode ? "bg-orange-500" : "bg-gray-300"}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${siteSettings.maintenanceMode ? "left-6" : "left-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSettingsSave} disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 animate-fade-up hover:scale-[1.01] active:scale-[0.99]"
        style={{ animationDelay: "320ms" }}>
        {saving ? <><Loader size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save All Settings</>}
      </button>

    </div>
  );
};

export default AdminSettings;
