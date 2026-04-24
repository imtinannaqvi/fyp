import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark, BookmarkCheck, Languages, Loader2, Info,
  AlertTriangle, CheckCircle, ShieldAlert, Pill, Clock,
  Utensils, Baby, Ban, UserX, Coffee, ArrowRight,
  ChevronDown, ChevronUp, Zap, XCircle
} from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const MedicineCard = ({ medicine, source, savedIds = [], onSaveToggle }) => {
  const [dosage,        setDosage]        = useState(null);
  const [loadingDosage, setLoadingDosage] = useState(false);
  const [lang,          setLang]          = useState("en");
  const [urduData,      setUrduData]      = useState(null);
  const [translating,   setTranslating]   = useState(false);

  const { user }  = useAuth();
  const { isDark } = useTheme();
  const navigate  = useNavigate();
  const isSaved   = savedIds.includes(medicine._id);

  const data   = lang === "ur" && urduData ? { ...medicine, ...urduData } : medicine;
  const isUrdu = lang === "ur";
  const isExternal = source === "OpenFDA" || source === "AI Generated";

  // ── theme ──────────────────────────────────────────────────────────────────
  const bg  = isDark ? "#0f172a" : "#ffffff";
  const bdr = isDark ? "#1e293b" : "#e5e7eb";
  const hdr = isDark ? "#1e293b" : "#f8fafc";
  const txt = isDark ? "#f1f5f9" : "#111827";
  const sub = isDark ? "#94a3b8" : "#6b7280";

  // ── chip color map ─────────────────────────────────────────────────────────
  const C = {
    blue:   isDark ? { bg:"#1e3a5f", bdr:"#2563eb", lbl:"#60a5fa", val:"#e2e8f0" } : { bg:"#eff6ff", bdr:"#bfdbfe", lbl:"#3b82f6", val:"#1e3a5f" },
    indigo: isDark ? { bg:"#1e1b4b", bdr:"#6366f1", lbl:"#a5b4fc", val:"#e0e7ff" } : { bg:"#eef2ff", bdr:"#c7d2fe", lbl:"#6366f1", val:"#312e81" },
    green:  isDark ? { bg:"#052e16", bdr:"#16a34a", lbl:"#4ade80", val:"#bbf7d0" } : { bg:"#f0fdf4", bdr:"#86efac", lbl:"#16a34a", val:"#14532d" },
    red:    isDark ? { bg:"#3b0a0a", bdr:"#dc2626", lbl:"#f87171", val:"#fecaca" } : { bg:"#fef2f2", bdr:"#fecaca", lbl:"#dc2626", val:"#7f1d1d" },
    purple: isDark ? { bg:"#2e1065", bdr:"#7c3aed", lbl:"#c084fc", val:"#e9d5ff" } : { bg:"#f5f3ff", bdr:"#ddd6fe", lbl:"#7c3aed", val:"#4c1d95" },
    orange: isDark ? { bg:"#431407", bdr:"#ea580c", lbl:"#fb923c", val:"#fed7aa" } : { bg:"#fff7ed", bdr:"#fed7aa", lbl:"#ea580c", val:"#7c2d12" },
    gray:   isDark ? { bg:"#1e293b", bdr:"#334155", lbl:"#94a3b8", val:"#e2e8f0" } : { bg:"#f9fafb", bdr:"#e5e7eb", lbl:"#6b7280", val:"#111827" },
  };

  // ── handlers ───────────────────────────────────────────────────────────────
  const handleLangToggle = async () => {
    if (lang === "en") {
      if (urduData) { setLang("ur"); return; }
      setTranslating(true);
      try {
        const { data: res } = await API.post("/ai/translate", { medicine });
        setUrduData(res.translated); setLang("ur");
      } catch { toast.error("Translation failed."); }
      finally { setTranslating(false); }
    } else { setLang("en"); }
  };

  const handleSave = async () => {
    if (!user) { toast.error("Please login to save medicines"); return; }
    try {
      if (isSaved) {
        await API.delete(`/user/save-medicine/${medicine._id}`);
        toast.success("Removed from saved"); onSaveToggle?.(medicine._id, false);
      } else {
        await API.post(`/user/save-medicine/${medicine._id}`);
        toast.success("Medicine saved!"); onSaveToggle?.(medicine._id, true);
      }
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleGetDosage = async () => {
    if (!user) { toast.error("Please login to get personalized dosage"); return; }
    if (!medicine._id) { toast.error("Medicine not in our database"); return; }
    setLoadingDosage(true);
    try {
      const { data: res } = await API.get(`/ai/dosage/${medicine._id}`);
      setDosage(res.recommendation);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to get dosage";
      if (msg.includes("profile")) { toast.error("Please complete your health profile first"); navigate("/profile"); }
      else toast.error(msg);
    } finally { setLoadingDosage(false); }
  };

  // ── sub-components ─────────────────────────────────────────────────────────
  const Chip = ({ label, value, color = "blue", full = false }) => {
    if (!value) return null;
    const c = C[color];
    return (
      <div style={{ backgroundColor: c.bg, borderColor: c.bdr, border: `1px solid ${c.bdr}` }}
        className={`rounded-xl p-3 ${full ? "col-span-2 sm:col-span-4" : ""}`}>
        <p style={{ color: c.lbl }} className="text-[10px] font-bold uppercase tracking-wide mb-1">{label}</p>
        <p style={{ color: c.val }} className={`text-sm font-semibold leading-snug ${isUrdu ? "text-right" : ""}`}>{value}</p>
      </div>
    );
  };

  const ListSection = ({ title, icon, items, color = "blue" }) => {
    if (!items?.length) return null;
    const c = C[color];
    const hdrColors = { blue:"bg-blue-600", red:"bg-red-600", orange:"bg-orange-500", purple:"bg-purple-600", green:"bg-green-600", gray:"bg-gray-500", indigo:"bg-indigo-600" };
    return (
      <div style={{ backgroundColor: bg, borderColor: bdr }} className="rounded-2xl border p-4">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: bdr }}>
          <div className={`w-7 h-7 ${hdrColors[color]} text-white flex items-center justify-center rounded-lg`}>{icon}</div>
          <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: txt }}>{title}</h3>
        </div>
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className={`text-xs pl-3 py-0.5 border-l-2 leading-relaxed ${isUrdu ? "text-right pr-3 pl-0 border-r-2 border-l-0" : ""}`}
              style={{ borderColor: c.bdr, color: isDark ? "#cbd5e1" : "#374151" }}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const sourceBadge = {
    database:       { label: "Verified",  icon: <CheckCircle size={12} />,  cls: "bg-blue-600 text-white" },
    OpenFDA:        { label: "FDA Data",  icon: <ShieldAlert size={12} />,  cls: "bg-blue-700 text-white" },
    "AI Generated": { label: "AI Info",   icon: <Zap size={12} />,          cls: "bg-blue-500 text-white" },
  }[source] || { label: source, icon: <Info size={12} />, cls: "bg-gray-600 text-white" };

  return (
    <div style={{ backgroundColor: bg, borderColor: bdr, border: `1px solid ${bdr}` }}
      className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      dir={isUrdu ? "rtl" : "ltr"}>

      {/* ── External Banner ──────────────────────────────────────────────────── */}
      {isExternal && (
        <div style={{ background: "linear-gradient(90deg,#1d4ed8,#2563eb)" }}
          className="px-5 py-2 flex items-center gap-2 text-xs font-semibold text-white">
          <Info size={13} />
          {source === "OpenFDA" ? "Data sourced from U.S. FDA OpenFDA database" : "AI-generated information — not in local database"}
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: hdr, borderBottom: `1px solid ${bdr}` }} className="px-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h2 className="text-2xl font-bold" style={{ color: txt }}>{medicine.name}</h2>
              <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${sourceBadge.cls}`}>
                {sourceBadge.icon} {sourceBadge.label}
              </span>
            </div>
            <p className="text-sm" style={{ color: sub }}>
              {medicine.brand   && <span className="font-semibold">{medicine.brand}</span>}
              {medicine.generic  && <span> | Generic: {medicine.generic}</span>}
              {medicine.category && <span> | {medicine.category}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleLangToggle} disabled={translating}
              className={`flex items-center gap-1.5 px-3 py-2 border-2 rounded text-xs font-bold transition ${isUrdu ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-700"}`}>
              {translating ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
              {translating ? "..." : isUrdu ? "EN" : "اردو"}
            </button>
            {medicine._id && (
              <button onClick={handleSave}
                className={`p-2 border rounded transition ${isSaved ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-600"}`}>
                {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">

        {/* ── Key Info — HORIZONTAL 4-col grid ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Chip label={isUrdu ? "معیاری خوراک" : "Dosage"}     value={data.dosage}    color="blue" />
          <Chip label={isUrdu ? "دوا کی قسم"   : "Drug Class"} value={data.category}  color="indigo" />
          <Chip label={isUrdu ? "نسخہ"          : "Rx Status"}
            value={medicine.requiresPrescription != null ? (medicine.requiresPrescription ? "Prescription Required" : "Over-the-Counter") : null}
            color={medicine.requiresPrescription ? "red" : "green"} />
          {medicine.price > 0 && <Chip label={isUrdu ? "قیمت" : "Price"} value={`Rs. ${medicine.price}`} color="blue" />}
        </div>

        {/* ── AI Explanation ────────────────────────────────────────────────────── */}
        {data.aiExplanation && (
          <div style={{ backgroundColor: isDark ? "#1e3a5f" : "#eff6ff", borderColor: isDark ? "#2563eb" : "#bfdbfe" }}
            className="rounded-2xl border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <p className="text-sm font-bold text-blue-500 uppercase tracking-wide">
                {isUrdu ? "AI سے معلومات" : "AI-Generated Information"}
              </p>
            </div>
            <p style={{ color: isDark ? "#bfdbfe" : "#1e40af" }} className={`text-sm leading-relaxed ${isUrdu ? "text-right" : ""}`}>
              {data.aiExplanation}
            </p>
          </div>
        )}

        {/* ── Description ───────────────────────────────────────────────────────── */}
        {data.description && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: sub }}>
              {isUrdu ? "تفصیل" : "About This Medicine"}
            </p>
            <p className={`text-sm leading-relaxed ${isUrdu ? "text-right" : ""}`} style={{ color: isDark ? "#cbd5e1" : "#374151" }}>
              {data.description}
            </p>
          </div>
        )}

        {/* ── Misuse Warning ────────────────────────────────────────────────────── */}
        {medicine.isCommonlyMisused && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-amber-800">
              {isUrdu ? "خبردار: یہ دوا عام طور پر غلط استعمال ہوتی ہے۔ صرف ڈاکٹر کی ہدایت پر استعمال کریں۔"
                      : "WARNING: This medicine is commonly misused. Use only as directed by a healthcare professional."}
            </p>
          </div>
        )}

        {/* ── Dosage Guide — HORIZONTAL ─────────────────────────────────────────── */}
        {data.dosageGuide && Object.values(data.dosageGuide).some(v => v) && (
          <div style={{ backgroundColor: bg, borderColor: bdr }} className="rounded-2xl border p-5">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: bdr }}>
              <div className="w-7 h-7 bg-indigo-600 text-white flex items-center justify-center rounded-lg">
                <Clock size={14} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: txt }}>
                {isUrdu ? "خوراک کی ہدایات" : "Dosage Guide"}
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {data.dosageGuide.adult   && <Chip label={isUrdu ? "بالغ"  : "Adult"}       value={data.dosageGuide.adult}   color="indigo" />}
              {data.dosageGuide.child   && <Chip label={isUrdu ? "بچے"   : "Child"}       value={data.dosageGuide.child}   color="green" />}
              {data.dosageGuide.elderly && <Chip label={isUrdu ? "بزرگ"  : "Elderly"}     value={data.dosageGuide.elderly} color="indigo" />}
              {data.dosageGuide.notes   && <Chip label={isUrdu ? "نوٹ"   : "Notes"}       value={data.dosageGuide.notes}   color="gray" full />}
            </div>
          </div>
        )}

        {/* ── Personalized Dosage Button ────────────────────────────────────────── */}
        {medicine._id && (
          !dosage ? (
            <button onClick={handleGetDosage} disabled={loadingDosage}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loadingDosage
                ? <><Clock size={16} className="animate-spin" /> {isUrdu ? "خوراک حساب ہو رہی ہے..." : "Calculating..."}</>
                : <><Pill size={16} /> {isUrdu ? "ذاتی خوراک کی سفارش حاصل کریں" : "Get Personalized Dosage Recommendation"}</>}
            </button>
          ) : (
            <div style={{ backgroundColor: isDark ? "#1e3a5f" : "#eff6ff", borderColor: isDark ? "#2563eb" : "#bfdbfe" }}
              className="rounded-2xl border p-4">
              <p className="text-sm font-bold text-blue-500 uppercase mb-2">{isUrdu ? "آپ کی ذاتی خوراک" : "Your Personalized Dosage"}</p>
              <p className="text-sm leading-relaxed" style={{ color: isDark ? "#bfdbfe" : "#1e40af" }}>{dosage}</p>
              <button onClick={() => setDosage(null)} className="text-xs text-blue-500 font-semibold mt-2 underline">
                {isUrdu ? "چھپائیں" : "Hide"}
              </button>
            </div>
          )
        )}

        {/* ── Clinical Sections — 2-col HORIZONTAL grid ────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ListSection title={isUrdu ? "مضر اثرات"        : "Side Effects"}          icon={<Zap size={14} />}           items={data.sideEffects}       color="orange" />
          <ListSection title={isUrdu ? "احتیاطی تدابیر"   : "Warnings"}              icon={<AlertTriangle size={14} />}  items={data.warnings}          color="red" />
          <ListSection title={isUrdu ? "استعمال کی ممانعت": "Contraindications"}     icon={<Ban size={14} />}            items={data.contraindications} color="red" />
          <ListSection title={isUrdu ? "دوائی تعاملات"    : "Drug Interactions"}     icon={<ShieldAlert size={14} />}    items={data.drugInteractions}  color="purple" />
          <ListSection title={isUrdu ? "کھانے سے تعامل"   : "Food Interactions"}     icon={<Utensils size={14} />}       items={data.foodInteractions}  color="orange" />
          <ListSection title={isUrdu ? "طویل مدتی اثرات"  : "Long-Term Effects"}     icon={<Clock size={14} />}          items={data.longTermEffects}   color="gray" />
          <ListSection title={isUrdu ? "یہ دوا کون نہ لے" : "Who Should NOT Take"}   icon={<UserX size={14} />}          items={data.whoShouldNotTake}  color="red" />
        </div>

        {/* ── Food Timing ───────────────────────────────────────────────────────── */}
        {data.foodTiming && (
          <div style={{ backgroundColor: isDark ? "#1e293b" : "#eff6ff", borderColor: bdr }} className="rounded-2xl border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                <Coffee size={14} className="text-white" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wide" style={{ color: txt }}>
                {isUrdu ? "کھانے کے ساتھ کیسے لیں" : "How to Take With Food"}
              </p>
            </div>
            <p className={`text-sm leading-relaxed ${isUrdu ? "text-right" : ""}`}
              style={{ color: isDark ? "#bfdbfe" : "#1e40af" }}>
              {typeof data.foodTiming === "string" ? data.foodTiming : data.foodTiming?.recommendation || ""}
            </p>
          </div>
        )}

        {/* ── Pregnancy & Breastfeeding ─────────────────────────────────────────── */}
        {(data.pregnancyWarning || data.breastfeedingWarning) && (
          <div style={{ backgroundColor: bg, borderColor: bdr }} className="rounded-2xl border p-5">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: bdr }}>
              <div className="w-7 h-7 bg-pink-500 text-white flex items-center justify-center rounded-lg">
                <Baby size={14} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: txt }}>
                {isUrdu ? "حمل اور دودھ پلانا" : "Pregnancy & Breastfeeding"}
              </h3>
            </div>
            <div className="space-y-3">
              {data.pregnancyWarning && (
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-pink-600 mb-1">{isUrdu ? "حمل" : "PREGNANCY"}</p>
                  <p className={`text-sm text-pink-800 ${isUrdu ? "text-right" : ""}`}>{data.pregnancyWarning}</p>
                </div>
              )}
              {data.breastfeedingWarning && (
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-pink-600 mb-1">{isUrdu ? "دودھ پلانا" : "BREASTFEEDING"}</p>
                  <p className={`text-sm text-pink-800 ${isUrdu ? "text-right" : ""}`}>{data.breastfeedingWarning}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Safe Alternatives ─────────────────────────────────────────────────── */}
        {medicine.safeAlternatives?.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: sub }}>
              {isUrdu ? "متبادل ادویات" : "Safe Alternatives"}
            </p>
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

        {/* ── External Source Disclaimer ────────────────────────────────────────── */}
        {isExternal && (
          <div style={{ backgroundColor: isDark ? "#2d1b00" : "#fffbeb", borderColor: isDark ? "#92400e" : "#fcd34d" }}
            className="rounded-xl border p-3 flex items-start gap-2">
            <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
            <p style={{ color: isDark ? "#fbbf24" : "#92400e" }} className="text-xs leading-relaxed">
              {source === "OpenFDA" ? "Data from U.S. FDA OpenFDA database." : "AI-generated information."} Always verify with a licensed pharmacist or doctor.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default MedicineCard;
