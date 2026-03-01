import { useState, useRef } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { ScanLine, Loader, CheckCircle, AlertTriangle, X, Image as ImageIcon, ShieldAlert, ShieldCheck } from "lucide-react";

const OcrScanner = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f?.type.startsWith("image/")) return toast.error("Please upload a valid image file");
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header section with responsive padding */}
      <header className="bg-white border-b px-4 py-8 md:py-12 text-center">
        <div className="max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-3xl mb-4 shadow-sm shadow-purple-100">
            <ScanLine size={32} className="text-purple-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Fake Medicine Detector</h1>
          <p className="text-gray-500 text-sm md:text-base mt-2 px-4">
            Verify the authenticity of your medicine by scanning the packaging labels and QR codes.
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 md:py-10 space-y-6">
        {/* Upload and Preview Area */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-4 md:p-6 transition-all">
          {!preview ? (
            <div 
              onClick={() => fileRef.current.click()}
              className="group border-2 border-dashed border-gray-200 rounded-2xl p-10 md:p-16 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all active:scale-[0.98]"
            >
              <div className="bg-gray-50 group-hover:bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                <ImageIcon size={32} className="text-gray-300 group-hover:text-purple-500" />
              </div>
              <p className="font-bold text-gray-700 md:text-lg">Tap to upload photo</p>
              <p className="text-xs text-gray-400 mt-1">Take a clear photo of the medicine box</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="relative rounded-2xl overflow-hidden border border-gray-100 bg-black shadow-inner">
                <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-64 md:h-80 object-contain mx-auto" 
                />
                <button 
                    onClick={() => {setPreview(null); setFile(null); setResult(null);}} 
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur hover:bg-white text-gray-900 rounded-full shadow-lg transition-transform active:scale-90"
                >
                    <X size={20}/>
                </button>
              </div>

              {!result && (
                <button 
                  onClick={handleScan} 
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-purple-200 transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <><Loader className="animate-spin" size={20} /> Processing Analysis...</>
                  ) : (
                    <><ScanLine size={22} /> Start Authenticity Scan</>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Scan Results Area */}
        {result && (
          <div className={`rounded-3xl p-6 md:p-8 border-2 animate-in slide-in-from-bottom-6 duration-500 shadow-xl ${
            result.isFake 
            ? "bg-red-50 border-red-200 shadow-red-100" 
            : "bg-emerald-50 border-emerald-200 shadow-emerald-100"
          }`}>
            <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
              <div className={`p-4 rounded-2xl bg-white shadow-sm shrink-0 ${result.isFake ? "text-red-500" : "text-emerald-500"}`}>
                {result.isFake ? <ShieldAlert size={40}/> : <ShieldCheck size={40}/>}
              </div>
              <div>
                <h2 className="font-black text-xl md:text-2xl text-gray-900">
                    {result.isFake ? "Suspicious Product Detected" : "Verification Successful"}
                </h2>
                <p className={`text-sm md:text-base font-medium mt-1 leading-relaxed ${result.isFake ? "text-red-700" : "text-emerald-700"}`}>
                    {result.message}
                </p>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
               <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-white shadow-sm">
                  <p className="text-[10px] uppercase text-gray-400 font-black tracking-widest mb-1">AI Confidence</p>
                  <p className="text-xl font-black text-gray-800">{result.confidence}%</p>
               </div>
               <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-white shadow-sm">
                  <p className="text-[10px] uppercase text-gray-500 font-black tracking-widest mb-1">Brand Name</p>
                  <p className="text-xl font-black text-gray-800 truncate">{result.detectedBrand || "Unknown"}</p>
               </div>
               <div className="hidden md:block bg-white/80 backdrop-blur p-4 rounded-2xl border border-white shadow-sm">
                  <p className="text-[10px] uppercase text-gray-500 font-black tracking-widest mb-1">Serial Check</p>
                  <p className="text-xl font-black text-gray-800">{result.serialStatus || "Passed"}</p>
               </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button 
                    onClick={() => {setPreview(null); setFile(null); setResult(null);}}
                    className="flex-1 bg-white/50 hover:bg-white text-gray-700 font-bold py-3 rounded-xl border border-gray-200 transition-all text-sm"
                >
                    Scan Another
                </button>
                {result.isFake && (
                    <button 
                        onClick={() => window.open('https://www.who.int/teams/regulation-prequalification/incidents-and-substandard/reporting', '_blank')}
                        className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-all text-sm flex items-center justify-center gap-2"
                    >
                        <AlertTriangle size={16} /> Report to Authorities
                    </button>
                )}
            </div>
          </div>
        )}
      </main>
      
      {/* Informational Footer */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex gap-4">
            <AlertTriangle className="text-amber-600 shrink-0" size={24} />
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
                <strong>Important:</strong> Visual verification is not a substitute for lab testing. This tool detects common discrepancies in packaging, serial numbers, and labels used by counterfeiters. If in doubt, consult your pharmacist.
            </p>
        </div>
      </div>
    </div>
  );
};

export default OcrScanner;