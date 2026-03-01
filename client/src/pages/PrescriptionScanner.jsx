import { useState, useRef } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { FileText, Loader, X, Image as ImageIcon, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

const MedicineItem = ({ med, index }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all hover:border-pink-200">
      <div 
        className="flex items-center justify-between p-4 sm:p-5 cursor-pointer select-none active:bg-gray-50" 
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 md:w-10 md:h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center text-sm md:text-base font-bold shrink-0">
            {index + 1}
          </span>
          <p className="font-bold text-gray-800 text-sm md:text-base">{med.name}</p>
        </div>
        <div className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
          <ChevronDown size={20} className="text-gray-400" />
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 sm:p-5 border-t border-gray-50 bg-pink-50/20 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Dosage</p>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                {med.details?.dosage || "Not specified by doctor"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Intended Use</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {med.details?.use || "General medicinal use"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PrescriptionScanner = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const { data } = await API.post("/prescription/scan", formData);
      setResult(data);
      toast.success("Prescription analyzed!");
    } catch (err) {
      toast.error("Analysis failed. Try a clearer photo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b px-4 py-8 md:py-12 text-center">
        <div className="max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-3xl mb-4 shadow-sm">
            <FileText size={32} className="text-pink-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Prescription Scanner</h1>
          <p className="text-gray-500 text-sm md:text-base mt-2 px-4">
            Upload your prescription to digitize medication names and dosages.
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 md:py-10 space-y-6">
        {!preview ? (
          <div 
            onClick={() => fileRef.current.click()} 
            className="group bg-white border-2 border-dashed border-gray-200 rounded-3xl p-10 md:p-16 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50/30 transition-all active:scale-[0.98]"
          >
            <div className="bg-pink-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <ImageIcon size={32} className="text-pink-300 group-hover:text-pink-500" />
            </div>
            <p className="text-gray-700 font-bold md:text-lg">Upload Prescription Image</p>
            <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG (Max 5MB)</p>
            <input 
              ref={fileRef} 
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={(e) => {
                if (e.target.files[0]) {
                  setFile(e.target.files[0]);
                  setPreview(URL.createObjectURL(e.target.files[0]));
                  setResult(null);
                }
              }} 
            />
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
             <div className="relative rounded-3xl overflow-hidden border-4 border-white bg-white shadow-xl shadow-gray-200">
                <img 
                  src={preview} 
                  alt="Prescription Preview" 
                  className="w-full max-h-72 md:max-h-96 object-contain rounded-2xl" 
                />
                <button 
                  onClick={() => { setPreview(null); setFile(null); setResult(null); }} 
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 p-2 rounded-full shadow-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <X size={20}/>
                </button>
             </div>
             
             {!result && (
               <button 
                 onClick={handleScan} 
                 disabled={loading} 
                 className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-300 text-white font-black py-4 rounded-2xl shadow-lg shadow-pink-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
               >
                 {loading ? (
                   <><Loader className="animate-spin" size={20} /> Analyzing Handwriting...</>
                 ) : (
                   <><Sparkles size={20} /> Extract Medicine Info</>
                 )}
               </button>
             )}
          </div>
        )}

        {result?.medicines && (
          <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-1">
                <h3 className="font-black text-gray-900 uppercase tracking-wider text-xs">
                  Detected Medications ({result.medicines.length})
                </h3>
                {loading && <Loader size={16} className="animate-spin text-pink-600" />}
            </div>
            
            <div className="space-y-3">
              {result.medicines.map((m, i) => (
                <MedicineItem key={i} index={i} med={m} />
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mt-6">
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                <strong>Medical Notice:</strong> AI can misinterpret handwriting. Please double-check these results against the original physical prescription before taking any medication.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PrescriptionScanner;