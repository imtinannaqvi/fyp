import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { Plus, X, Stethoscope, Loader, AlertTriangle, ChevronRight, Info } from "lucide-react";
import MediBot from "../components/MediBot";

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
    <>
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Symptom Checker</h1>
          <p className="text-gray-600">AI-powered medicine suggestions based on your symptoms</p>
        </div>
        {/* Symptom Input Section */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Enter Your Symptoms</h2>

          {/* Input Area */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSymptom(input)}
              placeholder="Type a symptom and press Enter..."
              className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
            <button
              onClick={() => addSymptom(input)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-medium"
            >
              <Plus size={18} />
              Add
            </button>
          </div>

          {/* Common symptoms */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Select</p>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((s) => (
                <button
                  key={s}
                  onClick={() => addSymptom(s)}
                  disabled={symptoms.includes(s)}
                  className={`text-sm px-4 py-2 rounded-lg border-2 transition-all ${
                    symptoms.includes(s)
                      ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Active Chips */}
          {symptoms.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Selected Symptoms ({symptoms.length}/8):</p>
              <div className="flex flex-wrap gap-2">
                {symptoms.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg shadow-sm"
                  >
                    {s}
                    <button 
                      onClick={() => removeSymptom(s)} 
                      className="hover:bg-blue-700 p-1 rounded-full transition"
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
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader size={20} className="animate-spin" /> Analyzing...</>
            ) : (
              <><Stethoscope size={20} /> Get Recommendations</>
            )}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Condition Card */}
            <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Possible Condition</p>
                  <h3 className="text-xl font-semibold text-gray-900">{result.possibleCondition}</h3>
                </div>
                {severity && (
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${severity.color}`}>
                    {severity.label}
                  </span>
                )}
              </div>

              {result.whenToSeeDoctor && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex gap-3">
                  <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 leading-relaxed">{result.whenToSeeDoctor}</p>
                </div>
              )}
            </div>

            {/* Medicines List */}
            {result.suggestedMedicines?.length > 0 && (
              <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Suggested Medicines</h3>
                <div className="space-y-4">
                  {result.suggestedMedicines.map((med, i) => (
                    <div key={i} className="border-2 border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-all">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-semibold">
                            {i + 1}
                          </span>
                          <div>
                            <h4 className="font-semibold text-gray-900">{med.name}</h4>
                            {med.inDatabase && (
                              <span className="text-xs font-semibold text-blue-600">✓ Verified</span>
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
                          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                            <p className="text-xs font-semibold text-blue-600 mb-1">Dosage</p>
                            <p className="text-sm text-gray-900">{med.dosage}</p>
                          </div>
                        )}
                        {med.warning && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                            <p className="text-xs font-semibold text-amber-600 mb-1">Warning</p>
                            <p className="text-sm text-gray-900">{med.warning}</p>
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
              <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Self-Care Tips</h3>
                <div className="space-y-2">
                  {result.homeRemedies.map((remedy, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <span className="text-blue-600 font-bold mt-0.5">✓</span>
                      {remedy}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-blue-600 text-white rounded-lg p-5 flex gap-4">
              <Info size={24} className="shrink-0" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2">Medical Disclaimer</p>
                <p className="text-sm leading-relaxed opacity-95">{result.disclaimer}</p>
              </div>
            </div>

            <button
              onClick={() => { setResult(null); setSymptoms([]); window.scrollTo(0,0); }}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              Start New Assessment
            </button>
          </div>
        )}
      </div>
    </div>
    <MediBot />
    </>
  );
};

export default SymptomChecker;