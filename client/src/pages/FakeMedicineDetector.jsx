import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  ShieldAlert, ShieldCheck, Upload, ScanLine, Loader,
  X, AlertTriangle, CheckCircle, XCircle, Camera,
  Info, Database, Pill, ArrowRight, RotateCcw,
  FileText, Package, Eye, Hash, Calendar
} from "lucide-react";
import MediBot from "../components/MediBot";

const FakeMedicineDetector = () => {
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep]             = useState("upload");
  const fileRef  = useRef();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const handleFile = (f) => {
    if (!f?.type.startsWith("image/")) { toast.error("Please upload a valid image file"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setStep("upload");
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    setStep("scanning");
    const formData = new FormData();
    formData.append("image", file);
    try {
      const { data } = await API.post("/ocr/fake-detect", formData);
      setResult(data);
      setStep("result");
    } catch (err) {
      toast.error(err.response?.data?.message || "Scan failed. Please try a clearer image.");
      setStep("upload");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setStep("upload");
  };

  const getVerdict = () => {
    if (!result) return null;
    if (result.verdict === "AUTHENTIC") return { type: "authentic", label: "✅ Packaging Appears Authentic",    color: "green"  };
    if (result.verdict === "FAKE")      return { type: "fake",      label: "🚨 Counterfeit Signs Detected",    color: "blue"   };
    return                                     { type: "suspicious", label: "⚠️ Suspicious — Verify Manually", color: "yellow" };
  };

  const verdict = getVerdict();

  const riskColor = {
    LOW:    "bg-green-100 text-green-700 border-green-200",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
    HIGH:   "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black">Fake Medicine Detector</h1>
              <p className="text-blue-200 text-sm">AI analyzes packaging for counterfeit signs</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6">
            {["Upload Image", "AI Scanning", "Verdict"].map((s, i) => {
              const stepKey  = ["upload", "scanning", "result"][i];
              const isActive = step === stepKey;
              const isDone   = (step === "scanning" && i === 0) || (step === "result" && i <= 1);
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive ? "bg-white text-blue-600" :
                    isDone   ? "bg-white/30 text-white" :
                               "bg-white/10 text-white/50"
                  }`}>
                    {isDone ? <CheckCircle size={12} /> : <span>{i + 1}</span>}
                    {s}
                  </div>
                  {i < 2 && <ArrowRight size={12} className="text-white/30" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Warning Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6 flex gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>Pakistan Alert:</strong> Our AI analyzes medicine packaging for spelling errors, missing DRAP registration, suspicious manufacturer names and other counterfeit indicators.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── LEFT: Upload ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                <p className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <Camera size={16} className="text-blue-600" /> Medicine Image
                </p>
              </div>

              {!preview ? (
                <div
                  onClick={() => fileRef.current.click()}
                  onDragEnter={handleDrag} onDragLeave={handleDrag}
                  onDragOver={handleDrag}  onDrop={handleDrop}
                  className={`p-8 text-center cursor-pointer transition-all ${
                    dragActive ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-slate-700"
                  }`}>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all ${
                    dragActive ? "bg-blue-100" : "bg-gray-100 dark:bg-slate-700"
                  }`}>
                    <Upload size={28} className={dragActive ? "text-blue-600" : "text-gray-400"} />
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">Upload Medicine Image</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">Drag & drop or click to browse</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">JPG, PNG, WEBP supported</p>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleFile(e.target.files[0])} />
                </div>
              ) : (
                <div className="relative">
                  <img src={preview} alt="Medicine" className="w-full h-56 object-contain bg-gray-50 dark:bg-slate-700" />
                  {!loading && (
                    <button onClick={handleReset}
                      className="absolute top-2 right-2 w-7 h-7 bg-white dark:bg-slate-800 rounded-full shadow flex items-center justify-center hover:bg-gray-100 transition">
                      <X size={14} className="text-gray-600 dark:text-slate-300" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {preview && !result && (
              <button onClick={handleScan} disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition flex items-center justify-center gap-3">
                {loading
                  ? <><Loader size={20} className="animate-spin" /> Analyzing Packaging...</>
                  : <><ShieldAlert size={20} /> Detect Fake Medicine</>}
              </button>
            )}

            {result && (
              <button onClick={handleReset}
                className="w-full bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold py-3 rounded-2xl border-2 border-gray-200 dark:border-slate-700 transition flex items-center justify-center gap-2">
                <RotateCcw size={16} /> Scan Another Medicine
              </button>
            )}

            {/* Tips */}
            <div className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">📸 Photo Tips</p>
              <ul className="space-y-2">
                {[
                  "Use good lighting — avoid shadows",
                  "Capture the full medicine label clearly",
                  "Include batch number and expiry date",
                  "Avoid blurry or angled shots",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-slate-400">
                    <CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── RIGHT: Results ───────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Loading */}
            {loading && (
              <div className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-10 text-center">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader size={36} className="animate-spin text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Analyzing for Fake Signs...</h3>
                <div className="space-y-2 text-left max-w-xs mx-auto">
                  {[
                    "Extracting text from packaging",
                    "Checking for spelling errors",
                    "Verifying DRAP registration",
                    "Analyzing manufacturer details",
                    "Checking for missing elements",
                    "Generating authenticity verdict",
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-500 dark:text-slate-400">
                      <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      </div>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty */}
            {!loading && !result && (
              <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-10 text-center">
                <ShieldAlert size={48} className="text-gray-200 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="font-bold text-gray-400 dark:text-slate-500 mb-2">AI Verdict Will Appear Here</h3>
                <p className="text-xs text-gray-400 dark:text-slate-600">Upload a medicine image and click "Detect Fake Medicine"</p>
              </div>
            )}

            {/* ── RESULTS ──────────────────────────────────────────────── */}
            {result && verdict && !loading && (
              <div className="space-y-4">

                {/* Main Verdict */}
                <div className={`border-2 rounded-2xl p-6 ${
                  verdict.type === "authentic"  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" :
                  verdict.type === "fake"       ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" :
                  "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                }`}>
                  <div className="flex items-start gap-4 mb-5">
                    <div className={`p-3 rounded-2xl shrink-0 ${
                      verdict.type === "authentic" ? "bg-green-100 dark:bg-green-900/40" :
                      verdict.type === "fake"      ? "bg-blue-100 dark:bg-blue-900/40" :
                      "bg-yellow-100 dark:bg-yellow-900/40"
                    }`}>
                      {verdict.type === "authentic"
                        ? <ShieldCheck size={32} className="text-green-600" />
                        : verdict.type === "fake"
                        ? <ShieldAlert size={32} className="text-blue-600" />
                        : <AlertTriangle size={32} className="text-yellow-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className={`text-xl font-black ${
                          verdict.type === "authentic" ? "text-green-800 dark:text-green-400" :
                          verdict.type === "fake"      ? "text-blue-800 dark:text-blue-400" :
                          "text-yellow-800 dark:text-yellow-400"
                        }`}>{verdict.label}</h2>
                        {result.overallRisk && (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${riskColor[result.overallRisk] || riskColor.MEDIUM}`}>
                            {result.overallRisk} RISK
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-slate-400">{result.message}</p>
                      {result.recommendation && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 italic">💡 {result.recommendation}</p>
                      )}
                    </div>
                  </div>

                  {/* Confidence bar */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3 mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs text-gray-500 dark:text-slate-400">AI Confidence Score</p>
                      <span className="text-sm font-black text-gray-900 dark:text-white">{result.confidenceScore}%</span>
                    </div>
                    <div className="bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full transition-all ${
                        verdict.type === "authentic" ? "bg-green-500" :
                        verdict.type === "fake"      ? "bg-blue-600" : "bg-yellow-500"
                      }`} style={{ width: `${result.confidenceScore}%` }} />
                    </div>
                  </div>

                  {/* Extracted packaging info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { icon: <Pill size={12} />,      label: "Medicine",  value: result.medicineName },
                      { icon: <Package size={12} />,   label: "Maker",     value: result.manufacturer },
                      { icon: <Hash size={12} />,      label: "Batch",     value: result.batchNumber },
                      { icon: <Calendar size={12} />,  label: "Expiry",    value: result.expiryDate },
                    ].map((item, i) => (
                      <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-2.5">
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 flex items-center gap-1 mb-0.5">
                          {item.icon} {item.label}
                        </p>
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {item.value || <span className="text-gray-300 dark:text-slate-600 font-normal">Not found</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fake Indicators */}
                {result.fakeIndicators?.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-5">
                    <h3 className="font-bold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2 text-sm">
                      <XCircle size={16} /> Counterfeit Indicators Found ({result.fakeIndicators.length})
                    </h3>
                    <ul className="space-y-2">
                      {result.fakeIndicators.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-slate-300 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2.5">
                          <XCircle size={14} className="text-blue-500 shrink-0 mt-0.5" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Authenticity Factors */}
                {result.authenticityFactors?.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 border-2 border-green-200 dark:border-green-800 rounded-2xl p-5">
                    <h3 className="font-bold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2 text-sm">
                      <CheckCircle size={16} /> Authenticity Factors ({result.authenticityFactors.length})
                    </h3>
                    <ul className="space-y-2">
                      {result.authenticityFactors.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-slate-300 bg-green-50 dark:bg-green-900/20 rounded-xl p-2.5">
                          <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Missing Elements + Spelling Errors */}
                {(result.missingElements?.length > 0 || result.spellingErrors?.length > 0) && (
                  <div className="bg-white dark:bg-slate-800 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl p-5">
                    <h3 className="font-bold text-yellow-700 dark:text-yellow-400 mb-3 flex items-center gap-2 text-sm">
                      <AlertTriangle size={16} /> Packaging Issues
                    </h3>
                    {result.missingElements?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">Missing Elements</p>
                        <div className="flex flex-wrap gap-2">
                          {result.missingElements.map((item, i) => (
                            <span key={i} className="text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 px-2.5 py-1 rounded-full">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.spellingErrors?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">Spelling Errors Found</p>
                        <div className="flex flex-wrap gap-2">
                          {result.spellingErrors.map((item, i) => (
                            <span key={i} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-full font-mono">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* DB Match */}
                {result.medicineDetails && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-5">
                    <h3 className="font-bold text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-2 text-sm">
                      <Database size={16} /> Found in Verified Database
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-slate-300 mb-3">
                      Matches <strong>{result.matchedWith}</strong> in our database.
                    </p>
                    <button onClick={() => navigate(`/search?q=${result.medicineDetails.name}`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm">
                      <Info size={15} /> View Full Medicine Details
                    </button>
                  </div>
                )}

                {/* Report button if fake */}
                {(verdict.type === "fake" || verdict.type === "suspicious") && (
                  <button onClick={() => navigate("/report-fake")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2">
                    <AlertTriangle size={18} /> Report This Medicine to Authorities
                  </button>
                )}

                {/* Extracted Text */}
                {result.extractedText && (
                  <div className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-5">
                    <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <FileText size={12} /> Raw Text Extracted from Image
                    </p>
                    <div className="bg-gray-900 rounded-xl p-4">
                      <p className="text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-wrap break-words">
                        {result.extractedText.slice(0, 400)}{result.extractedText.length > 400 ? "..." : ""}
                      </p>
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex gap-3">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    <strong>Important:</strong> This AI analysis is for educational purposes. Always consult a licensed pharmacist for final verification. Do not consume any medicine you suspect is fake.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    <MediBot />
    </>
  );
};

export default FakeMedicineDetector;