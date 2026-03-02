import { useState, useRef, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { FileText, Loader, X, Image as ImageIcon, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import MediBot from "../components/MediBot";

const MedicineItem = ({ med, index }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white hover:border-gray-300 transition">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-semibold">
            {index + 1}
          </span>
          <p className="font-semibold text-gray-900">{med.name}</p>
        </div>
        {expanded ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
      </div>
      
      {expanded && (
        <div className="p-4 border-t-2 border-gray-100 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Dosage</p>
              <p className="text-sm text-gray-900">
                {med.details?.dosage || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Intended Use</p>
              <p className="text-sm text-gray-900">
                {med.details?.use || "General use"}
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
    <>
    <div className="min-h-screen bg-white">
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Prescription Scanner</h1>
          <p className="text-gray-600">Upload your prescription to extract medication information</p>
        </div>

        {!preview ? (
          <div 
            onClick={() => fileRef.current.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`bg-white border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
              dragActive 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
            }`}
          >
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ImageIcon size={32} className="text-gray-400" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">Click or drag to upload prescription</p>
            <p className="text-sm text-gray-600">Supports JPG, PNG (Max 5MB)</p>
            <input 
              ref={fileRef} 
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={(e) => {
                if (e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }} 
            />
          </div>
        ) : (
          <div className="space-y-4">
             <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                <img 
                  src={preview} 
                  alt="Prescription Preview" 
                  className="w-full h-96 object-contain" 
                />
                <button 
                  onClick={() => { setPreview(null); setFile(null); setResult(null); }} 
                  className="absolute top-3 right-3 bg-white hover:bg-gray-100 text-gray-700 p-2 rounded-lg shadow-md transition"
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
                   <><Sparkles size={20} /> Extract Information</>
                 )}
               </button>
             )}
          </div>
        )}

        {result?.medicines && (
          <div className="space-y-4 mt-6">
            <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                Detected Medications ({result.medicines.length})
              </h3>
              
              <div className="space-y-3">
                {result.medicines.map((m, i) => (
                  <MedicineItem key={i} index={i} med={m} />
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-5 flex gap-4">
              <p className="text-sm text-amber-800 leading-relaxed">
                <strong>Important:</strong> AI may misinterpret handwriting. Please verify these results against your original prescription.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
    <MediBot />
    </>
  );
};

export default PrescriptionScanner;