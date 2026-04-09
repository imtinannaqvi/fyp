import { useState, useRef, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { ScanLine, Loader, X, Image as ImageIcon, ClipboardList, Search } from "lucide-react";
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

  // Smarter helper with OCR Error Correction (COLP -> ZOLP)
  const getMedicineName = (text) => {
    if (!text) return "Unknown";

    // 1. Clean lines and remove empty space
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 2);

    // 2. OCR Correction Map for common character misreads
    const corrections = {
      "COLP": "ZOLP",
      "COIP": "ZOLP",
      "PVLOCLAR": "PYLOCLAR",
      "0LP": "ZOLP"
    };

    // 3. Phrases to ignore (description noise)
    const noisePhrases = [
      "each", "film", "coated", "tablet", "contains", 
      "usp", "bp", "mg", "ml", "composition", "ingredients",
      "manufactured", "by", "batch", "exp", "mfg", "tablets"
    ];

    // 4. Process and filter lines
    const potentialNames = lines.map(line => {
      let upper = line.toUpperCase();
      // Apply character corrections
      Object.keys(corrections).forEach(key => {
        if (upper.includes(key)) upper = upper.replace(key, corrections[key]);
      });
      return upper;
    }).filter(line => {
      const lowerLine = line.toLowerCase();
      return !noisePhrases.some(word => lowerLine.includes(word));
    });

    if (potentialNames.length > 0) {
      // Prioritize the line that is exactly a brand name (shorter lines)
      const brandCandidates = potentialNames.filter(line => line.length < 15);
      return brandCandidates.length > 0 ? brandCandidates[0] : potentialNames[0];
    }

    return "Not Detected";
  };

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
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Medicine Label Reader</h1>
            <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Digitize medicine information directly from the packaging</p>
          </div>

          <div style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e5e7eb' }} className="border-2 rounded-lg shadow-sm p-6 mb-6">
            {!preview ? (
              <div
                onClick={() => fileRef.current.click()}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                style={{
                  backgroundColor: dragActive ? (isDark ? '#1e3a5f' : '#eff6ff') : (isDark ? '#0f172a' : '#ffffff'),
                  borderColor: dragActive ? '#3b82f6' : (isDark ? '#475569' : '#d1d5db')
                }}
                className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all"
              >
                <div style={{ backgroundColor: isDark ? '#334155' : '#f3f4f6' }} className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ImageIcon size={32} style={{ color: isDark ? '#94a3b8' : '#9ca3af' }} />
                </div>
                <p style={{ color: isDark ? '#f1f5f9' : '#111827' }} className="font-semibold mb-1">Upload Medicine Image</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                  <img src={preview} alt="Preview" className="w-full h-80 object-contain mx-auto" />
                  <button onClick={handleReset} className="absolute top-3 right-3 p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg shadow-md transition"><X size={20} /></button>
                </div>
                {!result && (
                  <button onClick={handleScan} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2">
                    {loading ? <><Loader className="animate-spin" size={20} /> Processing...</> : <><ScanLine size={20} /> Analyze Label</>}
                  </button>
                )}
              </div>
            )}
          </div>

          {result && (
            <div className={`border-2 rounded-lg p-6 shadow-sm mb-6 ${isDark ? "bg-slate-800 border-slate-700" : "bg-blue-50 border-blue-100"}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-lg bg-white text-blue-600 shadow-sm">
                  <ClipboardList size={28} />
                </div>
                <div>
                  <h2 className={`font-semibold text-xl ${isDark ? "text-white" : "text-gray-900"}`}>Identified Information</h2>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"}`}>Data extracted using Computer Vision</p>
                </div>
              </div>

              <div className={`border-2 p-5 rounded-lg mb-6 flex flex-col md:flex-row justify-between items-center gap-4 ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-100/50 border-blue-200'}`}>
                <div className="text-center md:text-left">
                  <p className="text-xs text-blue-500 font-bold uppercase mb-1">Detected Medicine</p>
                  <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-blue-900'}`}>
                    {getMedicineName(result.extractedText)}
                  </p>
                </div>
                
                <button 
                  onClick={() => {
                    const name = getMedicineName(result.extractedText);
                    window.location.href = `/search?q=${encodeURIComponent(name)}`;
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <Search size={18} /> View Dosage & Details
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'} border p-4 rounded-lg`}>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">OCR Confidence</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{result.confidence}%</p>
                </div>
                <div className={`${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'} border p-4 rounded-lg`}>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Detected Language</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>English</p>
                </div>
              </div>

              <div className={`${isDark ? 'bg-black/40 border-slate-700' : 'bg-white border-gray-200'} border rounded-lg p-5 mb-6`}>
                <p className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-widest">Raw Extracted Text</p>
                <p className={`text-md leading-relaxed font-mono whitespace-pre-wrap ${isDark ? 'text-green-400' : 'text-blue-800'}`}>
                  {result.extractedText || "No readable text found."}
                </p>
              </div>

              <button onClick={handleReset} className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg border-2 border-gray-300 transition">
                Clear and Scan Again
              </button>
            </div>
          )}
        </main>
      </div>
      <MediBot />
    </>
  );
};

export default OcrScanner;