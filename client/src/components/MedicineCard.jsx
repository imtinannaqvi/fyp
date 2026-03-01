import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Info, AlertTriangle } from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const MedicineCard = ({ medicine, source, savedIds = [], onSaveToggle }) => {
  const [expanded, setExpanded]     = useState(false);
  const [dosage, setDosage]         = useState(null);
  const [loadingDosage, setLoadingDosage] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSaved  = savedIds.includes(medicine._id);

  const handleSave = async () => {
    if (!user) { toast.error("Please login to save medicines"); return; }
    try {
      if (isSaved) {
        await API.delete(`/user/save-medicine/${medicine._id}`);
        toast.success("Removed from saved");
      } else {
        await API.post(`/user/save-medicine/${medicine._id}`);
        toast.success("Medicine saved!");
      }
      onSaveToggle?.(medicine._id, !isSaved);
    } catch {
      toast.error("Failed to update saved medicines");
    }
  };

  const handleGetDosage = async () => {
    if (!user) { toast.error("Please login to get personalized dosage"); return; }
    if (!medicine._id) { toast.error("Medicine not in our database"); return; }
    setLoadingDosage(true);
    try {
      const { data } = await API.get(`/ai/dosage/${medicine._id}`);
      setDosage(data.recommendation);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to get dosage";
      if (msg.includes("profile")) {
        toast.error("Please complete your health profile first");
        navigate("/profile");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoadingDosage(false);
    }
  };

  const sourceBadge = {
    database:      { label: "✓ Verified",    color: "bg-green-100 text-green-700" },
    OpenFDA:       { label: "OpenFDA",        color: "bg-blue-100 text-blue-700" },
    "AI Generated":{ label: "AI Generated",  color: "bg-yellow-100 text-yellow-700" },
  }[source] || { label: source, color: "bg-gray-100 text-gray-600" };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

      {/* ── Card Header ───────────────────────────────────────────────── */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-gray-900 text-lg truncate">{medicine.name}</h3>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ${sourceBadge.color}`}>
                {sourceBadge.label}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {medicine.brand && <span className="font-medium text-gray-600">{medicine.brand}</span>}
              {medicine.generic && <span> · {medicine.generic}</span>}
              {medicine.category && <span> · <span className="capitalize">{medicine.category}</span></span>}
            </p>
          </div>

          {/* Save Button */}
          {medicine._id && (
            <button onClick={handleSave}
              className={`shrink-0 p-2 rounded-xl border transition ${
                isSaved
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : "border-gray-200 text-gray-400 hover:border-blue-200 hover:text-blue-600"
              }`}
            >
              {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
          {medicine.dosage && (
            <div className="bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-[10px] text-gray-400 mb-0.5">Dosage</p>
              <p className="text-sm font-semibold text-gray-700">{medicine.dosage}</p>
            </div>
          )}
          {medicine.requiresPrescription !== undefined && (
            <div className={`rounded-xl px-3 py-2 ${medicine.requiresPrescription ? "bg-red-50" : "bg-green-50"}`}>
              <p className="text-[10px] text-gray-400 mb-0.5">Prescription</p>
              <p className={`text-sm font-semibold ${medicine.requiresPrescription ? "text-red-600" : "text-green-600"}`}>
                {medicine.requiresPrescription ? "Required" : "Not Required"}
              </p>
            </div>
          )}
          {medicine.price > 0 && (
            <div className="bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-[10px] text-gray-400 mb-0.5">Price</p>
              <p className="text-sm font-semibold text-gray-700">Rs. {medicine.price}</p>
            </div>
          )}
        </div>

        {/* Description */}
        {medicine.description && (
          <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">{medicine.description}</p>
        )}

        {/* AI Explanation */}
        {medicine.aiExplanation && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3">
            <p className="text-[10px] font-semibold text-blue-500 mb-1 flex items-center gap-1">
              <Info size={10} /> AI Explanation
            </p>
            <p className="text-xs text-blue-800 leading-relaxed">{medicine.aiExplanation}</p>
          </div>
        )}

        {/* Personalized Dosage */}
        {medicine._id && (
          <div className="mb-1">
            {!dosage ? (
              <button onClick={handleGetDosage} disabled={loadingDosage}
                className="w-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-sm font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingDosage ? (
                  <><span className="animate-spin">⏳</span> Calculating...</>
                ) : (
                  <>💊 Get My Personalized Dosage</>
                )}
              </button>
            ) : (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-indigo-500 mb-1">💊 Your Personalized Dosage</p>
                <p className="text-xs text-indigo-800 leading-relaxed">{dosage}</p>
                <button onClick={() => setDosage(null)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-600 mt-1 transition"
                >
                  Hide
                </button>
              </div>
            )}
          </div>
        )}

        {/* Misuse Warning */}
        {medicine.isCommonlyMisused && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 mt-2">
            <AlertTriangle size={13} className="text-orange-500 shrink-0" />
            <p className="text-xs text-orange-700 font-medium">Commonly misused medicine — use with caution</p>
          </div>
        )}
      </div>

      {/* ── Expandable Details ─────────────────────────────────────────── */}
      <div className="border-t border-gray-100">
        <button onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition"
        >
          <span>{expanded ? "Hide Details" : "Show Full Details"}</span>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {expanded && (
          <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">

            {/* Dosage Guide */}
            {medicine.dosageGuide && (Object.values(medicine.dosageGuide).some(v => v)) && (
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-gray-600 mb-2">Dosage Guide</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {medicine.dosageGuide.adult   && <div className="bg-gray-50 rounded-xl p-2.5"><p className="text-[10px] text-gray-400">Adult</p><p className="text-xs text-gray-700 font-medium">{medicine.dosageGuide.adult}</p></div>}
                  {medicine.dosageGuide.child   && <div className="bg-gray-50 rounded-xl p-2.5"><p className="text-[10px] text-gray-400">Child</p><p className="text-xs text-gray-700 font-medium">{medicine.dosageGuide.child}</p></div>}
                  {medicine.dosageGuide.elderly && <div className="bg-gray-50 rounded-xl p-2.5"><p className="text-[10px] text-gray-400">Elderly</p><p className="text-xs text-gray-700 font-medium">{medicine.dosageGuide.elderly}</p></div>}
                </div>
                {medicine.dosageGuide.notes && <p className="text-xs text-gray-500 italic mt-2">{medicine.dosageGuide.notes}</p>}
              </div>
            )}

            {/* Info Sections */}
            {[
              { label: "Side Effects",        items: medicine.sideEffects,       color: "text-orange-600" },
              { label: "Long Term Effects",   items: medicine.longTermEffects,   color: "text-red-600" },
              { label: "Who Should NOT Take", items: medicine.contraindications, color: "text-red-700" },
              { label: "Food Interactions",   items: medicine.foodInteractions,  color: "text-yellow-700" },
              { label: "Drug Interactions",   items: medicine.drugInteractions,  color: "text-purple-700" },
              { label: "Warnings",            items: medicine.warnings,          color: "text-red-600" },
            ].map(({ label, items, color }) =>
              items?.length > 0 ? (
                <div key={label}>
                  <p className="text-xs font-semibold text-gray-600 mb-1.5">{label}</p>
                  <ul className="space-y-1">
                    {items.map((item, i) => (
                      <li key={i} className={`text-xs ${color} flex items-start gap-1.5`}>
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null
            )}

            {/* Safe Alternatives */}
            {medicine.safeAlternatives?.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-gray-600 mb-2">Safe Alternatives</p>
                <div className="flex flex-wrap gap-2">
                  {medicine.safeAlternatives.map((alt, i) => (
                    <button key={i}
                      onClick={() => navigate(`/search?q=${alt}`)}
                      className="bg-green-50 text-green-700 border border-green-200 text-xs px-3 py-1.5 rounded-full hover:bg-green-100 transition"
                    >
                      {alt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineCard;