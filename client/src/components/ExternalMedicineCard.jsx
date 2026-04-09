import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, CheckCircle, ShieldAlert, Pill, Info,
  ChevronDown, ChevronUp, Zap, Languages, Loader2,
  ArrowRight, BookOpen, Activity, FlaskConical, Utensils,
  Clock, UserX
} from "lucide-react";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const DESC_LIMIT = 200;

const ExternalMedicineCard = ({ medicine, source }) => {
  const [descOpen,    setDescOpen]    = useState(false);
  const [detailOpen,  setDetailOpen]  = useState(false);
  const [lang,        setLang]        = useState("en");
  const [urduData,    setUrduData]    = useState(null);
  const [translating, setTranslating] = useState(false);
  const { isDark } = useTheme();
  const navigate   = useNavigate();

  const data   = lang === "ur" && urduData ? { ...medicine, ...urduData } : medicine;
  const isUrdu = lang === "ur";
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

  // ── theme tokens ────────────────────────────────────────────────────────────
  const card  = isDark ? { background: "#0f172a", border: "1px solid #1e293b" }
                       : { background: "#ffffff", border: "1px solid #e2e8f0" };
  const left  = isDark ? { background: "#111827", borderRight: "1px solid #1e293b" }
                       : { background: "#f8fafc", borderRight: "1px solid #e2e8f0" };
  const pill  = isDark ? { background: "#1e293b" } : { background: "#eff6ff" };
  const pillC = isDark ? "text-blue-400" : "text-blue-600";

  // stat row bg
  const statBg  = isDark ? "#1e293b" : "#ffffff";
  const statBdr = isDark ? "#334155" : "#f1f5f9";
  const labelC  = isDark ? "#64748b" : "#94a3b8";
  const valC    = isDark ? "#e2e8f0" : "#1e293b";

  // tag factory
  const tagStyle = (accent) => {
    const map = {
      orange: isDark ? { bg:"#1e3a5f", border:"#2563eb", text:"#93c5fd" } : { bg:"#eff6ff", border:"#bfdbfe", text:"#2563eb" },
      red:    isDark ? { bg:"#3b0a0a", border:"#dc2626", text:"#fca5a5" } : { bg:"#fef2f2", border:"#fca5a5", text:"#dc2626" },
      purple: isDark ? { bg:"#1e3a5f", border:"#2563eb", text:"#93c5fd" } : { bg:"#eff6ff", border:"#bfdbfe", text:"#2563eb" },
      blue:   isDark ? { bg:"#1e3a5f", border:"#2563eb", text:"#93c5fd" } : { bg:"#eff6ff", border:"#bfdbfe", text:"#2563eb" },
      green:  isDark ? { bg:"#052e16", border:"#16a34a", text:"#86efac" } : { bg:"#f0fdf4", border:"#86efac", text:"#16a34a" },
    };
    return map[accent] || map.blue;
  };

  const Tag = ({ label, accent = "blue" }) => {
    const t = tagStyle(accent);
    return (
      <span style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.text }}
        className="text-xs px-2.5 py-1 rounded-full font-medium">
        {label}
      </span>
    );
  };

  const TagGroup = ({ items, accent, max = 5 }) => {
    const [show, setShow] = useState(false);
    if (!items?.length) return null;
    const visible = show ? items : items.slice(0, max);
    return (
      <div>
        <div className="flex flex-wrap gap-1.5">
          {visible.map((item, i) => <Tag key={i} label={item} accent={accent} />)}
        </div>
        {items.length > max && (
          <button onClick={() => setShow(!show)}
            style={{ color: isDark ? "#64748b" : "#94a3b8" }}
            className="mt-1.5 text-xs font-semibold flex items-center gap-1 hover:opacity-80 transition">
            {show ? "Show less" : `+${items.length - max} more`}
            <ChevronDown size={11} className={`transition-transform ${show ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>
    );
  };

  const SectionLabel = ({ children }) => (
    <p style={{ color: isDark ? "#475569" : "#94a3b8" }}
      className="text-[10px] font-bold uppercase tracking-widest mb-2">
      {children}
    </p>
  );

  return (
    <div style={{ ...card, borderRadius: "16px", overflow: "hidden", boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.06)" }}>

      {/* ── Source strip ──────────────────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(90deg,#1d4ed8,#2563eb)" }}
        className="px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          {isOpenFDA ? <ShieldAlert size={13} /> : <Zap size={13} />}
          <span className="text-xs font-bold uppercase tracking-wider">
            {isOpenFDA ? "U.S. FDA · OpenFDA Database" : "AI-Generated Information"}
          </span>
          <span style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
            className="text-[10px] text-white px-2 py-0.5 rounded-full font-medium">
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

      {/* ── Body: left panel + right panel ───────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row">

        {/* LEFT ─ identity + stat rows */}
        <div style={left} className="lg:w-64 shrink-0 p-5 flex flex-col gap-4">

          {/* Icon + name */}
          <div className="flex items-start gap-3">
            <div style={pill} className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
              <Pill size={20} className={pillC} />
            </div>
            <div className="min-w-0">
              <h2 style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}
                className="text-base font-extrabold leading-tight">{medicine.name}</h2>
              {medicine.brand   && <p style={{ color: isDark ? "#94a3b8" : "#64748b" }} className="text-xs mt-0.5">{medicine.brand}</p>}
              {medicine.generic && <p style={{ color: isDark ? "#64748b" : "#94a3b8" }} className="text-[11px]">Generic: {medicine.generic}</p>}
            </div>
          </div>

          {/* Stat rows */}
          <div style={{ background: statBg, border: `1px solid ${statBdr}`, borderRadius: "12px", overflow: "hidden" }}>
            {[
              medicine.category && { icon: <BookOpen size={12} />, label: "Drug Class",  val: medicine.category,  accent: null },
              data.dosage       && { icon: <Pill size={12} />,     label: "Dosage",      val: data.dosage,        accent: "blue" },
              medicine.requiresPrescription !== undefined && {
                icon: medicine.requiresPrescription ? <AlertTriangle size={12} /> : <CheckCircle size={12} />,
                label: "Rx Status",
                val: medicine.requiresPrescription ? "Prescription Required" : "Over-the-Counter",
                accent: medicine.requiresPrescription ? "red" : "green",
              },
              medicine.price > 0 && { icon: <Activity size={12} />, label: "Price", val: `Rs. ${medicine.price}`, accent: null },
            ].filter(Boolean).map((row, i, arr) => {
              const t = row.accent ? tagStyle(row.accent) : null;
              return (
                <div key={i} style={{ borderBottom: i < arr.length - 1 ? `1px solid ${statBdr}` : "none" }}
                  className="flex items-start gap-2.5 px-3 py-2.5">
                  <span style={{ color: isDark ? "#475569" : "#94a3b8" }} className="mt-0.5 shrink-0">{row.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: labelC }} className="text-[9px] font-bold uppercase tracking-widest mb-0.5">{row.label}</p>
                    <p style={{ color: t ? t.text : valC }} className="text-xs font-semibold break-words leading-snug">{row.val}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Warning notice */}
          <div style={isDark
            ? { background: "#2d1b00", border: "1px solid #92400e", borderRadius: "10px" }
            : { background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "10px" }}
            className="flex items-start gap-2 p-3">
            <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
            <p style={{ color: isDark ? "#fbbf24" : "#92400e" }} className="text-[11px] leading-relaxed">
              {isOpenFDA ? "FDA data." : "AI-generated."} Always verify with a pharmacist.
            </p>
          </div>
        </div>

        {/* RIGHT ─ description + tags */}
        <div className="flex-1 p-5 space-y-4">

          {/* Description */}
          {data.description && (
            <div>
              <SectionLabel>About</SectionLabel>
              <p style={{ color: isDark ? "#cbd5e1" : "#374151" }} className="text-sm leading-relaxed">
                {descOpen || data.description.length <= DESC_LIMIT
                  ? data.description
                  : `${data.description.slice(0, DESC_LIMIT)}...`}
              </p>
              {data.description.length > DESC_LIMIT && (
                <button onClick={() => setDescOpen(!descOpen)}
                  className="mt-1 text-xs font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1 transition">
                  {descOpen ? "Show less" : "Read more"}
                  <ChevronDown size={11} className={`transition-transform ${descOpen ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
          )}

          {/* AI Explanation */}
          {data.aiExplanation && (
            <div style={isDark
              ? { background: "#1e3a5f", border: "1px solid #2563eb", borderRadius: "12px" }
              : { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "12px" }}
              className="p-3.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Zap size={12} className="text-blue-500" />
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">AI Explanation</p>
              </div>
              <p style={{ color: isDark ? "#bfdbfe" : "#1e40af" }} className="text-sm leading-relaxed">
                {data.aiExplanation}
              </p>
            </div>
          )}

          {/* Tag sections */}
          {data.sideEffects?.length > 0 && (
            <div>
              <SectionLabel>Side Effects</SectionLabel>
              <TagGroup items={data.sideEffects} accent="orange" />
            </div>
          )}
          {data.warnings?.length > 0 && (
            <div>
              <SectionLabel>Warnings</SectionLabel>
              <TagGroup items={data.warnings} accent="red" />
            </div>
          )}
          {data.drugInteractions?.length > 0 && (
            <div>
              <SectionLabel>Drug Interactions</SectionLabel>
              <TagGroup items={data.drugInteractions} accent="purple" />
            </div>
          )}

          {/* Expandable extra details */}
          {(data.contraindications?.length > 0 || data.foodInteractions?.length > 0 || data.longTermEffects?.length > 0 || data.whoShouldNotTake?.length > 0) && (
            <div style={{ border: `1px solid ${isDark ? "#1e293b" : "#f1f5f9"}`, borderRadius: "12px", overflow: "hidden" }}>
              <button onClick={() => setDetailOpen(!detailOpen)}
                style={{ background: isDark ? "#1e293b" : "#f8fafc", color: isDark ? "#94a3b8" : "#64748b" }}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:opacity-80 transition">
                <span className="flex items-center gap-2">
                  <Info size={13} /> More Clinical Details
                </span>
                {detailOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {detailOpen && (
                <div style={{ background: isDark ? "#0f172a" : "#ffffff" }} className="p-4 space-y-3">
                  {data.contraindications?.length > 0 && (
                    <div><SectionLabel>Contraindications</SectionLabel><TagGroup items={data.contraindications} accent="red" /></div>
                  )}
                  {data.whoShouldNotTake?.length > 0 && (
                    <div><SectionLabel>Who Should NOT Take</SectionLabel><TagGroup items={data.whoShouldNotTake} accent="red" /></div>
                  )}
                  {data.foodInteractions?.length > 0 && (
                    <div><SectionLabel>Food Interactions</SectionLabel><TagGroup items={data.foodInteractions} accent="orange" /></div>
                  )}
                  {data.longTermEffects?.length > 0 && (
                    <div><SectionLabel>Long-Term Effects</SectionLabel><TagGroup items={data.longTermEffects} accent="blue" /></div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Safe alternatives */}
          {medicine.safeAlternatives?.length > 0 && (
            <div>
              <SectionLabel>Safe Alternatives</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {medicine.safeAlternatives.map((alt, i) => (
                  <button key={i} onClick={() => navigate(`/search?q=${alt}`)}
                    style={isDark
                      ? { background: "#052e16", border: "1px solid #16a34a", color: "#86efac" }
                      : { background: "#f0fdf4", border: "1px solid #86efac", color: "#15803d" }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-80 transition">
                    {alt} <ArrowRight size={11} />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ExternalMedicineCard;
