import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Bookmark, BookmarkCheck, AlertTriangle,
  Info, ChevronDown, ChevronUp, Zap, User, Loader,
  ShieldAlert, CheckCircle, XCircle, Pill
} from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Badge = ({ children, color = "gray" }) => {
  const colors = {
    green:  "bg-green-100 text-green-700 border-green-200",
    red:    "bg-red-100 text-red-700 border-red-200",
    blue:   "bg-blue-100 text-blue-700 border-blue-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    gray:   "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${colors[color]}`}>
      {children}
    </span>
  );
};

const Section = ({ title, icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-gray-500">{icon}</span>
          <span className="font-semibold text-gray-800 text-sm">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-5 py-4 bg-white">{children}</div>}
    </div>
  );
};

const ListItems = ({ items, color = "text-gray-600" }) => (
  <ul className="space-y-1.5">
    {items.map((item, i) => (
      <li key={i} className={`flex items-start gap-2 text-sm ${color}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 shrink-0" />
        {item}
      </li>
    ))}
  </ul>
);

const MedicineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [medicine, setMedicine]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [saved, setSaved]           = useState(false);
  const [dosage, setDosage]         = useState(null);
  const [loadingDosage, setLoadingDosage] = useState(false);
  const [activeTab, setActiveTab]   = useState("overview");

  useEffect(() => {
    fetchMedicine();
  }, [id]);

  const fetchMedicine = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/medicine/${id}`);
      setMedicine(data);
      // Check if saved
      if (user) {
        try {
          const { data: savedData } = await API.get("/user/saved-medicines");
          setSaved(savedData.some(m => m._id === id));
        } catch {}
      }
    } catch (err) {
      toast.error("Medicine not found");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) { toast.error("Please login to save medicines"); return; }
    try {
      if (saved) {
        await API.delete(`/user/save-medicine/${id}`);
        setSaved(false);
        toast.success("Removed from saved");
      } else {
        await API.post(`/user/save-medicine/${id}`);
        setSaved(true);
        toast.success("Medicine saved!");
      }
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleGetDosage = async () => {
    if (!user) { toast.error("Please login first"); return; }
    setLoadingDosage(true);
    try {
      const { data } = await API.get(`/ai/dosage/${id}`);
      setDosage(data.recommendation);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed";
      if (msg.includes("profile")) {
        toast.error("Complete your health profile first");
        navigate("/profile");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoadingDosage(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader size={32} className="animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading medicine details...</p>
      </div>
    </div>
  );

  if (!medicine) return null;

  const tabs = ["overview", "dosage", "safety", "interactions"];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition shrink-0"
          >
            <ArrowLeft size={16} className="text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 text-lg truncate">{medicine.name}</h1>
            {medicine.generic && <p className="text-xs text-gray-400 truncate">{medicine.generic}</p>}
          </div>
          <button onClick={handleSave}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${
              saved
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-600"
            }`}
          >
            {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Hero Card ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">

            {/* Icon */}
            <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center shrink-0 text-3xl">
              💊
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-3">
                {medicine.category && <Badge color="blue">{medicine.category}</Badge>}
                {medicine.requiresPrescription
                  ? <Badge color="red">Prescription Required</Badge>
                  : <Badge color="green">OTC Available</Badge>
                }
                {medicine.isCommonlyMisused && <Badge color="orange">⚠ Commonly Misused</Badge>}
                {medicine.isApproved && <Badge color="green">✓ Verified</Badge>}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {medicine.brand && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 mb-0.5">Brand</p>
                    <p className="text-sm font-semibold text-gray-800">{medicine.brand}</p>
                  </div>
                )}
                {medicine.generic && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 mb-0.5">Generic</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{medicine.generic}</p>
                  </div>
                )}
                {medicine.price > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 mb-0.5">Price</p>
                    <p className="text-sm font-semibold text-gray-800">Rs. {medicine.price}</p>
                  </div>
                )}
                {medicine.dosage && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 mb-0.5">Std. Dosage</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{medicine.dosage}</p>
                  </div>
                )}
              </div>

              {medicine.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{medicine.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── AI Explanation ─────────────────────────────────────────────── */}
        {medicine.aiExplanation && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Info size={15} className="text-blue-500" />
              <p className="text-sm font-semibold text-blue-700">AI Explanation</p>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed">{medicine.aiExplanation}</p>
          </div>
        )}

        {/* ── Personalized Dosage ────────────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <User size={16} className="text-indigo-500" />
            <h3 className="font-semibold text-gray-800 text-sm">Personalized Dosage</h3>
          </div>
          {!dosage ? (
            <>
              <p className="text-xs text-gray-500 mb-3">
                Get an AI-calculated dosage based on your age, weight and medical conditions.
              </p>
              <button onClick={handleGetDosage} disabled={loadingDosage}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition disabled:opacity-50"
              >
                {loadingDosage
                  ? <><Loader size={14} className="animate-spin" /> Calculating...</>
                  : <><Pill size={14} /> Get My Dosage</>
                }
              </button>
            </>
          ) : (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-indigo-500 mb-2">💊 Your Personalized Recommendation</p>
              <p className="text-sm text-indigo-800 leading-relaxed">{dosage}</p>
              <button onClick={() => setDosage(null)} className="text-xs text-indigo-400 hover:text-indigo-600 mt-2 transition">
                Hide
              </button>
            </div>
          )}
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {/* Tab bar — scrollable on mobile */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium capitalize transition whitespace-nowrap ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-5">

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                {medicine.dosageGuide && Object.values(medicine.dosageGuide).some(v => v) && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Dosage Guide</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {medicine.dosageGuide.adult   && <div className="bg-gray-50 rounded-xl p-3"><p className="text-[10px] text-gray-400 mb-1">Adult</p><p className="text-sm text-gray-700 font-medium">{medicine.dosageGuide.adult}</p></div>}
                      {medicine.dosageGuide.child   && <div className="bg-gray-50 rounded-xl p-3"><p className="text-[10px] text-gray-400 mb-1">Child</p><p className="text-sm text-gray-700 font-medium">{medicine.dosageGuide.child}</p></div>}
                      {medicine.dosageGuide.elderly && <div className="bg-gray-50 rounded-xl p-3"><p className="text-[10px] text-gray-400 mb-1">Elderly</p><p className="text-sm text-gray-700 font-medium">{medicine.dosageGuide.elderly}</p></div>}
                    </div>
                    {medicine.dosageGuide.notes && (
                      <p className="text-xs text-gray-500 italic mt-2 flex items-start gap-1.5">
                        <Info size={12} className="shrink-0 mt-0.5" /> {medicine.dosageGuide.notes}
                      </p>
                    )}
                  </div>
                )}

                {medicine.sideEffects?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Common Side Effects</p>
                    <div className="flex flex-wrap gap-2">
                      {medicine.sideEffects.slice(0, 6).map((s, i) => (
                        <span key={i} className="text-xs bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {medicine.safeAlternatives?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Safe Alternatives</p>
                    <div className="flex flex-wrap gap-2">
                      {medicine.safeAlternatives.map((alt, i) => (
                        <button key={i} onClick={() => navigate(`/search?q=${alt}`)}
                          className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full hover:bg-green-100 transition"
                        >
                          {alt} →
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dosage Tab */}
            {activeTab === "dosage" && (
              <div className="space-y-4">
                {medicine.dosageGuide && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {medicine.dosageGuide.adult   && <div className="border border-gray-100 rounded-xl p-4"><p className="text-xs text-gray-400 mb-1">👨 Adult</p><p className="text-sm text-gray-800 font-medium">{medicine.dosageGuide.adult}</p></div>}
                    {medicine.dosageGuide.child   && <div className="border border-gray-100 rounded-xl p-4"><p className="text-xs text-gray-400 mb-1">👶 Child</p><p className="text-sm text-gray-800 font-medium">{medicine.dosageGuide.child}</p></div>}
                    {medicine.dosageGuide.elderly && <div className="border border-gray-100 rounded-xl p-4"><p className="text-xs text-gray-400 mb-1">👴 Elderly</p><p className="text-sm text-gray-800 font-medium">{medicine.dosageGuide.elderly}</p></div>}
                  </div>
                )}
                {medicine.dosage && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-600 mb-1">Standard Dosage</p>
                    <p className="text-sm text-blue-800">{medicine.dosage}</p>
                  </div>
                )}
                {medicine.dosageGuide?.notes && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-600 mb-1">⚠ Important Notes</p>
                    <p className="text-sm text-amber-800">{medicine.dosageGuide.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Safety Tab */}
            {activeTab === "safety" && (
              <div className="space-y-4">
                {medicine.warnings?.length > 0 && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert size={14} className="text-red-500" />
                      <p className="text-sm font-semibold text-red-700">Warnings</p>
                    </div>
                    <ListItems items={medicine.warnings} color="text-red-700" />
                  </div>
                )}
                {medicine.contraindications?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Who Should NOT Take</p>
                    <ListItems items={medicine.contraindications} color="text-red-600" />
                  </div>
                )}
                {medicine.sideEffects?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Side Effects</p>
                    <ListItems items={medicine.sideEffects} color="text-orange-600" />
                  </div>
                )}
                {medicine.longTermEffects?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Long Term Effects</p>
                    <ListItems items={medicine.longTermEffects} color="text-red-600" />
                  </div>
                )}
              </div>
            )}

            {/* Interactions Tab */}
            {activeTab === "interactions" && (
              <div className="space-y-4">
                {medicine.foodInteractions?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Food Interactions</p>
                    <ListItems items={medicine.foodInteractions} color="text-yellow-700" />
                  </div>
                )}
                {medicine.drugInteractions?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Drug Interactions</p>
                    <ListItems items={medicine.drugInteractions} color="text-purple-700" />
                  </div>
                )}
                {!medicine.foodInteractions?.length && !medicine.drugInteractions?.length && (
                  <div className="text-center py-8">
                    <CheckCircle size={32} className="text-green-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No known interactions listed</p>
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-2">
                  <p className="text-xs text-blue-700 leading-relaxed">
                    💡 For a complete interaction check between multiple medicines, use our{" "}
                    <button onClick={() => navigate("/interactions")} className="font-semibold underline">
                      Drug Interaction Checker
                    </button>
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Misuse Warning ─────────────────────────────────────────────── */}
        {medicine.isCommonlyMisused && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex gap-3">
            <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-800 text-sm mb-1">Commonly Misused Medicine</p>
              <p className="text-orange-700 text-sm">This medicine is frequently misused. Always follow prescribed dosage and never share with others.</p>
            </div>
          </div>
        )}

        {/* ── Disclaimer ─────────────────────────────────────────────────── */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
          <p className="text-xs text-amber-700">
            ⚠️ <strong>Disclaimer:</strong> This information is for educational purposes only. Always consult a qualified doctor before taking any medicine.
          </p>
        </div>

      </div>
    </div>
  );
};

export default MedicineDetail;