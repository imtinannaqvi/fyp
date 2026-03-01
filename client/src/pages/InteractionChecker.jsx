import { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  Zap, Plus, X, Loader, ShieldCheck,
  AlertTriangle, AlertOctagon, Info, ChevronDown, ChevronUp
} from "lucide-react";

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
    <div className={`rounded-2xl border ${sev.border} overflow-hidden transition-all duration-200 shadow-sm`}>
      <button 
        onClick={() => setOpen(!open)} 
        className={`w-full flex items-center justify-between px-4 py-4 ${sev.bg} text-left active:bg-opacity-70 transition-all`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${sev.dot} shrink-0 animate-pulse`} />
          <div>
            <p className="font-bold text-gray-900 text-sm md:text-base leading-tight">
              {interaction.medicine1} + {interaction.medicine2}
            </p>
            <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wide mt-1 ${sev.color}`}>
              {sev.label} Severity
            </p>
          </div>
        </div>
        {open ? <ChevronUp size={20} className="text-gray-400 shrink-0" /> : <ChevronDown size={20} className="text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="px-4 py-5 bg-white space-y-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
          {interaction.severity !== "none" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <span className="text-indigo-500"><Info size={12} /></span> The Effect
                </p>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">{interaction.effect}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Medical Mechanism</p>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">{interaction.mechanism}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-700 font-semibold bg-green-50 p-3 rounded-xl">
               <ShieldCheck size={18} />
               <p className="text-xs md:text-sm">No significant clinical interactions found.</p>
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <header className="w-full bg-white border-b px-4 py-6 md:py-10">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <Zap size={28} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">Interaction Checker</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">AI-powered safety analysis for your medications</p>
          </div>
        </div>
      </header>

      <main className="w-full max-w-3xl px-4 py-6 space-y-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-5 md:p-8">
          <h2 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Your Prescription</h2>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {medicines.map((m) => (
              <span key={m} className="flex items-center gap-2 bg-indigo-600 text-white text-[11px] md:text-sm font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-xl shadow-md animate-in zoom-in-50">
                {m}
                <button onClick={() => setMedicines(medicines.filter(x => x !== m))} className="hover:bg-indigo-400 rounded-full p-0.5 transition-colors">
                  <X size={14} />
                </button>
              </span>
            ))}
            {medicines.length === 0 && (
                <p className="text-sm text-gray-400 italic">No medicines added yet...</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMedicine(input)}
              placeholder="e.g. Aspirin"
              className="flex-1 border-2 border-gray-100 bg-gray-50 rounded-2xl px-5 py-3 md:py-4 text-sm md:text-base focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all"
            />
            <button 
                onClick={() => addMedicine(input)} 
                className="bg-slate-800 text-white px-8 py-3 md:py-4 rounded-2xl font-bold hover:bg-slate-900 active:scale-95 transition-all shadow-lg shadow-slate-200"
            >
              Add
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-50">
            <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Quick Add Suggestions:</p>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
                {COMMON.map(med => (
                    <button 
                        key={med}
                        disabled={medicines.includes(med)}
                        onClick={() => addMedicine(med)}
                        className="text-[10px] md:text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-30 transition-all"
                    >
                        {med}
                    </button>
                ))}
            </div>
          </div>

          <button
            onClick={handleCheck}
            disabled={medicines.length < 2 || loading}
            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm md:text-base"
          >
            {loading ? (
                <><Loader className="animate-spin" size={20} /> Analyzing Profiles...</>
            ) : (
                <>Check {medicines.length} Medications</>
            )}
          </button>
        </div>

        {result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500 pb-10">
             <div className={`rounded-3xl border-2 ${overall.border} ${overall.bg} p-5 md:p-7 flex flex-col md:flex-row items-start md:items-center gap-5`}>
                <div className={`${overall.text} p-4 bg-white rounded-2xl shadow-sm border border-white/50 shrink-0`}>
                    {overall.icon}
                </div>
                <div className="space-y-1">
                  <h3 className={`font-black text-lg md:text-2xl ${overall.text}`}>{overall.label}</h3>
                  <p className="text-gray-700 text-xs md:text-sm leading-relaxed">{result.summary}</p>
                </div>
             </div>

             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pt-4 px-2 text-center md:text-left">Detailed Interaction Report</h4>
             
             <div className="space-y-3">
                {result.interactions.map((inter, i) => (
                    <InteractionCard key={i} interaction={inter} />
                ))}
             </div>

             <div className="bg-slate-900 text-white rounded-2xl p-5 md:p-6 mt-8 flex gap-3 md:gap-4 items-start">
                <Info size={24} className="text-indigo-300 shrink-0" />
                <p className="text-[10px] md:text-sm leading-relaxed opacity-90 italic">
                    <strong>Disclaimer:</strong> This analysis is provided for educational purposes only. Always consult with a doctor before making changes to your medical regimen.
                </p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InteractionChecker;