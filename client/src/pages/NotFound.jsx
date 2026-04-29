import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Home, Search, ArrowLeft, Pill } from "lucide-react";

const NotFound = () => {
  const navigate  = useNavigate();
  const { isDark } = useTheme();

  const txt = isDark ? "#f1f5f9" : "#111827";
  const sub = isDark ? "#94a3b8" : "#6b7280";
  const bg  = isDark ? "#0f172a" : "#f8fafc";
  const card = isDark ? "#1e293b" : "#ffffff";
  const bdr  = isDark ? "#334155" : "#e5e7eb";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: bg }}>
      <div className="max-w-lg w-full text-center">

        {/* 404 Number */}
        <div className="relative mb-8">
          <p className="text-[10rem] font-black leading-none select-none"
            style={{ color: isDark ? "#1e3a5f" : "#eff6ff", lineHeight: 1 }}>
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 rotate-12">
              <Pill size={44} className="text-white -rotate-12" />
            </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-3xl font-black mb-3" style={{ color: txt }}>
          Page Not Found
        </h1>
        <p className="text-base mb-2" style={{ color: sub }}>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="text-sm mb-10" style={{ color: sub }}>
          It might be a broken link or you may have typed the URL incorrectly.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <button onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-blue-200 transition">
            <Home size={18} /> Go to Home
          </button>
          <button onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 font-bold px-8 py-3.5 rounded-2xl border-2 transition"
            style={{ borderColor: bdr, color: txt, backgroundColor: card }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#334155" : "#f3f4f6"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = card}>
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div style={{ backgroundColor: card, borderColor: bdr }} className="rounded-2xl border p-5">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: sub }}>
            Maybe you were looking for
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Search Medicine", path: "/search" },
              { label: "Fake Detector",   path: "/fake-detector" },
              { label: "Symptom Checker", path: "/symptoms" },
              { label: "Interactions",    path: "/interactions" },
            ].map((item, i) => (
              <button key={i} onClick={() => navigate(item.path)}
                className="text-xs font-semibold px-3 py-2.5 rounded-xl border transition text-left flex items-center gap-2"
                style={{ borderColor: bdr, color: txt }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#2563eb"; e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.borderColor = "#2563eb"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = txt; e.currentTarget.style.borderColor = bdr; }}>
                <Search size={12} /> {item.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs mt-6" style={{ color: sub }}>
          MedicoGuidance © 2026 — Pakistan's AI Medicine Safety Platform
        </p>
      </div>
    </div>
  );
};

export default NotFound;