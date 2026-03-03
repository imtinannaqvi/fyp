import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Info, AlertTriangle, CheckCircle, ShieldAlert, Pill, Clock, Utensils, XCircle } from "lucide-react";
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
        onSaveToggle?.(medicine._id, false);
      } else {
        await API.post(`/user/save-medicine/${medicine._id}`);
        toast.success("Medicine saved!");
        onSaveToggle?.(medicine._id, true);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update saved medicines";
      toast.error(errorMsg);
      console.error("Save medicine error:", err);
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
    database:      { label: "Verified", icon: <CheckCircle size={12} />, color: "bg-blue-600 text-white" },
    OpenFDA:       { label: "FDA Data", icon: <ShieldAlert size={12} />, color: "bg-blue-700 text-white" },
    "AI Generated":{ label: "AI Info", icon: <AlertTriangle size={12} />, color: "bg-blue-500 text-white" },
  }[source] || { label: source, icon: <Info size={12} />, color: "bg-gray-600 text-white" };

  return (
    <div className="bg-white border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
      
      {/* Medicine Header */}
      <div className="border-b border-gray-300 bg-gray-50 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{medicine.name}</h2>
              <span className={`text-xs font-bold px-2 py-1 rounded ${sourceBadge.color} flex items-center gap-1`}>
                {sourceBadge.icon} {sourceBadge.label}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {medicine.brand && <span className="font-semibold">{medicine.brand}</span>}
              {medicine.generic && <span> | Generic: {medicine.generic}</span>}
              {medicine.category && <span> | {medicine.category}</span>}
            </div>
          </div>
          {medicine._id && (
            <button onClick={handleSave} className={`p-2 border rounded transition ${isSaved ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-600"}`}>
              {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        
        {/* Key Information Table */}
        <table className="w-full mb-6 border border-gray-300">
          <tbody>
            {medicine.dosage && (
              <tr className="border-b border-gray-300">
                <td className="bg-gray-100 px-4 py-3 font-semibold text-sm text-gray-700 w-1/3">Standard Dosage</td>
                <td className="px-4 py-3 text-sm text-gray-900">{medicine.dosage}</td>
              </tr>
            )}
            {medicine.requiresPrescription !== undefined && (
              <tr className="border-b border-gray-300">
                <td className="bg-gray-100 px-4 py-3 font-semibold text-sm text-gray-700">Prescription Status</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`font-semibold flex items-center gap-1 ${medicine.requiresPrescription ? "text-blue-700" : "text-blue-600"}`}>
                    {medicine.requiresPrescription ? <><AlertTriangle size={14} /> Prescription Required</> : <><CheckCircle size={14} /> Over-the-Counter</>}
                  </span>
                </td>
              </tr>
            )}
            {medicine.price > 0 && (
              <tr className="border-b border-gray-300">
                <td className="bg-gray-100 px-4 py-3 font-semibold text-sm text-gray-700">Price</td>
                <td className="px-4 py-3 text-sm text-gray-900 font-semibold">Rs. {medicine.price}</td>
              </tr>
            )}
            {medicine.category && (
              <tr>
                <td className="bg-gray-100 px-4 py-3 font-semibold text-sm text-gray-700">Drug Class</td>
                <td className="px-4 py-3 text-sm text-gray-900 capitalize">{medicine.category}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Description */}
        {medicine.description && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{medicine.description}</p>
          </div>
        )}

        {/* AI Explanation */}
        {medicine.aiExplanation && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-600 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info size={16} className="text-blue-600" />
              <h3 className="text-sm font-bold text-blue-900 uppercase">AI-Generated Information</h3>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">{medicine.aiExplanation}</p>
          </div>
        )}

        {/* Misuse Warning */}
        {medicine.isCommonlyMisused && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-700 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-blue-700" />
              <p className="text-sm font-bold text-blue-900">WARNING: This medicine is commonly misused. Use only as directed by a healthcare professional.</p>
            </div>
          </div>
        )}

        {/* Personalized Dosage */}
        {medicine._id && (
          <div className="mb-6">
            {!dosage ? (
              <button onClick={handleGetDosage} disabled={loadingDosage} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 px-4 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loadingDosage ? <><Clock size={16} className="animate-spin" /> Calculating Personalized Dosage...</> : <><Pill size={16} /> Get Personalized Dosage Recommendation</>}
              </button>
            ) : (
              <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4">
                <h3 className="text-sm font-bold text-indigo-900 mb-2 uppercase">Your Personalized Dosage</h3>
                <p className="text-sm text-gray-800 leading-relaxed mb-3">{dosage}</p>
                <button onClick={() => setDosage(null)} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline">Hide Recommendation</button>
              </div>
            )}
          </div>
        )}

        {/* Dosage Guide */}
        {medicine.dosageGuide && (Object.values(medicine.dosageGuide).some(v => v)) && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Dosage Guidelines</h3>
            <table className="w-full border border-gray-300">
              <tbody>
                {medicine.dosageGuide.adult && (
                  <tr className="border-b border-gray-300">
                    <td className="bg-gray-100 px-4 py-3 font-semibold text-sm text-gray-700 w-1/4">Adults</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{medicine.dosageGuide.adult}</td>
                  </tr>
                )}
                {medicine.dosageGuide.child && (
                  <tr className="border-b border-gray-300">
                    <td className="bg-gray-100 px-4 py-3 font-semibold text-sm text-gray-700">Children</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{medicine.dosageGuide.child}</td>
                  </tr>
                )}
                {medicine.dosageGuide.elderly && (
                  <tr>
                    <td className="bg-gray-100 px-4 py-3 font-semibold text-sm text-gray-700">Elderly</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{medicine.dosageGuide.elderly}</td>
                  </tr>
                )}
              </tbody>
            </table>
            {medicine.dosageGuide.notes && (
              <p className="text-xs text-gray-600 mt-2 italic bg-blue-50 p-3 border-l-4 border-blue-400">
                <strong>Note:</strong> {medicine.dosageGuide.notes}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Clinical Details Section */}
      <div className="border-t-2 border-gray-300 bg-gray-50">
        <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold text-gray-900 hover:bg-gray-100 transition uppercase tracking-wide">
          <span>Clinical Information</span>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {expanded && (
          <div className="bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-300">
              
              {/* Side Effects */}
              {medicine.sideEffects?.length > 0 && (
                <div className="bg-white p-5">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-500">
                    <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center font-bold text-sm rounded"><AlertTriangle size={16} /></div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Adverse Effects</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {medicine.sideEffects.map((item, i) => (
                      <li key={i} className="text-sm text-gray-800 pl-4 border-l-2 border-blue-200 py-1">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contraindications */}
              {medicine.contraindications?.length > 0 && (
                <div className="bg-white p-5">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-700">
                    <div className="w-8 h-8 bg-blue-700 text-white flex items-center justify-center font-bold text-sm rounded"><XCircle size={16} /></div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Contraindications</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {medicine.contraindications.map((item, i) => (
                      <li key={i} className="text-sm text-gray-800 pl-4 border-l-2 border-blue-200 py-1">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {medicine.warnings?.length > 0 && (
                <div className="bg-white p-5">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-700">
                    <div className="w-8 h-8 bg-blue-700 text-white flex items-center justify-center font-bold text-lg rounded"><AlertTriangle size={18} /></div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Warnings & Precautions</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {medicine.warnings.map((item, i) => (
                      <li key={i} className="text-sm text-gray-800 pl-4 border-l-2 border-blue-200 py-1">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Drug Interactions */}
              {medicine.drugInteractions?.length > 0 && (
                <div className="bg-white p-5">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-600">
                    <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center font-bold text-sm rounded"><Pill size={16} /></div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Drug Interactions</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {medicine.drugInteractions.map((item, i) => (
                      <li key={i} className="text-sm text-gray-800 pl-4 border-l-2 border-blue-200 py-1">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Food Interactions */}
              {medicine.foodInteractions?.length > 0 && (
                <div className="bg-white p-5">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-500">
                    <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center font-bold text-sm rounded"><Utensils size={16} /></div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Food Interactions</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {medicine.foodInteractions.map((item, i) => (
                      <li key={i} className="text-sm text-gray-800 pl-4 border-l-2 border-blue-200 py-1">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Long Term Effects */}
              {medicine.longTermEffects?.length > 0 && (
                <div className="bg-white p-5">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-600">
                    <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center font-bold text-sm rounded"><Clock size={16} /></div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Long-Term Effects</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {medicine.longTermEffects.map((item, i) => (
                      <li key={i} className="text-sm text-gray-800 pl-4 border-l-2 border-blue-200 py-1">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Safe Alternatives - Full Width */}
            {medicine.safeAlternatives?.length > 0 && (
              <div className="bg-blue-50 border-t-4 border-blue-600 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center font-bold text-sm rounded"><CheckCircle size={16} /></div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Alternative Medications</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {medicine.safeAlternatives.map((alt, i) => (
                    <button key={i} onClick={() => navigate(`/search?q=${alt}`)} className="bg-white border-2 border-blue-600 text-blue-700 text-sm font-bold px-5 py-2.5 hover:bg-blue-600 hover:text-white transition uppercase tracking-wide">
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