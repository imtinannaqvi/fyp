import { useState, useRef, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { ScanLine, Loader, CheckCircle, AlertTriangle, X, Image as ImageIcon, ShieldAlert, ShieldCheck } from "lucide-react";
import MediBot from "../components/MediBot";

const OcrScanner = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef();

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

  return (
    <>
    <div className="min-h-screen bg-white">
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Medicine Verification Scanner</h1>
          <p className="text-gray-600">Verify the authenticity of your medicine by scanning the packaging</p>
        </div>

        {/* Upload and Preview Area */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          {!preview ? (
            <div 
              onClick={() => fileRef.current.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                dragActive 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              }`}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ImageIcon size={32} className="text-gray-400" />
              </div>
              <p className="font-semibold text-gray-900 mb-1">Click or drag to upload image</p>
              <p className="text-sm text-gray-600">Take a clear photo of the medicine packaging</p>
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
                    onClick={() => {setPreview(null); setFile(null); setResult(null);}} 
                    className="absolute top-3 right-3 p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg shadow-md transition"
                >
                    <X size={20}/>
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
          <div className={`border-2 rounded-lg p-6 shadow-sm ${
            result.isFake 
            ? "bg-red-50 border-red-200" 
            : "bg-green-50 border-green-200"
          }`}>
            <div className="flex items-start gap-4 mb-6">
              <div className={`p-3 rounded-lg bg-white shrink-0 ${result.isFake ? "text-red-600" : "text-green-600"}`}>
                {result.isFake ? <ShieldAlert size={32}/> : <ShieldCheck size={32}/>}
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
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
               <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Confidence</p>
                  <p className="text-lg font-semibold text-gray-900">{result.confidence}%</p>
               </div>
               <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Brand</p>
                  <p className="text-lg font-semibold text-gray-900 truncate">{result.detectedBrand || "Unknown"}</p>
               </div>
               <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Serial</p>
                  <p className="text-lg font-semibold text-gray-900">{result.serialStatus || "Passed"}</p>
               </div>
            </div>

            <div className="flex gap-3">
                <button 
                    onClick={() => {setPreview(null); setFile(null); setResult(null);}}
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