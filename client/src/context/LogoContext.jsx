import { createContext, useContext, useState } from "react";

const LogoContext = createContext(null);

export const LogoProvider = ({ children }) => {
  // Each is a data URL (from FileReader) so it persists in memory during session
  const [lightLogo, setLightLogo] = useState(
    localStorage.getItem("logo_light") || null
  );
  const [darkLogo, setDarkLogo] = useState(
    localStorage.getItem("logo_dark") || null
  );

  const saveLogo = (type, dataUrl) => {
    if (type === "light") {
      setLightLogo(dataUrl);
      localStorage.setItem("logo_light", dataUrl);
    } else {
      setDarkLogo(dataUrl);
      localStorage.setItem("logo_dark", dataUrl);
    }
  };

  const clearLogos = () => {
    setLightLogo(null);
    setDarkLogo(null);
    localStorage.removeItem("logo_light");
    localStorage.removeItem("logo_dark");
  };

  return (
    <LogoContext.Provider value={{ lightLogo, darkLogo, saveLogo, clearLogos }}>
      {children}
    </LogoContext.Provider>
  );
};

export const useLogo = () => useContext(LogoContext);
