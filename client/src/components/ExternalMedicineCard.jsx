import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, CheckCircle, ShieldAlert, Pill, Info,
  ChevronDown, ChevronUp, Zap, Languages, Loader2,
  ArrowRight, Clock, Utensils, Baby, Ban, UserX,
  BookOpen, FlaskConical, Heart, Package, Coffee
} from "lucide-react";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const ExternalMedicineCard = ({ medicine, source }) => {
  const [expanded,    setExpanded]    = useState(false);
  const [lang,        setLang]        = useState("en");
  const [urduData,    setUrduData]    = useState(null);
  const [translating, setTranslating] = useState(false);
  const { isDark } = useTheme();
  const navigate   = useNavigate();

  const data      = lang === "ur" && urduData ? { ...medicine, ...urduData } : medicine;
  const isUrdu    = lang === "ur";
  const isOpenFDA = source === "OpenFDA";

  const handleLangToggle = async () => {
    if (lang === "en") {
      if (urduData) { setLang("ur"); return; }
      setTranslating(true);
      try {
        const { data: res } = await API.post("/ai/translate", { medicine });
        setUrduData(res.translated);
        setLang("ur");
      } catch { toast.error("Translation failed."); }
      finally { setTranslating(false); }
    } else { setLang("en"); }
  };

  // ── theme ────────────────────────────────────────────────────────────────────
  const bg   = isDark ? "#0f172a" : "#ffffff";
  const bdr  = isDark ? "#1e293b" : "#e5e7eb";
  const txt  = isDark ? "#f1f5f9" : "#111827";
  const sub  = isDark ? "#94a3b8" : "#6b7280";
  const hdr  = isDark ? "#1e293b" : "#f8fafc";

  // ── reusable chip ────────────────────────────────────────────────────────────
  const CHIP = {
    blue:   isDark ? { bg:"#1e3a5f", bdr:"#2563eb", lbl:"#60a5fa", val:"#e2e8f0" } : { bg:"#eff6ff", bdr:"#bfdbfe", lbl:"#3b82f6", val:"#1e3a5f" },
    indigo: isDark ? { bg:"#1e1b4b", bdr:"#6366f1", lbl:"#a5b4fc", val:"#e0e7ff" } : { bg:"#eef2ff", bdr:"#c7d2fe", lbl:"#6366f1", val:"#312e81" },
    green:  isDark ? { bg:"#052e16", bdr:"#16a34a", lbl:"#4ade80", val:"#bbf7d0" } : { bg:"#f0fdf4", bdr:"#86efac", lbl:"#16a34a", val:"#14532d" },
    red:    isDark ? { bg:"#3b0a0a", bdr:"#dc2626", lbl:"#f87171", val:"#fecaca" } : { bg:"#fef2f2", bdr:"#fecaca", lbl:"#dc2626", val:"#7f1d1d" },
    purple: isDark ? { bg:"#2e1065", bdr:"#7c3aed", lbl:"#c084fc", val:"#e9d5ff" } : { bg:"#f5f3ff", bdr:"#ddd6fe", lbl:"#7c3aed", val:"#4c1d95" },
    orange: isDark ? { bg:"#431407", bdr:"#ea580c", lbl:"#fb923c", val:"#fed7aa" } : { bg:"#fff7ed", bdr:"#fed7aa", lbl:"#ea580c", val:"#7c2d12" },
    gray:   isDark ? { bg:"#1e293b", bdr:"#334155", lbl:"#94a3b8", val:"#e2e8f0" } : { bg:"#f9fafb", bdr:"#e5e7eb", lbl:"#6b7280", val:"#111827" },
  };

  const InfoChip = ({ label, value, color = "blue", full = false }) => {
    if (!value) return null;
    const c = CHIP[color];
    return (
      <div style={{ backgroundColor: c.bg, borderColor: c.bdr, border: `1px solid ${c.bdr}` }}
        className={`rounded-xl p-3 ${full ? "col-span-2 sm:col-span-4" : ""}`}>
        <p style={{ color: c.lbl }} className="text-[10px] font-bold uppercase tracking-wide mb-1">{label}</p>
        <p style={{ color: c.val }} className="text-sm font-semibold leading-snug">{value}</p>
      </div>
    );
  };

  const ListSection = ({ title, icon, items, color = "blue" }) => {
    if (!items?.length) return null;
    const c = CHIP[color];
    const COLORS = {
      blue: "bg-blue-600", red: "bg-red-600", orange: "bg-orange-500",
      purple: "bg-purple-600", green: "bg-green-600", gray: "bg-gray-500", indigo: "bg-indigo-600"
    };
    return (
      <div style={{ backgroundColor: bg, borderColor: bdr }} className="rounded-2xl border p-4">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: bdr }}>
          <div className={`w-7 h-7 ${COLORS[color]} text-white flex items-center justify-center rounded-lg`}>{icon}</div>
          <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: txt }}>{title}</h3>
        </div>
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="text-xs pl-3 py-0.5 border-l-2 leading-relaxed"
              style={{ borderColor: c.bdr, color: isDark ? "#cbd5e1" : "#374151" }}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: bg, borderColor: bdr, border: `1px solid ${bdr}` }}
      className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      dir={isUrdu ? "rtl" : "ltr"}>

      {/* ── Source Banner ──────────────────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(90deg,#1d4ed8,#2563eb)" }}
        className="px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          {isOpenFDA ? <ShieldAlert size={13} /> : <Zap size={13} />}
          <span className="text-xs font-bold uppercase tracking-wider">
            {isOpenFDA ? "U.S. FDA · OpenFDA Database" : "AI-Generated Information"}
          </span>
          <span style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
            className="text-[10px] text-white px-2 py-0.5 rounded-full font-medium hidden sm:inline">
            Not in local DB
          </span>
        </div>
        <button onClick={handleLangToggle} disabled={translating}
          style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-white hover:bg-white/25 transition">
          {translating ? <Loader2 size={11} className="animate-spin" /> : <Languages size={11} />}
          {translating ? "..." : isUrdu ? "EN" : "اردو"}
        </button>
      </div>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: hdr, borderBottom: `1px solid ${bdr}` }} className="px-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h2 className="text-2xl font-bold" style={{ color: txt }}>{medicine.name}</h2>
              <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${isOpenFDA ? "bg-blue-700 text-white" : "bg-blue-500 text-white"}`}>
                {isOpenFDA ? <ShieldAlert size={12} /> : <Zap size={12} />}
                {isOpenFDA ? "FDA Data" : "AI Info"}
              </span>
            </div>
            <p className="text-sm" style={{ color: sub }}>
              {medicine.brand && <span className="font-semibold">{medicine.brand}</span>}
              {medicine.generic && <span> | Generic: {medicine.generic}</span>}
              {medicine.category && <span> | {medicine.category}</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* ── Key Info Chips — HORIZONTAL ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InfoChip label="Dosage"      value={data.dosage}    color="blue" />
          <InfoChip label="Drug Class"  value={data.category}  color="indigo" />
          <InfoChip label="Rx Status"
            value={medicine.requiresPrescription ? "Prescription Required" : "Over-the-Counter"}
            color={medicine.requiresPrescription ? "red" : "green"} />
          {medicine.price > 0 && <InfoChip label="Price" value={`Rs. ${medicine.price}`} color="blue" />}
        </div>

        {/* ── Dosage Guide — HORIZONTAL ─────────────────────────────────────────── */}
        {(data.dosageGuide?.adult || data.dosageGuide?.child || data.dosageGuide?.elderly) && (
          <div style={{ backgroundColor: bg, borderColor: bdr }} className="rounded-2xl border p-5">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: bdr }}>
              <div className="w-7 h-7 bg-indigo-600 text-white flex items-center justify-center rounded-lg">
                <Clock size={14} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: txt }}>Dosage Guide</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {data.dosageGuide?.adult   && <InfoChip label="Adult"        value={data.dosageGuide.adult}   color="indigo" />}
              {data.dosageGuide?.child   && <InfoChip label="Child"        value={data.dosageGuide.child}   color="green" />}
              {data.dosageGuide?.elderly && <InfoChip label="Elderly"      value={data.dosageGuide.elderly} color="indigo" />}
              {data.dosageGuide?.notes   && <InfoChip label="Notes"        value={data.dosageGuide.notes}   color="gray" full />}
            </div>
          </div>
        )}

        {/* ── AI Explanation ────────────────────────────────────────────────────── */}
        {data.aiExplanation && (
          <div style={{ backgroundColor: isDark ? "#1e3a5f" : "#eff6ff", borderColor: isDark ? "#2563eb" : "#bfdbfe" }}
            className="rounded-2xl border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <p className="text-sm font-bold text-blue-500 uppercase tracking-wide">AI-Generated Information</p>
            </div>
            <p style={{ color: isDark ? "#bfdbfe" : "#1e40af" }} className="text-sm leading-relaxed">{data.aiExplanation}</p>
          </div>
        )}

        {/* ── Description ───────────────────────────────────────────────────────── */}
        {data.description && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: sub }}>About This Medicine</p>
            <p className="text-sm leading-relaxed" style={{ color: isDark ? "#cbd5e1" : "#374151" }}>{data.description}</p>
          </div>
        )}

        {/* ── Misuse Warning ────────────────────────────────────────────────────── */}
        {medicine.isCommonlyMisused && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-amber-800">WARNING: This medicine is commonly misused. Use only as directed by a healthcare professional.</p>
          </div>
        )}

        {/* ── Clinical Sections Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ListSection title="Side Effects"      icon={<Zap size={14} />}           items={data.sideEffects}       color="orange" />
          <ListSection title="Warnings"          icon={<AlertTriangle size={14} />}  items={data.warnings}          color="red" />
          <ListSection title="Contraindications" icon={<Ban size={14} />}            items={data.contraindications} color="red" />
          <ListSection title="Drug Interactions" icon={<ShieldAlert size={14} />}    items={data.drugInteractions}  color="purple" />
          <ListSection title="Food Interactions" icon={<Utensils size={14} />}       items={data.foodInteractions}  color="orange" />
          <ListSection title="Long-Term Effects" icon={<Clock size={14} />}          items={data.longTermEffects}   color="gray" />
          <ListSection title="Who Should NOT Take" icon={<UserX size={14} />}        items={data.whoShouldNotTake}  color="red" />
        </div>

        {/* ── Food Timing ───────────────────────────────────────────────────────── */}
        {data.foodTiming && (
          <div style={{ backgroundColor: isDark ? "#1e293b" : "#eff6ff", borderColor: bdr }} className="rounded-2xl border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                <Coffee size={14} className="text-white" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wide" style={{ color: txt }}>How to Take With Food</p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: isDark ? "#bfdbfe" : "#1e40af" }}>{data.foodTiming}</p>
          </div>
        )}

        {/* ── Pregnancy & Breastfeeding ─────────────────────────────────────────── */}
        {(data.pregnancyWarning || data.breastfeedingWarning) && (
          <div style={{ backgroundColor: bg, borderColor: bdr }} className="rounded-2xl border p-5">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: bdr }}>
              <div className="w-7 h-7 bg-pink-500 text-white flex items-center justify-center rounded-lg">
                <Baby size={14} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: txt }}>Pregnancy & Breastfeeding</h3>
            </div>
            <div className="space-y-3">
              {data.pregnancyWarning && (
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-pink-600 mb-1">PREGNANCY</p>
                  <p className="text-sm text-pink-800">{data.pregnancyWarning}</p>
                </div>
              )}
              {data.breastfeedingWarning && (
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-pink-600 mb-1">BREASTFEEDING</p>
                  <p className="text-sm text-pink-800">{data.breastfeedingWarning}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Safe Alternatives ─────────────────────────────────────────────────── */}
        {medicine.safeAlternatives?.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: sub }}>Safe Alternatives</p>
            <div className="flex flex-wrap gap-2">
              {medicine.safeAlternatives.map((alt, i) => (
                <button key={i} onClick={() => navigate(`/search?q=${alt}`)}
                  style={{ backgroundColor: isDark ? "#052e16" : "#f0fdf4", borderColor: isDark ? "#16a34a" : "#86efac", color: isDark ? "#86efac" : "#15803d" }}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border hover:opacity-80 transition">
                  {alt} <ArrowRight size={11} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Disclaimer ────────────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: isDark ? "#2d1b00" : "#fffbeb", borderColor: isDark ? "#92400e" : "#fcd34d" }}
          className="rounded-xl border p-3 flex items-start gap-2">
          <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
          <p style={{ color: isDark ? "#fbbf24" : "#92400e" }} className="text-xs leading-relaxed">
            {isOpenFDA ? "Data sourced from U.S. FDA OpenFDA database." : "AI-generated information."} Always verify with a licensed pharmacist or doctor before use.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ExternalMedicineCard;
