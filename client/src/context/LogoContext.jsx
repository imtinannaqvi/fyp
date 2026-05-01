import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const LogoContext = createContext(null);

export const LogoProvider = ({ children }) => {
  const [lightLogo, setLightLogo] = useState(() => {
    const v = sessionStorage.getItem("logo_light");
    return (v && v.startsWith("data:image/")) ? v : null;
  });
  const [darkLogo, setDarkLogo] = useState(() => {
    const v = sessionStorage.getItem("logo_dark");
    return (v && v.startsWith("data:image/")) ? v : null;
  });
  const [lastChanged,  setLastChanged]  = useState(null);
  const [showSiteName, setShowSiteName] = useState(localStorage.getItem("show_site_name") !== "false");
  const [siteName,     setSiteName]     = useState(localStorage.getItem("site_name") || "MedicoGuidance");
  const [tagline,      setTagline]      = useState(localStorage.getItem("site_tagline") || "");
  const [loadingLogos, setLoadingLogos] = useState(true);

  // Clear stale localStorage blobs (one-time migration)
  useEffect(() => {
    localStorage.removeItem("logo_light");
    localStorage.removeItem("logo_dark");
  }, []);

  // ── Fetch from server on app load ─────────────────────────────────────────
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await API.get("/admin/settings");
        if (data.logoLight && data.logoLight !== "null" && data.logoLight.startsWith("data:image/")) {
          setLightLogo(data.logoLight);
          try { sessionStorage.setItem("logo_light", data.logoLight); } catch {}
        }
        if (data.logoDark && data.logoDark !== "null" && data.logoDark.startsWith("data:image/")) {
          setDarkLogo(data.logoDark);
          try { sessionStorage.setItem("logo_dark", data.logoDark); } catch {}
        }
        if (data.showSiteName !== undefined) { setShowSiteName(data.showSiteName); localStorage.setItem("show_site_name", data.showSiteName); }
        if (data.siteName)  { setSiteName(data.siteName);   localStorage.setItem("site_name",    data.siteName);  }
        if (data.tagline)   { setTagline(data.tagline);     localStorage.setItem("site_tagline", data.tagline);   }
        if (data.lastChangedBy?.adminName) setLastChanged(data.lastChangedBy);
      } catch {
        // keep defaults
      } finally {
        setLoadingLogos(false);
      }
    };
    fetchSettings();
  }, []);

  const saveLogo = async (type, dataUrl) => {
    if (type === "light") { setLightLogo(dataUrl); try { sessionStorage.setItem("logo_light", dataUrl); } catch {} }
    else                  { setDarkLogo(dataUrl);  try { sessionStorage.setItem("logo_dark",  dataUrl); } catch {} }
    try {
      const payload = type === "light" ? { logoLight: dataUrl } : { logoDark: dataUrl };
      const { data } = await API.post("/admin/settings/logo", payload);
      if (data.lastChangedBy) setLastChanged(data.lastChangedBy);
    } catch (err) { console.error("Failed to save logo:", err.message); }
  };

  const clearLogos = async (type) => {
    if (!type || type === "light") { setLightLogo(null); sessionStorage.removeItem("logo_light"); }
    if (!type || type === "dark")  { setDarkLogo(null);  sessionStorage.removeItem("logo_dark");  }
    try {
      const payload = {};
      if (!type || type === "light") payload.logoLight = "CLEAR";
      if (!type || type === "dark")  payload.logoDark  = "CLEAR";
      await API.post("/admin/settings/logo", payload);
    } catch {}
  };

  const updateShowSiteName = async (val) => {
    setShowSiteName(val);
    localStorage.setItem("show_site_name", val);
    try { await API.post("/admin/settings", { showSiteName: val }); } catch {}
  };

  const updateSiteName = async (val) => {
    setSiteName(val);
    localStorage.setItem("site_name", val);
    try { await API.post("/admin/settings", { siteName: val }); } catch {}
  };

  const updateTagline = async (val) => {
    setTagline(val);
    localStorage.setItem("site_tagline", val);
    try { await API.post("/admin/settings", { tagline: val }); } catch {}
  };

  return (
    <LogoContext.Provider value={{
      lightLogo, darkLogo, saveLogo, clearLogos,
      lastChanged, loadingLogos,
      showSiteName, updateShowSiteName,
      siteName, updateSiteName,
      tagline, updateTagline,
    }}>
      {children}
    </LogoContext.Provider>
  );
};

export const useLogo = () => useContext(LogoContext);
