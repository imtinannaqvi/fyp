import { useState, useRef, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  ScanLine, Loader, X, Image as ImageIcon, Search,
  CheckCircle, AlertTriangle, Pill, ShieldAlert, Zap,
  Clock, Utensils, Baby, Ban, ChevronDown, ChevronUp, FileText
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const OcrScanner = () => {
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showRaw, setShowRaw]     = useState(false);
  const fileRef = useRef();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const handleFile = (f) => {
    if (!f?.type.startsWith("image/")) return toast.error("Please upload a valid image file");
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const { data } = await API.post("/ocr/upload", formData);
      setResult(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Scanner service unavailable");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setPreview(null); setFile(null); setResult(null); setShowRaw(false); };

  const med = result?.medicineDetails;

  return (
    <div className="min-h-screen" style={{ backgroundColor: isDark ? "#0f172a" : "#f8fafc" }}>
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow">
              <ScanLine size={22} className="text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Medicine Label Scanner</h1>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>Upload a medicine image to extract and verify full details</p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        {!preview ? (
          <div
            onClick={() => fileRef.current.click()}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            style={{
              backgroundColor: dragActive ? (isDark ? "#1e3a5f" : "#eff6ff") : (isDark ? "#1e293b" : "#ffffff"),
              borderColor: dragActive ? "#3b82f6" : (isDark ? "#334155" : "#d1d5db")
            }}
            className="border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all mb-6"
          >
            <div style={{ backgroundColor: isDark ? "#334155" : "#f1f5f9" }} className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ImageIcon size={36} style={{ color: isDark ? "#94a3b8" : "#94a3b8" }} />
            </div>
            <p style={{ color: isDark ? "#f1f5f9" : "#111827" }} className="font-bold text-lg mb-1">Drop medicine image here</p>
            <p style={{ color: isDark ? "#64748b" : "#9ca3af" }} className="text-sm">or click to browse — JPG, PNG supported</p>
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
                {loading ? <><Loader className="animate-spin" size={20} /> Analyzing Label...</> : <><ScanLine size={20} /> Scan & Analyze</>}
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">

            {/* Verification Status Banner */}
            <div className={`rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap ${
              result.isFake
                ? "bg-red-50 border-2 border-red-200"
                : "bg-green-50 border-2 border-green-200"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${result.isFake ? "bg-red-100" : "bg-green-100"}`}>
                  {result.isFake
                    ? <AlertTriangle size={24} className="text-red-600" />
                    : <CheckCircle size={24} className="text-green-600" />}
                </div>
                <div>
                  <p className={`font-bold text-lg ${result.isFake ? "text-red-700" : "text-green-700"}`}>
                    {result.isFake ? "⚠️ Not Verified" : "✅ Verified Medicine"}
                  </p>
                  <p className={`text-sm ${result.isFake ? "text-red-500" : "text-green-600"}`}>
                    {result.isFake
                      ? "Could not match this medicine in our database"
                      : `Matched: ${result.matchedWith}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Confidence</p>
                  <p className={`text-2xl font-black ${result.isFake ? "text-red-600" : "text-green-600"}`}>{result.confidence}%</p>
                </div>
                <button
                  onClick={() => navigate(`/search?q=${encodeURIComponent(result.medicineName || result.matchedWith || "")}`)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition shadow"
                >
                  <Search size={15} /> Search DB
                </button>
              </div>
            </div>

            {/* Full Medicine Details — only if matched */}
            {med ? (
              <div className="space-y-4">

                {/* Medicine Identity */}
                <div style={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e5e7eb" }}
                  className="rounded-2xl border p-5">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <Pill size={18} className="text-blue-600" />
                    <h2 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>Medicine Identity</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Name",     value: med.name },
                      { label: "Brand",    value: med.brand },
                      { label: "Generic",  value: med.generic || "N/A" },
                      { label: "Category", value: med.category || "N/A" },
                    ].map((item, i) => (
                      <div key={i} style={{ backgroundColor: isDark ? "#0f172a" : "#f8fafc", borderColor: isDark ? "#334155" : "#e5e7eb" }}
                        className="rounded-xl border p-3">
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-1">{item.label}</p>
                        <p style={{ color: isDark ? "#e2e8f0" : "#111827" }} className="text-sm font-semibold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  {med.description && (
                    <p style={{ color: isDark ? "#94a3b8" : "#6b7280" }} className="text-sm mt-4 leading-relaxed">{med.description}</p>
                  )}
                </div>

                {/* Dosage Guide */}
                {(med.dosage || med.dosageGuide?.adult) && (
                  <div style={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e5e7eb" }}
                    className="rounded-2xl border p-5">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                      <Clock size={18} className="text-indigo-600" />
                      <h2 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>Dosage Guide</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {med.dosage && <InfoChip label="Standard Dosage" value={med.dosage} color="indigo" isDark={isDark} />}
                      {med.dosageGuide?.adult   && <InfoChip label="Adult"   value={med.dosageGuide.adult}   color="indigo" isDark={isDark} />}
                      {med.dosageGuide?.child   && <InfoChip label="Child"   value={med.dosageGuide.child}   color="indigo" isDark={isDark} />}
                      {med.dosageGuide?.elderly && <InfoChip label="Elderly" value={med.dosageGuide.elderly} color="indigo" isDark={isDark} />}
                      {med.dosageGuide?.notes   && <InfoChip label="Notes"   value={med.dosageGuide.notes}   color="indigo" isDark={isDark} full />}
                    </div>
                  </div>
                )}

                {/* Clinical Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ListSection title="Side Effects"      icon={<Zap size={16} />}         color="orange" items={med.sideEffects}       isDark={isDark} />
                  <ListSection title="Warnings"          icon={<AlertTriangle size={16} />} color="red"    items={med.warnings}          isDark={isDark} />
                  <ListSection title="Contraindications" icon={<Ban size={16} />}           color="red"    items={med.contraindications}  isDark={isDark} />
                  <ListSection title="Food Interactions" icon={<Utensils size={16} />}      color="yellow" items={med.foodInteractions}   isDark={isDark} />
                  <ListSection title="Drug Interactions" icon={<ShieldAlert size={16} />}   color="purple" items={med.drugInteractions}   isDark={isDark} />
                  <ListSection title="Long Term Effects" icon={<Clock size={16} />}         color="gray"   items={med.longTermEffects}    isDark={isDark} />
                </div>

                {/* Pregnancy / Breastfeeding */}
                {(med.pregnancyWarning || med.breastfeedingWarning) && (
                  <div style={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e5e7eb" }}
                    className="rounded-2xl border p-5">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                      <Baby size={18} className="text-pink-500" />
                      <h2 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>Pregnancy & Breastfeeding</h2>
                    </div>
                    <div className="space-y-3">
                      {med.pregnancyWarning && (
                        <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
                          <p className="text-xs font-bold text-pink-600 mb-1">PREGNANCY</p>
                          <p className="text-sm text-pink-800">{med.pregnancyWarning}</p>
                        </div>
                      )}
                      {med.breastfeedingWarning && (
                        <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
                          <p className="text-xs font-bold text-pink-600 mb-1">BREASTFEEDING</p>
                          <p className="text-sm text-pink-800">{med.breastfeedingWarning}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Explanation */}
                {med.aiExplanation && (
                  <div style={{ backgroundColor: isDark ? "#1e293b" : "#eff6ff", borderColor: isDark ? "#334155" : "#bfdbfe" }}
                    className="rounded-2xl border p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Zap size={14} className="text-white" />
                      </div>
                      <h2 className={`font-bold text-base ${isDark ? "text-white" : "text-blue-900"}`}>AI Explanation</h2>
                    </div>
                    <p style={{ color: isDark ? "#93c5fd" : "#1e40af" }} className="text-sm leading-relaxed">{med.aiExplanation}</p>
                  </div>
                )}

                {/* Flags */}
                <div className="flex flex-wrap gap-3">
                  {med.requiresPrescription && (
                    <span className="flex items-center gap-1.5 bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-full text-xs font-bold">
                      <ShieldAlert size={13} /> Prescription Required
                    </span>
                  )}
                  {med.isCommonlyMisused && (
                    <span className="flex items-center gap-1.5 bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-full text-xs font-bold">
                      <AlertTriangle size={13} /> Commonly Misused
                    </span>
                  )}
                  {med.safeAlternatives?.length > 0 && (
                    <span className="flex items-center gap-1.5 bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-full text-xs font-bold">
                      <CheckCircle size={13} /> Alternatives: {med.safeAlternatives.join(", ")}
                    </span>
                  )}
                </div>

              </div>
            ) : (
              /* No DB match — show AI parsed label info */
              <div className="space-y-4">

                {/* AI Parsed Info from box */}
                {result.parsedLabelInfo ? (
                  <div style={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e5e7eb" }}
                    className="rounded-2xl border p-5">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                      <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
                        <FileText size={16} className="text-white" />
                      </div>
                      <div>
                        <h2 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>Info Extracted from Label</h2>
                        <p className="text-xs text-orange-500 font-semibold">Read directly from the medicine box image</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.parsedLabelInfo.medicineName && (
                        <LabelField label="Medicine Name"  value={result.parsedLabelInfo.medicineName} accent="blue"   isDark={isDark} />
                      )}
                      {result.parsedLabelInfo.genericName && (
                        <LabelField label="Generic Name"   value={result.parsedLabelInfo.genericName}  accent="indigo" isDark={isDark} />
                      )}
                      {result.parsedLabelInfo.company && (
                        <LabelField label="Company"        value={result.parsedLabelInfo.company}      accent="gray"   isDark={isDark} />
                      )}
                      {result.parsedLabelInfo.strength && (
                        <LabelField label="Strength / MG"  value={result.parsedLabelInfo.strength}     accent="purple" isDark={isDark} />
                      )}
                      {result.parsedLabelInfo.dosage && (
                        <LabelField label="Dosage"         value={result.parsedLabelInfo.dosage}       accent="indigo" isDark={isDark} />
                      )}
                      {result.parsedLabelInfo.expiry && (
                        <LabelField label="Expiry Date"    value={result.parsedLabelInfo.expiry}       accent="red"    isDark={isDark} />
                      )}
                      {result.parsedLabelInfo.batchNo && (
                        <LabelField label="Batch No"       value={result.parsedLabelInfo.batchNo}      accent="gray"   isDark={isDark} />
                      )}
                      {result.parsedLabelInfo.usedFor && (
                        <LabelField label="Used For"       value={result.parsedLabelInfo.usedFor}      accent="green"  isDark={isDark} full />
                      )}
                      {result.parsedLabelInfo.warnings && (
                        <LabelField label="Warnings"       value={result.parsedLabelInfo.warnings}     accent="red"    isDark={isDark} full />
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ backgroundColor: isDark ? "#1e293b" : "#fff7ed", borderColor: isDark ? "#334155" : "#fed7aa" }}
                    className="rounded-2xl border p-5">
                    <p className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-orange-700"}`}>
                      Could not extract structured info from this image. Try a clearer photo.
                    </p>
                  </div>
                )}

                {/* Not in DB Warning */}
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                    <AlertTriangle size={20} className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-bold text-red-700 mb-1">Not Found in Our Database</p>
                    <p className="text-sm text-red-600">
                      This medicine is not registered in our local database. It may be a new, imported, or unverified medicine.
                      Please consult a pharmacist or doctor before use.
                    </p>
                    <button
                      onClick={() => navigate(`/search?q=${encodeURIComponent(result.parsedLabelInfo?.medicineName || result.medicineName || "")}`)}
                      className="mt-3 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
                    >
                      <Search size={13} /> Try Searching Manually
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* Raw OCR Text Toggle */}
            <div style={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e5e7eb" }}
              className="rounded-2xl border overflow-hidden">
              <button
                onClick={() => setShowRaw(!showRaw)}
                className={`w-full flex items-center justify-between px-5 py-4 text-sm font-semibold transition ${isDark ? "text-slate-300 hover:bg-slate-700" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <span className="flex items-center gap-2"><FileText size={15} /> Raw Extracted Text</span>
                {showRaw ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showRaw && (
                <div className={`px-5 pb-5 border-t ${isDark ? "border-slate-700" : "border-gray-100"}`}>
                  <pre style={{ color: isDark ? "#4ade80" : "#1e40af" }}
                    className="text-xs font-mono whitespace-pre-wrap leading-relaxed mt-4 max-h-48 overflow-y-auto">
                    {result.extractedText || "No text extracted"}
                  </pre>
                </div>
              )}
            </div>

            {/* Scan Again */}
            <button onClick={handleReset}
              className={`w-full py-3 rounded-xl border-2 font-semibold transition text-sm ${isDark ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
              Scan Another Medicine
            </button>

          </div>
        )}
      </div>
    </div>
  );
};

