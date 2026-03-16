import { useState, useRef, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { ScanLine, Loader, AlertTriangle, X, Image as ImageIcon, ShieldAlert, ShieldCheck } from "lucide-react";
import MediBot from "../components/MediBot";
import { useTheme } from "../context/ThemeContext";

const OcrScanner = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef();

  const { isDark } = useTheme();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleFile = (f) => {
    if (!f?.type.startsWith("image/")) return toast.error("Please upload a valid image file");
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
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
      toast.error(err.response?.data?.message || "Verification scan failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setFile(null);
    setResult(null);
  };

  return (
    <>
    <div className="min-h-screen" style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff' }}>
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Medicine Verification Scanner</h1>
          <p className="text-gray-600">Verify the authenticity of your medicine by scanning the packaging</p>
        </div>

        {/* Upload and Preview Area */}
        <div style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e5e7eb' }} className="border-2 rounded-lg shadow-sm p-6 mb-6">
          {!preview ? (
            <div
              onClick={() => fileRef.current.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                backgroundColor: dragActive
                  ? (isDark ? '#1e3a5f' : '#eff6ff')
                  : (isDark ? '#0f172a' : '#ffffff'),
                borderColor: dragActive ? '#3b82f6' : (isDark ? '#475569' : '#d1d5db')
              }}
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all"
            >
              <div style={{ backgroundColor: isDark ? '#334155' : '#f3f4f6' }} className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ImageIcon size={32} style={{ color: isDark ? '#94a3b8' : '#9ca3af' }} />
              </div>
              <p style={{ color: isDark ? '#f1f5f9' : '#111827' }} className="font-semibold mb-1">Click or drag to upload image</p>
              <p style={{ color: isDark ? '#94a3b8' : '#4b5563' }} className="text-sm">Take a clear photo of the medicine packaging</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-96 object-contain mx-auto"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-3 right-3 p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg shadow-md transition"
                >
                  <X size={20} />
                </button>
              </div>

              {!result && (
                <button
                  onClick={handleScan}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader className="animate-spin" size={20} /> Analyzing...</>
                  ) : (
                    <><ScanLine size={20} /> Start Verification</>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Scan Results Area */}
        {result && (
          <div className={`border-2 rounded-lg p-6 shadow-sm mb-6 ${
            result.isFake
              ? "bg-red-50 border-red-200"
              : "bg-green-50 border-green-200"
          }`}>
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className={`p-3 rounded-lg bg-white shrink-0 ${result.isFake ? "text-red-600" : "text-green-600"}`}>
                {result.isFake ? <ShieldAlert size={32} /> : <ShieldCheck size={32} />}
              </div>
              <div>
                <h2 className="font-semibold text-xl text-gray-900 mb-1">
                  {result.isFake ? "Suspicious Product" : "Verified Authentic"}
                </h2>
                <p className={`text-sm ${result.isFake ? "text-red-700" : "text-green-700"}`}>
                  {result.message}
                </p>
              </div>
            </div>

            {/* ── FIX: Stats Grid — use correct backend field names ── */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold mb-1">Confidence</p>
                <p className="text-lg font-semibold text-gray-900">{result.confidence}%</p>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold mb-1">Matched With</p>
                {/* backend returns matchedWith, not detectedBrand */}
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {result.matchedWith || "No match found"}
                </p>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold mb-1">Match Score</p>
                {/* backend returns similarityScore (0-1), not serialStatus */}
                <p className="text-lg font-semibold text-gray-900">
                  {result.similarityScore != null
                    ? (result.similarityScore * 100).toFixed(0) + "%"
                    : "—"}
                </p>
              </div>
            </div>

            {/* ── FIX: Show extracted text from backend ── */}
            {result.extractedText && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Extracted Text from Image
                </p>
                <p className="text-sm text-gray-700 leading-relaxed font-mono whitespace-pre-wrap break-words">
                  {result.extractedText}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg border-2 border-gray-300 transition"
              >
                Scan Another
              </button>
              {result.isFake && (
                <button
                  onClick={() => window.open('https://www.who.int/teams/regulation-prequalification/incidents-and-substandard/reporting', '_blank')}
                  className="flex-1 bg-red-600 text-white font-medium py-3 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                >
                  <AlertTriangle size={16} /> Report
                </button>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-5 flex gap-4">
          <AlertTriangle className="text-amber-600 shrink-0" size={24} />
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>Important:</strong> This tool detects common discrepancies in packaging and labels. For complete verification, consult your pharmacist.
          </p>
        </div>
      </main>
    </div>
    <MediBot />
    </>
  );
};

export default OcrScanner;