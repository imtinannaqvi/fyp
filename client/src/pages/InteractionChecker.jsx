import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  Zap, Plus, X, Loader, ShieldCheck,
  AlertTriangle, AlertOctagon, Info, ChevronDown, ChevronUp
} from "lucide-react";
import MediBot from "../components/MediBot";

const SEVERITY = {
  none:     { label: "No Interaction",  color: "text-green-700",  bg: "bg-green-50",   border: "border-green-200",  dot: "bg-green-500"  },
  mild:     { label: "Mild",            color: "text-yellow-700", bg: "bg-yellow-50",  border: "border-yellow-200", dot: "bg-yellow-500" },
  moderate: { label: "Moderate",        color: "text-orange-700", bg: "bg-orange-50",  border: "border-orange-200", dot: "bg-orange-500" },
  severe:   { label: "Severe",          color: "text-red-700",    bg: "bg-red-50",     border: "border-red-200",    dot: "bg-red-500"    },
};

const OVERALL = {
  safe:    { icon: <ShieldCheck size={22} />,    label: "All Safe",         bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700"  },
  warning: { icon: <AlertTriangle size={22} />,  label: "Caution Advised",  bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  danger:  { icon: <AlertOctagon size={22} />,   label: "Dangerous Combo",  bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700"    },
};

const COMMON = ["Panadol", "Aspirin", "Brufen", "Amoxicillin", "Flagyl", "Omeprazole", "Warfarin", "Metformin"];

const InteractionCard = ({ interaction }) => {
  const [open, setOpen] = useState(false);
  const sev = SEVERITY[interaction.severity] || SEVERITY.none;

  return (
    <div className={`rounded-lg border-2 ${sev.border} overflow-hidden transition-all shadow-sm hover:shadow-md`}>
      <button 
        onClick={() => setOpen(!open)} 
        className={`w-full flex items-center justify-between px-5 py-4 ${sev.bg} text-left transition`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${sev.dot}`} />
          <div>
            <p className="font-semibold text-gray-900">
              {interaction.medicine1} + {interaction.medicine2}
            </p>
            <span className={`text-xs font-semibold ${sev.color}`}>
              {sev.label} Severity
            </span>
          </div>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
      </button>

      {open && (
        <div className="p-5 bg-white border-t-2 border-gray-100">
          {interaction.severity !== "none" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-blue-600" />
                  <p className="text-xs font-bold text-blue-900 uppercase">Effect</p>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">{interaction.effect}</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} className="text-purple-600" />
                  <p className="text-xs font-bold text-purple-900 uppercase">Mechanism</p>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">{interaction.mechanism}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-green-700 bg-green-50 border border-green-200 p-4 rounded-lg">
               <ShieldCheck size={18} />
               <p className="text-sm font-medium">No significant interactions detected</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const InteractionChecker = () => {
  const [input, setInput] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const addMedicine = (name) => {
    const trimmed = name.trim();
    if (!trimmed || medicines.includes(trimmed)) return;
    if (medicines.length >= 5) {
        toast.error("Max 5 medicines allowed");
        return;
    }
    setMedicines([...medicines, trimmed]);
    setInput("");
    setResult(null);
  };

  const handleCheck = async () => {
    setLoading(true);
    try {
      const { data } = await API.post("/interaction/check", { medicines });
      setResult(data);
    } catch (err) {
      toast.error("Check failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const overall = result ? OVERALL[result.overall] || OVERALL.safe : null;

  return (
    <>
    <div className="min-h-screen bg-white">
      <main className="w-full max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Drug Interaction Checker</h1>
          <p className="text-gray-600">AI-powered safety analysis for your medications</p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Enter Your Medications</h2>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {medicines.map((m) => (
              <span key={m} className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm">
                {m}
                <button onClick={() => setMedicines(medicines.filter(x => x !== m))} className="hover:bg-blue-700 rounded-full p-1 transition">
                  <X size={14} />
                </button>
              </span>
            ))}
            {medicines.length === 0 && (
                <p className="text-sm text-gray-400">No medicines added yet</p>
            )}
          </div>

          <div className="flex gap-3 mb-6">
            <input
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addMedicine(input);
                }
              }}
              placeholder="Type medicine name and press Enter..."
              className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
            <button 
                onClick={() => addMedicine(input)} 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all font-medium flex items-center gap-2"
            >
              <Plus size={18} />
              Add
            </button>
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Select</p>
            <div className="flex flex-wrap gap-2">
                {COMMON.map(med => (
                    <button 
                        key={med}
                        disabled={medicines.includes(med)}
                        onClick={() => addMedicine(med)}
                        className={`text-sm px-4 py-2 rounded-lg border-2 transition-all ${
                          medicines.includes(med)
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600"
                        }`}
                    >
                        {med}
                    </button>
                ))}
            </div>
          </div>

          <button
            onClick={handleCheck}
            disabled={medicines.length < 2 || loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
                <><Loader className="animate-spin" size={20} /> Analyzing...</>
            ) : (
                <><Zap size={20} /> Check Interactions</>
            )}
          </button>
        </div>

        {result && (
          <div className="space-y-6">
             <div className={`border-2 ${overall.border} ${overall.bg} rounded-lg p-6 flex items-start gap-4`}>
                <div className={`${overall.text} shrink-0`}>
                    {overall.icon}
                </div>
                <div>
                  <h3 className={`font-semibold text-lg ${overall.text} mb-1`}>{overall.label}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{result.summary}</p>
                </div>
             </div>

             <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Interaction Details</h3>
                <div className="space-y-3">
                  {result.interactions.map((inter, i) => (
                      <InteractionCard key={i} interaction={inter} />
                  ))}
                </div>
             </div>

             <div className="bg-blue-600 text-white rounded-lg p-5 flex gap-4 items-start">
                <Info size={24} className="shrink-0" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2">Medical Disclaimer</p>
                  <p className="text-sm leading-relaxed opacity-95">
                    This analysis is provided for educational purposes only. Always consult with a doctor before making changes to your medical regimen.
                  </p>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
    <MediBot />
    </>
  );
};

export default InteractionChecker;