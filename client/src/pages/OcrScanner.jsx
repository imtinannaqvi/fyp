import { useState, useRef, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  ScanLine, Loader, X, Image as ImageIcon, Search,
  CheckCircle, Pill, ShieldAlert, Zap,
  Clock, Utensils, Baby, Ban, ChevronDown, ChevronUp,
  FileText, Info, Package, FlaskConical, BookOpen, Heart, AlertTriangle
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const OcrScanner = () => {
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showRaw, setShowRaw]       = useState(false);
  const fileRef   = useRef();
  const { isDark } = useTheme();
  const navigate  = useNavigate();

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const handleFile = (f) => {
    if (!f?.type.startsWith("image/")) return toast.error("Please upload a valid image file");
    setFile(f); setPreview(URL.createObjectURL(f)); setResult(null);
  };
  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragenter" || e.type === "dragover"); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); };
  const handleReset = () => { setPreview(null); setFile(null); setResult(null); setShowRaw(false); };

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const { data } = await API.post("/ocr/upload", fd);
      setResult(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Scanner service unavailable");
    } finally {
      setLoading(false);
    }
  };

  const ai  = result?.aiData;
  const med = result?.medicineDetails;

  // theme shortcuts
  const card   = isDark ? "#1e293b" : "#ffffff";
  const bdr    = isDark ? "#334155" : "#e5e7eb";
  const txt    = isDark ? "#f1f5f9" : "#111827";
  const sub    = isDark ? "#94a3b8" : "#6b7280";

  return (
    <div className="min-h-screen" style={{ backgroundColor: isDark ? "#0f172a" : "#f8fafc" }}>
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow">
            <ScanLine size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: txt }}>Medicine Label Scanner</h1>
            <p className="text-sm" style={{ color: sub }}>Upload any medicine image — AI will extract full clinical details</p>
          </div>
        </div>

        {/* Upload */}
        {!preview ? (
          <div onClick={() => fileRef.current.click()}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            style={{ backgroundColor: dragActive ? (isDark ? "#1e3a5f" : "#eff6ff") : card, borderColor: dragActive ? "#3b82f6" : bdr }}
            className="border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all mb-6">
            <div style={{ backgroundColor: isDark ? "#334155" : "#f1f5f9" }} className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ImageIcon size={36} style={{ color: sub }} />
            </div>
            <p className="font-bold text-lg mb-1" style={{ color: txt }}>Drop medicine image here</p>
            <p className="text-sm mb-2" style={{ color: sub }}>or click to browse — JPG, PNG supported</p>
            <p className="text-xs" style={{ color: sub }}>Works even with blurry or partial images — AI powered</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div className="mb-6 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50">
              <img src={preview} alt="Preview" className="w-full max-h-72 object-contain" />
              <button onClick={handleReset} className="absolute top-3 right-3 p-2 bg-white hover:bg-gray-100 rounded-xl shadow transition">
                <X size={18} className="text-gray-700" />
              </button>
            </div>
            {!result && (
              <button onClick={handleScan} disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl shadow transition flex items-center justify-center gap-2 text-base">
                {loading
                  ? <><Loader className="animate-spin" size={20} /> AI is analyzing the label...</>
                  : <><ScanLine size={20} /> Scan & Analyze with AI</>}
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {result && ai && (
          <div className="space-y-4">

            {/* Status Banner */}
            <div className={`rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap ${result.isFake ? "bg-orange-50 border-2 border-orange-200" : "bg-green-50 border-2 border-green-200"}`}>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0" style={{ borderColor: result.isFake ? "#fed7aa" : "#bbf7d0" }}>
                  <img src={preview} alt="scanned" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className={`font-bold text-base ${result.isFake ? "text-orange-700" : "text-green-700"}`}>
                    {result.isFake
                      ? <span className="flex items-center gap-1.5"><Search size={15} /> {ai.medicineName || "Medicine"}</span>
                      : <span className="flex items-center gap-1.5"><CheckCircle size={15} /> Matched: {result.matchedWith}</span>}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold" style={{ color: sub }}>Image Confidence:</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-24 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${result.confidence}%`, backgroundColor: result.confidence >= 80 ? "#16a34a" : result.confidence >= 50 ? "#d97706" : "#dc2626" }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: result.confidence >= 80 ? "#16a34a" : result.confidence >= 50 ? "#d97706" : "#dc2626" }}>
                        {result.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => navigate(`/search?q=${encodeURIComponent(result.medicineName || "")}`)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition shadow">
                <Search size={15} /> Search DB
              </button>
            </div>

            {/* Identity Card */}
            <Section title="Medicine Identity" icon={<Pill size={16} className="text-white" />} color="#2563eb" isDark={isDark}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Chip label="Medicine Name"  value={ai.medicineName}  isDark={isDark} accent="blue" />
                <Chip label="Generic Name"   value={ai.genericName}   isDark={isDark} accent="indigo" />
                <Chip label="Drug Class"     value={ai.drugClass}     isDark={isDark} accent="purple" />
                <Chip label="Strength"       value={ai.strength}      isDark={isDark} accent="blue" />
                <Chip label="Manufacturer"   value={ai.company}       isDark={isDark} accent="gray" />
                <Chip label="Prescription"   value={ai.requiresPrescription ? "Required" : "Over-the-Counter"} isDark={isDark} accent={ai.requiresPrescription ? "red" : "green"} />
                {ai.expiry  && <Chip label="Expiry Date" value={ai.expiry}  isDark={isDark} accent="red" />}
                {ai.batchNo && <Chip label="Batch No"    value={ai.batchNo} isDark={isDark} accent="gray" />}
              </div>
            </Section>

            {/* Used For + How It Works */}
            <Section title="What This Medicine Does" icon={<BookOpen size={16} className="text-white" />} color="#7c3aed" isDark={isDark}>
              {ai.usedFor && (
                <div className="mb-3">
                  <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#7c3aed" }}>Used For</p>
                  <p className="text-sm leading-relaxed" style={{ color: txt }}>{ai.usedFor}</p>
                </div>
              )}
              {ai.howItWorks && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#7c3aed" }}>How It Works</p>
                  <p className="text-sm leading-relaxed" style={{ color: sub }}>{ai.howItWorks}</p>
                </div>
              )}
            </Section>

            {/* Dosage Guide */}
            {ai.dosage && (
              <Section title="Dosage Guide" icon={<Clock size={16} className="text-white" />} color="#4f46e5" isDark={isDark}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ai.dosage.adult        && <Chip label="Adult Dose"    value={ai.dosage.adult}        isDark={isDark} accent="indigo" />}
                  {ai.dosage.child        && <Chip label="Child Dose"    value={ai.dosage.child}        isDark={isDark} accent="green" />}
                  {ai.dosage.elderly      && <Chip label="Elderly"       value={ai.dosage.elderly}      isDark={isDark} accent="indigo" />}
                  {ai.dosage.frequency    && <Chip label="Frequency"     value={ai.dosage.frequency}    isDark={isDark} accent="blue" />}
                  {ai.dosage.duration     && <Chip label="Duration"      value={ai.dosage.duration}     isDark={isDark} accent="blue" />}
                  {ai.dosage.instructions && <Chip label="Instructions"  value={ai.dosage.instructions} isDark={isDark} accent="indigo" full />}
                </div>
              </Section>
            )}

            {/* Side Effects */}
            {ai.sideEffects && (
              <Section title="Side Effects" icon={<Zap size={16} className="text-white" />} color="#ea580c" isDark={isDark}>
                <div className="space-y-3">
                  {ai.sideEffects.common?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-orange-500 uppercase mb-2">Common</p>
                      <div className="flex flex-wrap gap-2">
                        {ai.sideEffects.common.map((s, i) => <Tag key={i} text={s} color="orange" />)}
                      </div>
                    </div>
                  )}
                  {ai.sideEffects.serious?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-red-500 uppercase mb-2">Serious</p>
                      <div className="flex flex-wrap gap-2">
                        {ai.sideEffects.serious.map((s, i) => <Tag key={i} text={s} color="red" />)}
                      </div>
                    </div>
                  )}
                  {ai.sideEffects.rare?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">Rare</p>
                      <div className="flex flex-wrap gap-2">
                        {ai.sideEffects.rare.map((s, i) => <Tag key={i} text={s} color="gray" />)}
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Warnings + Contraindications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ai.warnings?.length > 0 && (
                <Section title="Warnings" icon={<AlertTriangle size={16} className="text-white" />} color="#dc2626" isDark={isDark}>
                  <BulletList items={ai.warnings} color="#dc2626" isDark={isDark} />
                </Section>
              )}
              {ai.contraindications?.length > 0 && (
                <Section title="Do NOT Take If" icon={<Ban size={16} className="text-white" />} color="#b91c1c" isDark={isDark}>
                  <BulletList items={ai.contraindications} color="#b91c1c" isDark={isDark} />
                </Section>
              )}
              {ai.drugInteractions?.length > 0 && (
                <Section title="Drug Interactions" icon={<ShieldAlert size={16} className="text-white" />} color="#7c3aed" isDark={isDark}>
                  <BulletList items={ai.drugInteractions} color="#7c3aed" isDark={isDark} />
                </Section>
              )}
              {ai.foodInteractions?.length > 0 && (
                <Section title="Food & Drink to Avoid" icon={<Utensils size={16} className="text-white" />} color="#d97706" isDark={isDark}>
                  <BulletList items={ai.foodInteractions} color="#d97706" isDark={isDark} />
                </Section>
              )}
            </div>

            {/* Pregnancy + Breastfeeding */}
            {(ai.pregnancyCategory || ai.breastfeeding) && (
              <Section title="Pregnancy & Breastfeeding" icon={<Baby size={16} className="text-white" />} color="#db2777" isDark={isDark}>
                <div className="space-y-3">
                  {ai.pregnancyCategory && (
                    <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
                      <p className="text-xs font-bold text-pink-600 mb-1">PREGNANCY</p>
                      <p className="text-sm text-pink-800">{ai.pregnancyCategory}</p>
                    </div>
                  )}
                  {ai.breastfeeding && (
                    <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
                      <p className="text-xs font-bold text-pink-600 mb-1">BREASTFEEDING</p>
                      <p className="text-sm text-pink-800">{ai.breastfeeding}</p>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Storage + Overdose */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ai.storage && (
                <Section title="Storage" icon={<Package size={16} className="text-white" />} color="#0891b2" isDark={isDark}>
                  <p className="text-sm leading-relaxed" style={{ color: txt }}>{ai.storage}</p>
                </Section>
              )}
              {ai.overdoseInfo && (
                <Section title="Overdose Info" icon={<Heart size={16} className="text-white" />} color="#dc2626" isDark={isDark}>
                  <p className="text-sm leading-relaxed" style={{ color: txt }}>{ai.overdoseInfo}</p>
                </Section>
              )}
            </div>

            {/* AI Confidence Note */}
            {ai.confidenceNote && (
              <div style={{ backgroundColor: isDark ? "#1e293b" : "#eff6ff", borderColor: isDark ? "#334155" : "#bfdbfe" }}
                className="rounded-2xl border p-4 flex items-start gap-3">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-500 uppercase mb-1">AI Confidence Note</p>
                  <p className="text-sm" style={{ color: isDark ? "#93c5fd" : "#1e40af" }}>{ai.confidenceNote}</p>
                </div>
              </div>
            )}

            {/* DB match details if found */}
            {med?.aiExplanation && (
              <Section title="Verified DB Explanation" icon={<FlaskConical size={16} className="text-white" />} color="#16a34a" isDark={isDark}>
                <p className="text-sm leading-relaxed" style={{ color: txt }}>{med.aiExplanation}</p>
              </Section>
            )}

            {/* Raw OCR Toggle */}
            <div style={{ backgroundColor: card, borderColor: bdr }} className="rounded-2xl border overflow-hidden">
              <button onClick={() => setShowRaw(!showRaw)}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold transition"
                style={{ color: sub }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#334155" : "#f9fafb"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                <span className="flex items-center gap-2"><FileText size={15} /> Raw OCR Text</span>
                {showRaw ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showRaw && (
                <div className="px-5 pb-5 border-t" style={{ borderColor: bdr }}>
                  <pre style={{ color: isDark ? "#4ade80" : "#1e40af" }}
                    className="text-xs font-mono whitespace-pre-wrap leading-relaxed mt-4 max-h-48 overflow-y-auto">
                    {result.extractedText || "No text extracted"}
                  </pre>
                </div>
              )}
            </div>

            <button onClick={handleReset}
              className="w-full py-3 rounded-xl border-2 font-semibold transition text-sm"
              style={{ borderColor: bdr, color: sub }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#1e293b" : "#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
              Scan Another Medicine
            </button>

          </div>
        )}
      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const Section = ({ title, icon, color, isDark, children }) => (
  <div style={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e5e7eb" }}
    className="rounded-2xl border p-5">
    <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: isDark ? "#334155" : "#f3f4f6" }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: color }}>{icon}</div>
      <h2 className="font-bold text-sm uppercase tracking-wide" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>{title}</h2>
    </div>
    {children}
  </div>
);

const CHIP_COLORS = {
  blue:   { bg: "#eff6ff", border: "#bfdbfe", label: "#3b82f6", text: "#1e3a5f" },
  indigo: { bg: "#eef2ff", border: "#c7d2fe", label: "#6366f1", text: "#312e81" },
  purple: { bg: "#f5f3ff", border: "#ddd6fe", label: "#7c3aed", text: "#4c1d95" },
  green:  { bg: "#f0fdf4", border: "#bbf7d0", label: "#16a34a", text: "#14532d" },
  red:    { bg: "#fef2f2", border: "#fecaca", label: "#dc2626", text: "#7f1d1d" },
  gray:   { bg: "#f9fafb", border: "#e5e7eb", label: "#6b7280", text: "#111827" },
  orange: { bg: "#fff7ed", border: "#fed7aa", label: "#ea580c", text: "#7c2d12" },
};

const Chip = ({ label, value, isDark, accent = "blue", full }) => {
  if (!value) return null;
  const c = CHIP_COLORS[accent] || CHIP_COLORS.blue;
  return (
    <div style={isDark ? { backgroundColor: "#0f172a", borderColor: "#334155" } : { backgroundColor: c.bg, borderColor: c.border }}
      className={`rounded-xl border p-3 ${full ? "col-span-2" : ""}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: isDark ? "#60a5fa" : c.label }}>{label}</p>
      <p className="text-sm font-semibold leading-snug" style={{ color: isDark ? "#e2e8f0" : c.text }}>{value}</p>
    </div>
  );
};

const BulletList = ({ items, color, isDark }) => (
  <ul className="space-y-1.5">
    {items.map((item, i) => (
      <li key={i} className="text-xs pl-3 py-0.5 border-l-2 leading-relaxed"
        style={{ borderColor: color, color: isDark ? "#cbd5e1" : "#374151" }}>
        {item}
      </li>
    ))}
  </ul>
);

const TAG_COLORS = {
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  red:    "bg-red-100 text-red-700 border-red-200",
  gray:   "bg-gray-100 text-gray-600 border-gray-200",
};

const Tag = ({ text, color }) => (
  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${TAG_COLORS[color] || TAG_COLORS.gray}`}>
    {text}
  </span>
);

export default OcrScanner;