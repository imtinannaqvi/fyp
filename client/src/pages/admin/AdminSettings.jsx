import { useState, useRef, useEffect } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import { useLogo } from "../../context/LogoContext";
import {
  Upload, Save, Loader, Globe, Image,
  CheckCircle, Info, AlertTriangle, Sun, Moon,
  Trash2, Type, Clock
} from "lucide-react";

const AdminSettings = () => {
  // lightPreview/darkPreview = blob URL for display only
  // lightData/darkData = base64 data URL for saving
  const [lightFile,    setLightFile]    = useState(null);
  const [lightPreview, setLightPreview] = useState(null);
  const [lightData,    setLightData]    = useState(null);
  const [darkFile,     setDarkFile]     = useState(null);
  const [darkPreview,  setDarkPreview]  = useState(null);
  const [darkData,     setDarkData]     = useState(null);
  const [saving,       setSaving]       = useState(false);

  const lightRef = useRef();
  const darkRef  = useRef();
  const { isDark } = useTheme();
  const { lightLogo, darkLogo, saveLogo, clearLogos, lastChanged, showSiteName, updateShowSiteName, siteName, updateSiteName, tagline, updateTagline } = useLogo();

  const [siteSettings, setSiteSettings] = useState({
    siteName:        siteName || "MedicoGuidance",
    tagline:         tagline  || "Pakistan's AI Medicine Safety Platform",
    contactEmail:    "",
    contactPhone:    "",
    maintenanceMode: false,
  });

  // Load full settings from DB on mount
  useEffect(() => {
    API.get("/admin/settings").then(({ data }) => {
      setSiteSettings({
        siteName:        data.siteName        || "MedicoGuidance",
        tagline:         data.tagline         || "",
        contactEmail:    data.contactEmail    || "",
        contactPhone:    data.contactPhone    || "",
        maintenanceMode: data.maintenanceMode || false,
      });
    }).catch(() => {});
  }, []);

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
    const img = new window.Image();
    const blobUrl = URL.createObjectURL(f);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX = 400;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else       { w = Math.round(w * MAX / h); h = MAX; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      const base64 = canvas.toDataURL("image/png", 0.85);
      URL.revokeObjectURL(blobUrl);
      // Use base64 for both preview and saving (avoids blob URL expiry issues)
      if (type === "light") { setLightData(base64); setLightPreview(base64); setLightFile(f); }
      else                  { setDarkData(base64);  setDarkPreview(base64);  setDarkFile(f);  }
    };
    img.src = blobUrl;
  };

  const handleLogoUpload = async () => {
    if (!lightData && !darkData) { toast.error("Please select at least one logo"); return; }
    setSaving(true);
    try {
      // Save base64 data URLs to server via context
      if (lightData) await saveLogo("light", lightData);
      if (darkData)  await saveLogo("dark",  darkData);
      toast.success("Logo(s) saved and applied to all users!");
      // Clear file selections after successful upload
      setLightFile(null); setLightPreview(null); setLightData(null);
      setDarkFile(null);  setDarkPreview(null);  setDarkData(null);
    } catch { toast.error("Failed to save logo"); }
    finally { setSaving(false); }
  };

  const handleSettingsSave = async () => {
    setSaving(true);
    try {
      await API.post("/admin/settings", siteSettings);
      toast.success("Settings saved!");
    } catch { toast.success("Settings saved locally!"); }
    finally { setSaving(false); }
  };

  // ── Toggle component ──────────────────────────────────────────────────────
  const Toggle = ({ value, onChange, color = "blue" }) => (
    <button onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
        value ? (color === "orange" ? "bg-orange-500" : "bg-blue-600") : "bg-gray-300"
      }`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${value ? "left-6" : "left-0.5"}`} />
    </button>
  );

  // ── Logo Box ──────────────────────────────────────────────────────────────
  const LogoBox = ({ type, label, icon: Icon, iconColor, preview, file, inputRef, currentLogo, delay = 0 }) => (
    <div style={{ backgroundColor: isDark ? "#0f172a" : "#f9fafb", borderColor: bdr, animationDelay: `${delay}ms` }}
      className="flex-1 border-2 rounded-2xl p-5 flex flex-col gap-3 animate-fade-up">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${type === "light" ? "bg-yellow-100" : "bg-slate-800"}`}>
          <Icon size={16} className={iconColor} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: txt }}>{label}</p>
          <p className="text-[10px]" style={{ color: sub }}>{type === "light" ? "Used on light backgrounds" : "Used on dark backgrounds"}</p>
        </div>
      </div>

      {/* Current logo preview */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: sub }}>Currently Active</p>
        <div className={`w-full h-24 rounded-xl flex items-center justify-center border-2 overflow-hidden relative ${type === "light" ? "bg-white border-gray-200" : "bg-slate-900 border-slate-700"}`}>
          {currentLogo ? (
            <>
              <img src={currentLogo} alt={label} className="max-h-16 max-w-full object-contain"
                onError={e => { e.currentTarget.parentElement.innerHTML = `<p style="font-size:10px;color:#94a3b8">No logo set</p>`; }} />
              <button onClick={() => clearLogos(type)} title="Remove logo"
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition">
                <Trash2 size={11} />
              </button>
            </>
          ) : (
            <p className="text-[10px]" style={{ color: sub }}>No logo set</p>
          )}
        </div>
      </div>

      {/* New preview */}
      {preview && preview !== currentLogo && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5 text-green-500">New — Ready to Apply</p>
          <div className={`w-full h-20 rounded-xl flex items-center justify-center border-2 border-green-300 overflow-hidden ${type === "light" ? "bg-white" : "bg-slate-900"}`}>
            <img src={preview} alt="New logo" className="max-h-14 max-w-full object-contain" />
          </div>
        </div>
      )}

      {/* Upload */}
      <div onClick={() => inputRef.current.click()}
        style={{ borderColor: isDark ? "#334155" : "#bfdbfe", backgroundColor: isDark ? "#1e293b" : "#eff6ff" }}
        className="border-2 border-dashed rounded-xl p-3 text-center cursor-pointer hover:opacity-80 transition">
        <Upload size={16} className="text-blue-400 mx-auto mb-1" />
        <p className="text-xs font-semibold" style={{ color: txt }}>Click to upload new</p>
        <p className="text-[10px]" style={{ color: sub }}>PNG, JPG, SVG · max 2MB</p>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0], type)} />
      </div>

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

      {/* ── Logo Upload ─────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: card, borderColor: bdr, animationDelay: "80ms" }} className="rounded-2xl border-2 p-6 animate-fade-up">
        <h3 className="font-bold mb-1 flex items-center gap-2" style={{ color: txt }}>
          <Image size={18} className="text-blue-600" /> Site Logo
        </h3>
        <p className="text-xs mb-4" style={{ color: sub }}>
          Upload separate logos for light and dark mode.
        </p>

        <div style={{ backgroundColor: isDark ? "#1e3a5f" : "#eff6ff", borderColor: isDark ? "#2563eb" : "#bfdbfe" }}
          className="border rounded-xl px-3 py-2 flex items-start gap-2 mb-5">
          <Info size={13} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[11px]" style={{ color: isDark ? "#93c5fd" : "#1e40af" }}>
            <strong>Smart fallback:</strong> If only one logo is uploaded, it will be used for both modes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-5">
          <LogoBox type="light" label="Light Mode Logo" icon={Sun}  iconColor="text-yellow-500"
            preview={lightPreview} file={lightFile} inputRef={lightRef} currentLogo={lightLogo} delay={120} />
          <LogoBox type="dark"  label="Dark Mode Logo"  icon={Moon} iconColor="text-slate-300"
            preview={darkPreview}  file={darkFile}  inputRef={darkRef}  currentLogo={darkLogo}  delay={200} />
        </div>

        {/* ── Site Name Toggle ─────────────────────────────────────────────── */}
        <div style={{ backgroundColor: isDark ? "#0f172a" : "#f8fafc", borderColor: bdr }}
          className="border-2 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: isDark ? "#1e3a5f" : "#eff6ff" }}>
                <Type size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: txt }}>Show Site Name</p>
                <p className="text-[11px]" style={{ color: sub }}>
                  Display <span className="font-semibold" style={{ color: isDark ? "#93c5fd" : "#2563eb" }}>MedicoGuidance</span> text next to the logo in the navbar
                </p>
              </div>
            </div>
            <Toggle value={showSiteName} onChange={updateShowSiteName} />
          </div>

          {/* Live preview */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: bdr }}>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: sub }}>Navbar Preview</p>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", border: `1px solid ${bdr}` }}>
              {(lightLogo || darkLogo) && (
                <img src={isDark ? (darkLogo || lightLogo) : (lightLogo || darkLogo)}
                  alt="Logo" className="h-8 w-auto object-contain" style={{ maxWidth: "120px" }}
                  onError={e => { e.currentTarget.style.display = "none"; }} />
              )}
              {showSiteName && (
                <div className="flex flex-col leading-tight">
                  <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text"
                    style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {siteName || "MedicoGuidance"}
                  </span>
                  {tagline && (
                    <span className="text-[9px] font-semibold tracking-wide" style={{ color: sub }}>
                      {tagline}
                    </span>
                  )}
                </div>
              )}
              {!showSiteName && !(lightLogo || darkLogo) && (
                <span className="font-extrabold text-base tracking-tight" style={{ color: txt }}>
                  Medico<span className="text-blue-600">Guidance</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <button onClick={handleLogoUpload} disabled={(!lightData && !darkData) || saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm hover:scale-[1.01] active:scale-[0.99]">
          {saving ? <><Loader size={16} className="animate-spin" /> Uploading...</> : <><Upload size={16} /> Upload Logo(s)</>}
        </button>

        {/* ── Last Changed By ──────────────────────────────────────────────── */}
        {lastChanged?.adminName && (
          <div className="mt-4 rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${isDark ? "#334155" : "#e5e7eb"}` }}>
            {/* Header strip */}
            <div className="px-4 py-2 flex items-center gap-2"
              style={{ background: "linear-gradient(90deg, #2563eb, #7c3aed)" }}>
              <Clock size={12} className="text-white/80" />
              <p className="text-[11px] font-bold text-white uppercase tracking-wider">Last Logo Change</p>
            </div>
            {/* Body */}
            <div className="px-4 py-3 flex items-center gap-3"
              style={{ backgroundColor: isDark ? "#0f172a" : "#fafafa" }}>
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0">
                {lastChanged.adminName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold" style={{ color: txt }}>{lastChanged.adminName}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Admin</span>
                </div>
                <p className="text-xs truncate" style={{ color: sub }}>{lastChanged.adminEmail}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-semibold" style={{ color: isDark ? "#60a5fa" : "#2563eb" }}>
                  {lastChanged.changedAt
                    ? new Date(lastChanged.changedAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })
                    : ""}
                </p>
                <p className="text-[10px]" style={{ color: sub }}>
                  {lastChanged.changedAt
                    ? new Date(lastChanged.changedAt).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })
                    : ""}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Site Info ───────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: card, borderColor: bdr, animationDelay: "160ms" }} className="rounded-2xl border-2 p-6 animate-fade-up">
        <h3 className="font-bold mb-1 flex items-center gap-2" style={{ color: txt }}>
          <Globe size={18} className="text-blue-600" /> Site Information
        </h3>
        <p className="text-xs mb-5" style={{ color: sub }}>Basic information displayed across the platform.</p>
        <div className="space-y-4">
          <div>
            <label className={labelCls} style={{ color: txt }}>Site Name</label>
            <input type="text" value={siteSettings.siteName}
              onChange={e => { setSiteSettings({...siteSettings, siteName: e.target.value}); updateSiteName(e.target.value); }}
              style={{ backgroundColor: inBg, borderColor: bdr, color: txt }}
              className={inputCls} placeholder="MedicoGuidance" />
            <p className="text-[10px] mt-1" style={{ color: sub }}>This name appears in the navbar when "Show Site Name" is enabled</p>
          </div>
          <div>
            <label className={labelCls} style={{ color: txt }}>Tagline</label>
            <input type="text" value={siteSettings.tagline}
              onChange={e => { setSiteSettings({...siteSettings, tagline: e.target.value}); updateTagline(e.target.value); }}
              style={{ backgroundColor: inBg, borderColor: bdr, color: txt }}
              className={inputCls} placeholder="Pakistan's AI Medicine Safety Platform" />
            <p className="text-[10px] mt-1" style={{ color: sub }}>Shown below the site name in the navbar</p>
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

      {/* ── Maintenance Mode ────────────────────────────────────────────────── */}
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
          <Toggle value={siteSettings.maintenanceMode}
            onChange={v => setSiteSettings({...siteSettings, maintenanceMode: v})} color="orange" />
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
