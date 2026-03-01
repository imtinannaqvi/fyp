import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { Plus, X, Stethoscope, Loader, AlertTriangle, ChevronRight, Info } from "lucide-react";

const severityConfig = {
  mild: { color: "bg-green-100 text-green-700 border-green-200", label: "Mild" },
  moderate: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Moderate" },
  severe: { color: "bg-red-100 text-red-700 border-red-200", label: "Severe" },
};

const commonSymptoms = [
  "Headache", "Fever", "Cough", "Sore throat", "Body pain",
  "Nausea", "Vomiting", "Diarrhea", "Stomach pain", "Dizziness",
  "Runny nose", "Chest pain", "Fatigue", "Back pain", "Joint pain",
];

const SymptomChecker = () => {
  const [input, setInput] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addSymptom = (s) => {
    const trimmed = s.trim();
    if (!trimmed) return;
    if (symptoms.includes(trimmed)) { toast.error("Already added"); return; }
    if (symptoms.length >= 8) { toast.error("Max 8 symptoms"); return; }
    setSymptoms([...symptoms, trimmed]);
    setInput("");
  };

  const removeSymptom = (s) => setSymptoms(symptoms.filter(x => x !== s));

  const handleCheck = async () => {
    if (symptoms.length === 0) { toast.error("Add at least one symptom"); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await API.post("/symptom/check", { symptoms });
      setResult(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to analyze symptoms");
    } finally {
      setLoading(false);
    }
  };

  const severity = result ? severityConfig[result.severity] || severityConfig.mild : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b px-4 py-6 md:py-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-emerald-100 rounded-2xl mb-4">
            <Stethoscope size={24} className="text-emerald-600 md:w-7 md:h-7" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Symptom Checker</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-2 max-w-sm mx-auto">
            Add your symptoms and get AI-powered medicine suggestions
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Symptom Input Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
          <h2 className="font-semibold text-gray-800 mb-4 text-sm md:text-base">Enter Your Symptoms</h2>

          {/* Input Area */}
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSymptom(input)}
              placeholder="Type a symptom..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <button
              onClick={() => addSymptom(input)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={18} />
              <span className="sm:hidden">Add Symptom</span>
            </button>
          </div>

          {/* Common symptoms list */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-3">Suggested:</p>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((s) => (
                <button
                  key={s}
                  onClick={() => addSymptom(s)}
                  disabled={symptoms.includes(s)}
                  className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                    symptoms.includes(s)
                      ? "bg-emerald-50 border-emerald-100 text-emerald-400 cursor-not-allowed"
                      : "bg-gray-50 border-gray-200 text-gray-600 active:scale-95 hover:border-emerald-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Active Chips */}
          {symptoms.length > 0 && (
            <div className="pt-4 border-t border-gray-50">
              <p className="text-xs font-medium text-gray-500 mb-3">Selected ({symptoms.length}/8):</p>
              <div className="flex flex-wrap gap-2">
                {symptoms.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-2 bg-emerald-600 text-white text-xs md:text-sm px-3 py-2 rounded-xl shadow-sm animate-in fade-in zoom-in duration-200"
                  >
                    {s}
                    <button 
                      onClick={() => removeSymptom(s)} 
                      className="hover:bg-emerald-500 p-0.5 rounded-full transition"
                      aria-label="Remove symptom"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleCheck}
            disabled={loading || symptoms.length === 0}
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:grayscale text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader size={20} className="animate-spin" /> Analyzing Symptoms...</>
            ) : (
              <><Stethoscope size={20} /> Get Recommendations</>
            )}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            {/* Condition Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">AI Analysis</p>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">{result.possibleCondition}</h3>
                </div>
                {severity && (
                  <span className={`inline-flex self-start sm:self-center text-xs font-bold px-3 py-1.5 rounded-full border ${severity.color}`}>
                    {severity.label} Severity
                  </span>
                )}
              </div>

              {result.whenToSeeDoctor && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
                  <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 leading-relaxed font-medium">{result.whenToSeeDoctor}</p>
                </div>
              )}
            </div>

            {/* Medicines List */}
            {result.suggestedMedicines?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                  Suggested Care
                </h3>
                <div className="space-y-4">
                  {result.suggestedMedicines.map((med, i) => (
                    <div key={i} className="border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-shadow bg-gray-50/30">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-sm">
                            {i + 1}
                          </span>
                          <div>
                            <h4 className="font-bold text-gray-800">{med.name}</h4>
                            {med.inDatabase && (
                                <span className="text-[10px] font-bold text-blue-600 uppercase">Verified in Database</span>
                            )}
                          </div>
                        </div>
                        {med.medicineId && (
                          <button
                            onClick={() => navigate(`/medicine/${med.medicineId}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <ChevronRight size={20} />
                          </button>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{med.reason}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {med.dosage && (
                          <div className="bg-blue-50/80 rounded-xl px-4 py-3">
                            <p className="text-[10px] uppercase font-bold text-blue-400 mb-1">Standard Dosage</p>
                            <p className="text-sm text-blue-900 font-semibold">{med.dosage}</p>
                          </div>
                        )}
                        {med.warning && (
                          <div className="bg-amber-50 rounded-xl px-4 py-3">
                            <p className="text-[10px] uppercase font-bold text-amber-500 mb-1">Safety Warning</p>
                            <p className="text-xs text-amber-900 leading-snug">{med.warning}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Home Remedies */}
            {result.homeRemedies?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
                <h3 className="font-bold text-gray-800 mb-4">Self-Care Steps</h3>
                <div className="grid grid-cols-1 gap-2">
                  {result.homeRemedies.map((remedy, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-gray-600 bg-emerald-50/30 p-3 rounded-xl border border-emerald-50">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      {remedy}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-blue-900 text-blue-50 rounded-2xl p-5 flex gap-4">
              <Info size={24} className="shrink-0 text-blue-300" />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Medical Disclaimer</p>
                <p className="text-xs leading-relaxed opacity-90">{result.disclaimer}</p>
              </div>
            </div>

            <button
              onClick={() => { setResult(null); setSymptoms([]); window.scrollTo(0,0); }}
              className="w-full bg-white border-2 border-gray-200 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-all mb-10"
            >
              Start New Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomChecker;