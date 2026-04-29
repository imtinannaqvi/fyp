import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  ShieldAlert, ShieldCheck, Upload, ScanLine, Loader,
  X, AlertTriangle, CheckCircle, XCircle, Camera,
  Info, Database, Pill, ArrowRight, RotateCcw,
  FileText, Package, Hash, Calendar, ImageIcon
} from "lucide-react";
import MediBot from "../components/MediBot";
import { useTheme } from "../context/ThemeContext";

// ── Sub-components (same style as OcrScanner) ─────────────────────────────────

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
  green:  { bg: "#f0fdf4", border: "#bbf7d0", label: "#16a34a", text: "#14532d" },
  red:    { bg: "#fef2f2", border: "#fecaca", label: "#dc2626", text: "#7f1d1d" },
  yellow: { bg: "#fefce8", border: "#fde68a", label: "#ca8a04", text: "#713f12" },
  gray:   { bg: "#f9fafb", border: "#e5e7eb", label: "#6b7280", text: "#111827" },
  purple: { bg: "#f5f3ff", border: "#ddd6fe", label: "#7c3aed", text: "#4c1d95" },
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

// ── Main Component ─────────────────────────────────────────────────────────────
const FakeMedicineDetector = () => {
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep]             = useState("upload");
  const fileRef   = useRef();
  const navigate  = useNavigate();
  const { isDark } = useTheme();

  // Theme shortcuts (same as OcrScanner)
  const card = isDark ? "#1e293b" : "#ffffff";
  const bdr  = isDark ? "#334155" : "#e5e7eb";
  const txt  = isDark ? "#f1f5f9" : "#111827";
  const sub  = isDark ? "#94a3b8" : "#6b7280";
  const bg   = isDark ? "#0f172a" : "#f8fafc";

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const handleFile = (f) => {
    if (!f?.type.startsWith("image/")) { toast.error("Please upload a valid image file"); return; }
    setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); setStep("upload");
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleScan = async () => {
    if (!file) return;
    setLoading(true); setStep("scanning");
    const formData = new FormData();
    formData.append("image", file);
    try {
      const { data } = await API.post("/ocr/fake-detect", formData);
      setResult(data); setStep("result");
    } catch (err) {
      toast.error(err.response?.data?.message || "Scan failed. Please try a clearer image.");
      setStep("upload");
    } finally { setLoading(false); }
  };

  const handleReset = () => { setFile(null); setPreview(null); setResult(null); setStep("upload"); };

  const getVerdict = () => {
    if (!result) return null;
    if (result.verdict === "AUTHENTIC") return { type: "authentic", label: "✅ Packaging Appears Authentic", color: "#16a34a", bg: isDark ? "#14532d20" : "#f0fdf4", border: isDark ? "#15803d" : "#bbf7d0" };
    if (result.verdict === "FAKE")      return { type: "fake",      label: "🚨 Counterfeit Signs Detected", color: "#dc2626", bg: isDark ? "#7f1d1d20" : "#fef2f2", border: isDark ? "#b91c1c" : "#fecaca" };
    return                                     { type: "suspicious", label: "⚠️ Suspicious — Verify Manually", color: "#ca8a04", bg: isDark ? "#71391220" : "#fefce8", border: isDark ? "#b45309" : "#fde68a" };
  };

  const verdict = getVerdict();

  return (
    <>
    <div className="min-h-screen" style={{ backgroundColor: bg }}>
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-red-600 rounded-xl flex items-center justify-center shadow">
            <ShieldAlert size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: txt }}>Fake Medicine Detector</h1>
            <p className="text-sm" style={{ color: sub }}>AI analyzes packaging for counterfeit signs — spelling errors, missing DRAP, suspicious details</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-6">
          {["Upload Image", "AI Scanning", "Verdict"].map((s, i) => {
            const stepKey  = ["upload", "scanning", "result"][i];
            const isActive = step === stepKey;
            const isDone   = (step === "scanning" && i === 0) || (step === "result" && i <= 1);
            return (
              <div key={i} className="flex items-center gap-2">
                <div style={{
                  backgroundColor: isActive ? "#dc2626" : isDone ? "#16a34a" : (isDark ? "#1e293b" : "#f3f4f6"),
                  color: isActive || isDone ? "#ffffff" : sub,
                  border: `1px solid ${isActive ? "#dc2626" : isDone ? "#16a34a" : bdr}`
                }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all">
                  {isDone ? <CheckCircle size={12} /> : <span>{i + 1}</span>}
                  {s}
                </div>
                {i < 2 && <ArrowRight size={12} style={{ color: sub }} />}
              </div>
            );
          })}
        </div>

        {/* Warning Banner */}
        <div style={{ backgroundColor: isDark ? "#1e293b" : "#fefce8", borderColor: isDark ? "#854d0e" : "#fde68a" }}
          className="border rounded-2xl p-4 mb-6 flex gap-3">
          <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-sm" style={{ color: isDark ? "#fde68a" : "#92400e" }}>
            <strong>Pakistan Alert:</strong> Our AI checks for spelling errors, missing DRAP registration, suspicious manufacturer names and other counterfeit indicators.
          </p>
        </div>

        {/* Upload Area */}
        {!preview ? (
          <div onClick={() => fileRef.current.click()}
            onDragEnter={handleDrag} onDragLeave={handleDrag}
            onDragOver={handleDrag}  onDrop={handleDrop}
            style={{
              backgroundColor: dragActive ? (isDark ? "#1e3a5f" : "#fef2f2") : card,
              borderColor: dragActive ? "#dc2626" : bdr
            }}
            className="border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all mb-6">
            <div style={{ backgroundColor: isDark ? "#334155" : "#fef2f2" }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload size={36} style={{ color: dragActive ? "#dc2626" : sub }} />
            </div>
            <p className="font-bold text-lg mb-1" style={{ color: txt }}>Upload Medicine Image</p>
            <p className="text-sm mb-2" style={{ color: sub }}>Drag & drop or click to browse — JPG, PNG supported</p>
            <p className="text-xs" style={{ color: sub }}>Photo tips: good lighting, clear label, include batch & expiry</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div className="mb-6 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border-2" style={{ borderColor: bdr }}>
              <img src={preview} alt="Preview" className="w-full max-h-72 object-contain" style={{ backgroundColor: isDark ? "#1e293b" : "#f9fafb" }} />
              {!loading && (
                <button onClick={handleReset}
                  className="absolute top-3 right-3 p-2 rounded-xl shadow transition"
                  style={{ backgroundColor: card }}>
                  <X size={18} style={{ color: txt }} />
                </button>
              )}
            </div>
            {!result && (
              <button onClick={handleScan} disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl shadow transition flex items-center justify-center gap-2 text-base">
                {loading
                  ? <><Loader className="animate-spin" size={20} /> AI is analyzing for fake signs...</>
                  : <><ShieldAlert size={20} /> Detect Fake Medicine</>}
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ backgroundColor: card, borderColor: bdr }} className="rounded-2xl border p-10 text-center mb-6">
            <div style={{ backgroundColor: isDark ? "#1e293b" : "#fef2f2" }}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader size={36} className="animate-spin text-red-600" />
            </div>
            <h3 className="font-bold text-lg mb-4" style={{ color: txt }}>Analyzing for Fake Signs...</h3>
            <div className="space-y-2 text-left max-w-xs mx-auto">
              {["Extracting text from packaging","Checking for spelling errors","Verifying DRAP registration","Analyzing manufacturer details","Checking for missing elements","Generating authenticity verdict"].map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm" style={{ color: sub }}>
                  <div style={{ backgroundColor: isDark ? "#1e293b" : "#fef2f2" }}
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  </div>
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !result && preview === null && (
          <div style={{ backgroundColor: card, borderColor: bdr }}
            className="rounded-2xl border-2 border-dashed p-10 text-center">
            <ShieldAlert size={48} style={{ color: isDark ? "#334155" : "#e5e7eb" }} className="mx-auto mb-4" />
            <h3 className="font-bold mb-2" style={{ color: sub }}>AI Verdict Will Appear Here</h3>
            <p className="text-xs" style={{ color: sub }}>Upload a medicine image to start detection</p>
          </div>
        )}

        {/* Results */}
        {result && verdict && !loading && (
          <div className="space-y-4">

            {/* Verdict Banner */}
            <div style={{ backgroundColor: verdict.bg, borderColor: verdict.border }} className="rounded-2xl border-2 p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-2xl shrink-0" style={{ backgroundColor: isDark ? "#0f172a" : "#ffffff" }}>
                  {verdict.type === "authentic"
                    ? <ShieldCheck size={32} style={{ color: "#16a34a" }} />
                    : verdict.type === "fake"
                    ? <ShieldAlert size={32} style={{ color: "#dc2626" }} />
                    : <AlertTriangle size={32} style={{ color: "#ca8a04" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="text-xl font-black" style={{ color: verdict.color }}>{verdict.label}</h2>
                    {result.overallRisk && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
                        style={{
                          backgroundColor: result.overallRisk === "LOW" ? "#f0fdf4" : result.overallRisk === "HIGH" ? "#fef2f2" : "#fefce8",
                          color: result.overallRisk === "LOW" ? "#16a34a" : result.overallRisk === "HIGH" ? "#dc2626" : "#ca8a04",
                          borderColor: result.overallRisk === "LOW" ? "#bbf7d0" : result.overallRisk === "HIGH" ? "#fecaca" : "#fde68a",
                        }}>
                        {result.overallRisk} RISK
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: sub }}>{result.message}</p>
                  {result.recommendation && (
                    <p className="text-xs mt-2 italic" style={{ color: sub }}>💡 {result.recommendation}</p>
                  )}
                </div>
              </div>

              {/* Confidence Bar */}
              <div style={{ backgroundColor: isDark ? "#0f172a" : "#ffffff" }} className="rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs" style={{ color: sub }}>AI Confidence Score</p>
                  <span className="text-sm font-black" style={{ color: txt }}>{result.confidenceScore}%</span>
                </div>
                <div style={{ backgroundColor: isDark ? "#334155" : "#e5e7eb" }} className="rounded-full h-2.5">
                  <div className="h-2.5 rounded-full transition-all"
                    style={{ width: `${result.confidenceScore}%`, backgroundColor: verdict.color }} />
                </div>
              </div>

              {/* Packaging Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { icon: <Pill size={12} />,     label: "Medicine",  value: result.medicineName,  accent: "blue" },
                  { icon: <Package size={12} />,  label: "Maker",     value: result.manufacturer,  accent: "gray" },
                  { icon: <Hash size={12} />,     label: "Batch",     value: result.batchNumber,   accent: "purple" },
                  { icon: <Calendar size={12} />, label: "Expiry",    value: result.expiryDate,    accent: "red" },
                ].map((item, i) => (
                  <Chip key={i} label={item.label} value={item.value} isDark={isDark} accent={item.accent} />
                ))}
              </div>
            </div>

            {/* Fake Indicators */}
            {result.fakeIndicators?.length > 0 && (
              <Section title={`Counterfeit Indicators (${result.fakeIndicators.length})`}
                icon={<XCircle size={16} className="text-white" />} color="#dc2626" isDark={isDark}>
                <BulletList items={result.fakeIndicators} color="#dc2626" isDark={isDark} />
              </Section>
            )}

            {/* Authenticity Factors */}
            {result.authenticityFactors?.length > 0 && (
              <Section title={`Authenticity Factors (${result.authenticityFactors.length})`}
                icon={<CheckCircle size={16} className="text-white" />} color="#16a34a" isDark={isDark}>
                <BulletList items={result.authenticityFactors} color="#16a34a" isDark={isDark} />
              </Section>
            )}

            {/* Missing + Spelling */}
            {(result.missingElements?.length > 0 || result.spellingErrors?.length > 0) && (
              <Section title="Packaging Issues"
                icon={<AlertTriangle size={16} className="text-white" />} color="#ca8a04" isDark={isDark}>
                {result.missingElements?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-bold uppercase mb-2" style={{ color: sub }}>Missing Elements</p>
                    <div className="flex flex-wrap gap-2">
                      {result.missingElements.map((item, i) => (
                        <span key={i} style={{ backgroundColor: isDark ? "#1e293b" : "#fefce8", color: "#ca8a04", borderColor: "#fde68a" }}
                          className="text-xs px-2.5 py-1 rounded-full border font-medium">{item}</span>
                      ))}
                    </div>
                  </div>
                )}
                {result.spellingErrors?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase mb-2" style={{ color: sub }}>Spelling Errors</p>
                    <div className="flex flex-wrap gap-2">
                      {result.spellingErrors.map((item, i) => (
                        <span key={i} style={{ backgroundColor: isDark ? "#1e293b" : "#fef2f2", color: "#dc2626", borderColor: "#fecaca" }}
                          className="text-xs px-2.5 py-1 rounded-full border font-mono">{item}</span>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* DB Match */}
            {result.medicineDetails && (
              <Section title="Found in Verified Database"
                icon={<Database size={16} className="text-white" />} color="#2563eb" isDark={isDark}>
                <p className="text-sm mb-3" style={{ color: sub }}>
                  Matches <strong style={{ color: txt }}>{result.matchedWith}</strong> in our verified database.
                </p>
                <button onClick={() => navigate(`/search?q=${result.medicineDetails.name}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm">
                  <Info size={15} /> View Full Medicine Details
                </button>
              </Section>
            )}

            {/* Report Button */}
            {(verdict.type === "fake" || verdict.type === "suspicious") && (
              <button onClick={() => navigate("/report-fake")}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2">
                <AlertTriangle size={18} /> Report This Medicine to Authorities
              </button>
            )}

            {/* Extracted Text */}
            {result.extractedText && (
              <Section title="Raw Text Extracted from Image"
                icon={<FileText size={16} className="text-white" />} color="#475569" isDark={isDark}>
                <pre style={{ color: isDark ? "#4ade80" : "#1e40af" }}
                  className="text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                  {result.extractedText.slice(0, 400)}{result.extractedText.length > 400 ? "..." : ""}
                </pre>
              </Section>
            )}

            {/* Disclaimer */}
            <div style={{ backgroundColor: isDark ? "#1e293b" : "#fefce8", borderColor: isDark ? "#854d0e" : "#fde68a" }}
              className="rounded-2xl border p-4 flex gap-3">
              <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-xs" style={{ color: isDark ? "#fde68a" : "#92400e" }}>
                <strong>Important:</strong> This AI analysis is for educational purposes only. Always consult a licensed pharmacist for final verification.
              </p>
            </div>

            {/* Reset */}
            <button onClick={handleReset}
              className="w-full py-3 rounded-xl border-2 font-semibold transition text-sm"
              style={{ borderColor: bdr, color: sub, backgroundColor: "transparent" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#1e293b" : "#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
              Scan Another Medicine
            </button>
          </div>
        )}
      </div>
    </div>
    <MediBot />
    </>
  );
};

export default FakeMedicineDetector;