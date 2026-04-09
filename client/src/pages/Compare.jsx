import { useState, useRef } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  Search, X, Loader, ChevronDown, ChevronUp,
  CheckCircle, XCircle, AlertTriangle, Pill,
  Utensils, Clock, Shield, Zap, Info
} from "lucide-react";
import MediBot from "../components/MediBot";

const SECTIONS = [
  { key: "basic",        label: "Basic Info" },
  { key: "dosage",       label: "Dosage" },
  { key: "sideEffects",  label: "Side Effects" },
  { key: "safety",       label: "Safety" },
  { key: "interactions", label: "Interactions" },
  { key: "food",         label: "Food & Pregnancy" },
];

// ── Comparison row component ──────────────────────────────────────────────────
const Row = ({ label, val1, val2, type = "text" }) => {
  const isEmpty = (v) => !v || (Array.isArray(v) && v.length === 0);

  const renderVal = (val) => {
    if (isEmpty(val)) return <span className="text-gray-300 text-sm italic">—</span>;

    if (type === "bool") return val
      ? <span className="flex items-center gap-1 text-red-600 text-sm font-semibold"><AlertTriangle size={14} /> Yes</span>
      : <span className="flex items-center gap-1 text-green-600 text-sm font-semibold"><CheckCircle size={14} /> No</span>;

    if (type === "prescription") return val
      ? <span className="flex items-center gap-1 text-blue-600 text-sm font-semibold"><Shield size={14} /> Required</span>
      : <span className="flex items-center gap-1 text-green-600 text-sm font-semibold"><CheckCircle size={14} /> OTC</span>;

    if (Array.isArray(val)) return (
      <ul className="space-y-1">
        {val.slice(0, 5).map((item, i) => (
          <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
            <span className="text-blue-400 mt-1 shrink-0">•</span> {item}
          </li>
        ))}
        {val.length > 5 && <li className="text-xs text-gray-400">+{val.length - 5} more</li>}
      </ul>
    );

    return <p className="text-sm text-gray-700 leading-relaxed">{val}</p>;
  };

  // Highlight differences
  const isDiff = () => {
    if (type === "bool" || type === "prescription") return val1 !== val2;
    if (Array.isArray(val1) && Array.isArray(val2)) return val1.length !== val2.length;
    return String(val1 || "") !== String(val2 || "");
  };

  return (
    <tr className={`border-b border-gray-100 ${isDiff() ? "bg-yellow-50/40" : ""}`}>
      <td className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide w-1/4 bg-gray-50 border-r border-gray-100">
        {label}
        {isDiff() && !isEmpty(val1) && !isEmpty(val2) && (
          <span className="ml-1.5 text-[10px] bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full font-bold">DIFF</span>
        )}
      </td>
      <td className="px-4 py-3 w-[37.5%] border-r border-gray-100">{renderVal(val1)}</td>
      <td className="px-4 py-3 w-[37.5%]">{renderVal(val2)}</td>
    </tr>
  );
};

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition text-left">
        <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
          {icon} {title}
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full">{children}</table>
        </div>
      )}
    </div>
  );
};

