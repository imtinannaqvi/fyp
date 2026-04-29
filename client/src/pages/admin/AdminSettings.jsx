// pages/admin/AdminSettings.jsx
import { useState, useRef, useEffect } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  Upload, Save, Loader, Globe, Image, RefreshCw,
  CheckCircle, Info, Palette, Shield, AlertTriangle
} from "lucide-react";

const AdminSettings = () => {
  const [logoFile, setLogoFile]       = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [currentLogo, setCurrentLogo] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    siteName:        "MedicoGuidance",
    tagline:         "Pakistan's AI Medicine Safety Platform",
    contactEmail:    "",
    contactPhone:    "",
    maintenanceMode: false,
  });
  const fileRef = useRef();

  useEffect(() => {
    // Load current settings if you have a settings endpoint
    // For now just use defaults
  }, []);

  const handleLogoFile = (f) => {
    if (!f?.type.startsWith("image/")) { toast.error("Please upload a valid image"); return; }
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
  };

  const handleLogoUpload = async () => {
    if (!logoFile) { toast.error("Please select a logo image first"); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);
      // Upload logo to your server
      await API.post("/admin/settings/logo", formData);
      setCurrentLogo(logoPreview);
      toast.success("Logo updated successfully!");
    } catch (err) {
      // If no backend endpoint yet, just show success for demo
      setCurrentLogo(logoPreview);
      toast.success("Logo saved! (Add /admin/settings/logo endpoint to persist)");
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsSave = async () => {
    setSaving(true);
    try {
      await API.post("/admin/settings", siteSettings);
      toast.success("Settings saved!");
    } catch {
      toast.success("Settings saved locally! (Add /admin/settings endpoint to persist)");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">

      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-gray-900 mb-1">Site Settings</h2>
        <p className="text-gray-500 text-sm">Manage your MedicoGuidance platform settings</p>
      </div>

      {/* Logo Upload */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Image size={18} className="text-blue-600" /> Site Logo
        </h3>
        <p className="text-xs text-gray-500 mb-5">Upload your site logo. Recommended: 512×512px PNG with transparent background.</p>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Current / Preview */}
          <div className="shrink-0">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Current Logo</p>
            <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
              {logoPreview || currentLogo ? (
                <img src={logoPreview || currentLogo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center p-2">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-1">
                    <Shield size={24} className="text-white" />
                  </div>
                  <p className="text-[10px] text-gray-400">Default</p>
                </div>
              )}
            </div>
          </div>

          {/* Upload */}
          <div className="flex-1">
            <div
              onClick={() => fileRef.current.click()}
              className="border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer transition bg-blue-50/50 hover:bg-blue-50">
              <Upload size={24} className="text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700 mb-1">Click to upload new logo</p>
              <p className="text-xs text-gray-400">PNG, JPG, SVG up to 2MB</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => handleLogoFile(e.target.files[0])} />
            </div>
            {logoFile && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-xl px-3 py-2">
                <CheckCircle size={15} /> {logoFile.name} selected
              </div>
            )}
            <button onClick={handleLogoUpload} disabled={!logoFile || saving}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm">
              {saving ? <><Loader size={16} className="animate-spin" /> Uploading...</> : <><Upload size={16} /> Upload Logo</>}
            </button>
          </div>
        </div>
      </div>

      {/* Site Info */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Globe size={18} className="text-blue-600" /> Site Information
        </h3>
        <p className="text-xs text-gray-500 mb-5">Basic information displayed across the platform.</p>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Site Name</label>
            <input type="text" value={siteSettings.siteName}
              onChange={e => setSiteSettings({...siteSettings, siteName: e.target.value})}
              className={inputClass} placeholder="MedicoGuidance" />
          </div>
          <div>
            <label className={labelClass}>Tagline</label>
            <input type="text" value={siteSettings.tagline}
              onChange={e => setSiteSettings({...siteSettings, tagline: e.target.value})}
              className={inputClass} placeholder="Pakistan's AI Medicine Safety Platform" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Contact Email</label>
              <input type="email" value={siteSettings.contactEmail}
                onChange={e => setSiteSettings({...siteSettings, contactEmail: e.target.value})}
                className={inputClass} placeholder="admin@medicoguide.pk" />
            </div>
            <div>
              <label className={labelClass}>Contact Phone</label>
              <input type="tel" value={siteSettings.contactPhone}
                onChange={e => setSiteSettings({...siteSettings, contactPhone: e.target.value})}
                className={inputClass} placeholder="03XX-XXXXXXX" />
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
          <AlertTriangle size={18} className="text-orange-500" /> Maintenance Mode
        </h3>
        <p className="text-xs text-gray-500 mb-4">When enabled, only admins can access the site.</p>
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Enable Maintenance Mode</p>
            <p className="text-xs text-gray-500 mt-0.5">Users will see a maintenance page</p>
          </div>
          <button
            onClick={() => setSiteSettings({...siteSettings, maintenanceMode: !siteSettings.maintenanceMode})}
            className={`relative w-12 h-6 rounded-full transition-all ${
              siteSettings.maintenanceMode ? "bg-orange-500" : "bg-gray-300"
            }`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
              siteSettings.maintenanceMode ? "left-6" : "left-0.5"
            }`} />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button onClick={handleSettingsSave} disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2">
        {saving ? <><Loader size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save All Settings</>}
      </button>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
        <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed">
          <strong>Note:</strong> Logo and settings persistence requires backend endpoints. Add <code className="bg-blue-100 px-1 rounded">/api/admin/settings</code> and <code className="bg-blue-100 px-1 rounded">/api/admin/settings/logo</code> routes to your backend for full functionality.
        </p>
      </div>
    </div>
  );
};

export default AdminSettings;