// ── Reusable sub-components ───────────────────────────────────────────────────

const COLOR_MAP = {
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", label: "text-indigo-600", text: "text-indigo-800", hdr: "bg-indigo-600" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", label: "text-orange-600", text: "text-orange-800", hdr: "bg-orange-500" },
  red:    { bg: "bg-red-50",    border: "border-red-200",    label: "text-red-600",    text: "text-red-800",    hdr: "bg-red-600"    },
  yellow: { bg: "bg-yellow-50", border: "border-yellow-200", label: "text-yellow-700", text: "text-yellow-800", hdr: "bg-yellow-500" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", label: "text-purple-600", text: "text-purple-800", hdr: "bg-purple-600" },
  gray:   { bg: "bg-gray-50",   border: "border-gray-200",   label: "text-gray-600",   text: "text-gray-800",   hdr: "bg-gray-500"   },
};

const InfoChip = ({ label, value, color, isDark, full }) => {
  const c = COLOR_MAP[color];
  return (
    <div style={isDark ? { backgroundColor: "#0f172a", borderColor: "#334155" } : {}}
      className={`${isDark ? "border" : `${c.bg} border ${c.border}`} rounded-xl p-3 ${full ? "col-span-2" : ""}`}>
      <p className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${isDark ? "text-blue-400" : c.label}`}>{label}</p>
      <p className={`text-sm font-semibold ${isDark ? "text-slate-200" : c.text}`}>{value}</p>
    </div>
  );
};

const ListSection = ({ title, icon, color, items, isDark }) => {
  if (!items?.length) return null;
  const c = COLOR_MAP[color];
  return (
    <div style={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e5e7eb" }}
      className="rounded-2xl border p-4">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
        <div className={`w-7 h-7 ${c.hdr} text-white flex items-center justify-center rounded-lg`}>{icon}</div>
        <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h3>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className={`text-xs pl-3 border-l-2 border-blue-200 py-0.5 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

const ACCENT_MAP = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   label: "text-blue-500",   text: "text-blue-900"   },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", label: "text-indigo-500", text: "text-indigo-900" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", label: "text-purple-500", text: "text-purple-900" },
  green:  { bg: "bg-green-50",  border: "border-green-200",  label: "text-green-600",  text: "text-green-900"  },
  red:    { bg: "bg-red-50",    border: "border-red-200",    label: "text-red-500",    text: "text-red-900"    },
  gray:   { bg: "bg-gray-50",   border: "border-gray-200",   label: "text-gray-500",   text: "text-gray-900"   },
};

const LabelField = ({ label, value, accent, isDark, full }) => {
  const a = ACCENT_MAP[accent] || ACCENT_MAP.gray;
  return (
    <div
      style={isDark ? { backgroundColor: "#0f172a", borderColor: "#334155" } : {}}
      className={`${isDark ? "border" : `${a.bg} border ${a.border}`} rounded-xl p-3.5 ${full ? "col-span-2" : ""}`}
    >
      <p className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${isDark ? "text-blue-400" : a.label}`}>{label}</p>
      <p className={`text-sm font-semibold leading-snug ${isDark ? "text-slate-200" : a.text}`}>{value}</p>
    </div>
  );
};

export default OcrScanner;