// ── Medicine search box ───────────────────────────────────────────────────────
const MedicineSearchBox = ({ label, medicine, onSelect, onClear, color }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounce = useRef(null);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounce.current);
    if (!val.trim()) { setSuggestions([]); return; }
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await API.get(`/medicine/autocomplete?q=${val}`);
        setSuggestions(data.suggestions || []);
      } catch { setSuggestions([]); }
      finally { setSearching(false); }
    }, 350);
  };

  const handleSelect = async (name) => {
    setQuery(name);
    setSuggestions([]);
    setLoading(true);
    try {
      const { data } = await API.get(`/medicine/smart-search?q=${encodeURIComponent(name)}`);
      const med = data.medicines?.[0];
      if (med) onSelect({ ...med, _source: data.source });
      else toast.error("Medicine not found");
    } catch { toast.error("Failed to fetch medicine"); }
    finally { setLoading(false); }
  };

  if (medicine) {
    return (
      <div className={`flex-1 border-2 border-blue-200 bg-blue-50 rounded-xl p-4`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={`font-bold text-lg text-blue-900`}>{medicine.name}</p>
            {medicine.brand && <p className="text-sm text-gray-500">{medicine.brand}</p>}
            {medicine.generic && <p className="text-xs text-gray-400">Generic: {medicine.generic}</p>}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
              medicine._source === "database" ? "bg-blue-100 text-blue-700" :
              medicine._source === "OpenFDA" ? "bg-green-100 text-green-700" :
              "bg-blue-100 text-blue-700"
            }`}>
              {medicine._source === "database" ? "✓ Verified" : medicine._source === "OpenFDA" ? "FDA Data" : "AI Generated"}
            </span>
          </div>
          <button onClick={onClear} className="p-1.5 hover:bg-white rounded-lg transition shrink-0">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <div className="relative">
        <div className={`flex items-center gap-2 border-2 border-blue-300 focus-within:border-blue-500 rounded-xl px-4 py-3 bg-white transition`}>
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={handleInput}
            placeholder="Search medicine..."
            className="flex-1 text-sm outline-none bg-transparent placeholder-gray-900 text-gray-900"
          />
          {(searching || loading) && <Loader size={14} className="animate-spin text-gray-400 shrink-0" />}
        </div>

        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <div key={i} onClick={() => handleSelect(s.name)}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0">
                <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                {s.generic && <p className="text-xs text-gray-400">Generic: {s.generic}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Compare Page ─────────────────────────────────────────────────────────
const Compare = () => {
  const [med1, setMed1] = useState(null);
  const [med2, setMed2] = useState(null);

  const bothSelected = med1 && med2;

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
            <Zap size={28} className="text-blue-600" /> Medicine Comparison
          </h1>
          <p className="text-gray-600 text-sm">Compare two medicines side by side to make informed decisions</p>
        </div>

        {/* Search Boxes */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-start">
            <MedicineSearchBox label="Medicine 1" medicine={med1} onSelect={setMed1} onClear={() => setMed1(null)} color="blue" />
            <div className="flex items-center justify-center shrink-0">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 text-sm">VS</div>
            </div>
            <MedicineSearchBox label="Medicine 2" medicine={med2} onSelect={setMed2} onClear={() => setMed2(null)} color="purple" />
          </div>

          {!bothSelected && (
            <p className="text-center text-xs text-gray-400 mt-4">
              {!med1 && !med2 ? "Search and select two medicines to compare" :
               !med1 ? "Select Medicine 1 to start comparison" :
               "Select Medicine 2 to start comparison"}
            </p>
          )}
        </div>

        {/* Comparison Table */}
        {bothSelected && (
          <div>
            {/* Medicine Headers */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-600 text-white rounded-xl p-4 text-center">
                <p className="font-bold text-lg">{med1.name}</p>
                {med1.brand && <p className="text-blue-200 text-sm">{med1.brand}</p>}
              </div>
              <div className="bg-blue-700 text-white rounded-xl p-4 text-center">
                <p className="font-bold text-lg">{med2.name}</p>
                {med2.brand && <p className="text-blue-200 text-sm">{med2.brand}</p>}
              </div>
            </div>

            {/* Basic Info */}
            <Section title="Basic Information" icon={<Info size={16} />}>
              <tbody>
                <Row label="Generic Name"  val1={med1.generic}   val2={med2.generic} />
                <Row label="Category"      val1={med1.category}  val2={med2.category} />
                <Row label="Brand"         val1={med1.brand}     val2={med2.brand} />
                <Row label="Price"
                  val1={med1.price > 0 ? `Rs. ${med1.price}` : null}
                  val2={med2.price > 0 ? `Rs. ${med2.price}` : null} />
                <Row label="Prescription"  val1={med1.requiresPrescription} val2={med2.requiresPrescription} type="prescription" />
                <Row label="Commonly Misused" val1={med1.isCommonlyMisused} val2={med2.isCommonlyMisused} type="bool" />
                <Row label="Description"   val1={med1.description} val2={med2.description} />
              </tbody>
            </Section>

            {/* Dosage */}
            <Section title="Dosage" icon={<Pill size={16} />}>
              <tbody>
                <Row label="Standard Dosage" val1={med1.dosage}              val2={med2.dosage} />
                <Row label="Adult"           val1={med1.dosageGuide?.adult}   val2={med2.dosageGuide?.adult} />
                <Row label="Child"           val1={med1.dosageGuide?.child}   val2={med2.dosageGuide?.child} />
                <Row label="Elderly"         val1={med1.dosageGuide?.elderly} val2={med2.dosageGuide?.elderly} />
                <Row label="Notes"           val1={med1.dosageGuide?.notes}   val2={med2.dosageGuide?.notes} />
              </tbody>
            </Section>

            {/* Side Effects */}
            <Section title="Side Effects & Long-Term Effects" icon={<AlertTriangle size={16} />}>
              <tbody>
                <Row label="Side Effects"     val1={med1.sideEffects}     val2={med2.sideEffects} />
                <Row label="Long-Term Effects" val1={med1.longTermEffects} val2={med2.longTermEffects} />
              </tbody>
            </Section>

            {/* Safety */}
            <Section title="Safety & Warnings" icon={<Shield size={16} />}>
              <tbody>
                <Row label="Warnings"            val1={med1.warnings}            val2={med2.warnings} />
                <Row label="Contraindications"   val1={med1.contraindications}   val2={med2.contraindications} />
                <Row label="Who Should NOT Take" val1={med1.whoShouldNotTake}    val2={med2.whoShouldNotTake} />
              </tbody>
            </Section>

            {/* Interactions */}
            <Section title="Drug & Food Interactions" icon={<Zap size={16} />}>
              <tbody>
                <Row label="Drug Interactions" val1={med1.drugInteractions} val2={med2.drugInteractions} />
                <Row label="Food Interactions" val1={med1.foodInteractions} val2={med2.foodInteractions} />
              </tbody>
            </Section>

            {/* Food & Pregnancy */}
            <Section title="Food Timing & Pregnancy" icon={<Utensils size={16} />}>
              <tbody>
                <Row label="How to Take With Food"
                  val1={typeof med1.foodTiming === "string" ? med1.foodTiming : med1.foodTiming?.recommendation}
                  val2={typeof med2.foodTiming === "string" ? med2.foodTiming : med2.foodTiming?.recommendation} />
                <Row label="Pregnancy Warning"    val1={med1.pregnancyWarning}     val2={med2.pregnancyWarning} />
                <Row label="Breastfeeding Warning" val1={med1.breastfeedingWarning} val2={med2.breastfeedingWarning} />
              </tbody>
            </Section>

            {/* Safe Alternatives */}
            {(med1.safeAlternatives?.length > 0 || med2.safeAlternatives?.length > 0) && (
              <Section title="Safe Alternatives" icon={<CheckCircle size={16} />} defaultOpen={false}>
                <tbody>
                  <Row label="Alternatives" val1={med1.safeAlternatives} val2={med2.safeAlternatives} />
                </tbody>
              </Section>
            )}

            {/* AI Explanation */}
            {(med1.aiExplanation || med2.aiExplanation) && (
              <Section title="AI Explanation" icon={<Info size={16} />} defaultOpen={false}>
                <tbody>
                  <Row label="Simple Explanation" val1={med1.aiExplanation} val2={med2.aiExplanation} />
                </tbody>
              </Section>
            )}

            {/* Disclaimer */}
            <div className="bg-blue-600 text-white rounded-xl p-5 flex gap-3 mt-6">
              <Info size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">
                <strong>Medical Disclaimer:</strong> This comparison is for educational purposes only.
                Highlighted rows (yellow) indicate differences between the two medicines.
                Always consult a qualified doctor before making any medication decisions.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
    <MediBot />
    </>
  );
};

export default Compare;