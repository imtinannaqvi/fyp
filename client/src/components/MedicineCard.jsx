import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark, BookmarkCheck, ChevronDown, ChevronUp,
  Info, AlertTriangle, CheckCircle, ShieldAlert, Pill,
  Clock, Utensils, XCircle, Baby, UserX, Coffee, Ban, Languages, Loader2
} from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const MedicineCard = ({ medicine, source, savedIds = [], onSaveToggle }) => {
  const [expanded, setExpanded]           = useState(false);
  const [dosage, setDosage]               = useState(null);
  const [loadingDosage, setLoadingDosage] = useState(false);

  // ── Language state ──────────────────────────────────────────────────────────
  const [lang, setLang]                   = useState("en");          // "en" | "ur"
  const [urduData, setUrduData]           = useState(null);          // cached translation
  const [translating, setTranslating]     = useState(false);

  const { user } = useAuth();
  const navigate  = useNavigate();
  const isSaved   = savedIds.includes(medicine._id);

  // ── Active data: English or Urdu ────────────────────────────────────────────
  const data = lang === "ur" && urduData ? { ...medicine, ...urduData } : medicine;
  const isUrdu = lang === "ur";

  // ── Toggle language ─────────────────────────────────────────────────────────
  const handleLangToggle = async () => {
    if (lang === "en") {
      // Switch to Urdu
      if (urduData) {
        // Already cached — instant switch
        setLang("ur");
        return;
      }
      // First time — call API to translate
      setTranslating(true);
      try {
        const { data: res } = await API.post("/ai/translate", { medicine });
        setUrduData(res.translated);
        setLang("ur");
      } catch (err) {
        toast.error("Translation failed. Please try again.");
      } finally {
        setTranslating(false);
      }
    } else {
      // Switch back to English — instant, no API call
      setLang("en");
    }
  };

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
      toast.error(err.response?.data?.message || "Failed to update saved medicines");
    }
  };

  const handleGetDosage = async () => {
    if (!user) { toast.error("Please login to get personalized dosage"); return; }
    if (!medicine._id) { toast.error("Medicine not in our database"); return; }
    setLoadingDosage(true);
    try {
      const { data: res } = await API.get(`/ai/dosage/${medicine._id}`);
      setDosage(res.recommendation);
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
    database:      { label: "Verified",  icon: <CheckCircle size={12} />,  color: "bg-blue-600 text-white" },
    OpenFDA:       { label: "FDA Data",  icon: <ShieldAlert size={12} />,  color: "bg-blue-700 text-white" },
    "AI Generated":{ label: "AI Info",   icon: <AlertTriangle size={12} />, color: "bg-blue-500 text-white" },
  }[source] || { label: source, icon: <Info size={12} />, color: "bg-gray-600 text-white" };

  // ── Reusable clinical section ───────────────────────────────────────────────
  const ClinicalSection = ({ borderColor, bgColor, icon, title, items, fullWidth = false }) => {
    if (!items?.length) return null;
    return (
      <div className={`bg-white p-5 ${fullWidth ? "col-span-1 md:col-span-2" : ""}`}>
        <div className={`flex items-center gap-2 mb-4 pb-2 border-b-2 ${borderColor}`}>
          <div className={`w-8 h-8 ${bgColor} text-white flex items-center justify-center rounded`}>
            {icon}
          </div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{title}</h3>
        </div>
        <ul className="space-y-2.5">
          {items.map((item, i) => (
            <li key={i} className={`text-sm text-gray-800 pl-4 border-l-2 border-blue-200 py-1 ${isUrdu ? "text-right font-urdu leading-loose" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-300 shadow-sm hover:shadow-md transition-shadow" dir={isUrdu ? "rtl" : "ltr"}>

      {/* ── Medicine Header ─────────────────────────────────────────────────── */}
      <div className="border-b border-gray-300 bg-gray-50 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-900">{medicine.name}</h2>
              <span className={`text-xs font-bold px-2 py-1 rounded ${sourceBadge.color} flex items-center gap-1`}>
                {sourceBadge.icon} {sourceBadge.label}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {medicine.brand   && <span className="font-semibold">{medicine.brand}</span>}
              {medicine.generic  && <span> | Generic: {medicine.generic}</span>}
              {medicine.category && <span> | {medicine.category}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* ── Language Toggle Button ── */}
            <button
              onClick={handleLangToggle}
              disabled={translating}
              title={isUrdu ? "Switch to English" : "اردو میں دیکھیں"}
              className={`flex items-center gap-1.5 px-3 py-2 border-2 rounded text-xs font-bold transition ${
                isUrdu
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-700"
              }`}
            >
              {translating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Languages size={14} />
              )}
              {translating ? "..." : isUrdu ? "EN" : "اردو"}
            </button>

            {medicine._id && (
              <button onClick={handleSave} className={`p-2 border rounded transition ${isSaved ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-600"}`}>
                {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">

        {/* ── Key Information Table ───────────────────────────────────────────── */}
        <table className="w-full mb-6 border border-gray-300">
          <tbody>
            {data.dosage && (
              <tr className="border-b border-gray-300">
                <td className="bg-gray-100 px-4 py-3 font-semibold text-sm text-gray-700 w-1/3">
                  {isUrdu ? "معیاری خوراک" : "Standard Dosage"}
                </td>
                <td className={`px-4 py-3 text-sm text-gray-900 ${isUrdu ? "text-right" : ""}`}>{data.dosage}</td>
              </tr>
            )}
            {medicine.requiresPrescription !== undefined && (
              <tr className="border-b border-gray-300">
                <td className="bg-gray-100 px-4 py-3 font-semibold text-sm text-gray-700">
                  {isUrdu ? "نسخے کی ضرورت" : "Prescription Status"}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`font-semibold flex items-center gap-1 ${medicine.requiresPrescription ? "text-blue-700" : "text-blue-600"} ${isUrdu ? "flex-row-reverse justify-end" : ""}`}>
                    {medicine.requiresPrescription
                      ? <><AlertTriangle size={14} /> {isUrdu ? "نسخہ ضروری ہے" : "Prescription Required"}</>
                      : <><CheckCircle size={14} /> {isUrdu ? "بغیر نسخے کے دستیاب" : "Over-the-Counter"}</>}
                  </span>
                </td>
              </tr>
            )}
            {medicine.price > 0 && (
              <tr className="border-b border-gray-300">
                <td className="bg-gray-100 px-4 py-3 font-semibold text-sm text-gray-700">
                  {isUrdu ? "قیمت" : "Price"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-semibold">Rs. {medicine.price}</td>
              </tr>
            )}
            {medicine.category && (
              <tr>
                <td className="bg-gray-100 px-4 py-3 font-semibold text-sm text-gray-700">
                  {isUrdu ? "دوا کی قسم" : "Drug Class"}
                </td>
                <td className={`px-4 py-3 text-sm text-gray-900 capitalize ${isUrdu ? "text-right" : ""}`}>{medicine.category}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ── Description ────────────────────────────────────────────────────── */}
        {data.description && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
              {isUrdu ? "تفصیل" : "Description"}
            </h3>
            <p className={`text-sm text-gray-700 leading-relaxed ${isUrdu ? "text-right leading-loose" : ""}`}>{data.description}</p>
          </div>
        )}

        {/* ── AI Explanation ──────────────────────────────────────────────────── */}
        {data.aiExplanation && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-600 p-4">
            <div className={`flex items-center gap-2 mb-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
              <Info size={16} className="text-blue-600" />
              <h3 className="text-sm font-bold text-blue-900 uppercase">
                {isUrdu ? "AI سے معلومات" : "AI-Generated Information"}
              </h3>
            </div>
            <p className={`text-sm text-gray-800 leading-relaxed ${isUrdu ? "text-right leading-loose" : ""}`}>{data.aiExplanation}</p>
          </div>
        )}

        {/* ── Misuse Warning ──────────────────────────────────────────────────── */}
        {medicine.isCommonlyMisused && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-700 p-4">
            <div className={`flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
              <AlertTriangle size={16} className="text-blue-700" />
              <p className={`text-sm font-bold text-blue-900 ${isUrdu ? "text-right" : ""}`}>
                {isUrdu
                  ? "خبردار: یہ دوا عام طور پر غلط استعمال ہوتی ہے۔ صرف ڈاکٹر کی ہدایت پر استعمال کریں۔"
                  : "WARNING: This medicine is commonly misused. Use only as directed by a healthcare professional."}
              </p>
            </div>
          </div>
        )}

        {/* ── Personalized Dosage ─────────────────────────────────────────────── */}
        {medicine._id && (
          <div className="mb-6">
            {!dosage ? (
              <button onClick={handleGetDosage} disabled={loadingDosage}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 px-4 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loadingDosage
                  ? <><Clock size={16} className="animate-spin" /> {isUrdu ? "خوراک حساب ہو رہی ہے..." : "Calculating Personalized Dosage..."}</>
                  : <><Pill size={16} /> {isUrdu ? "ذاتی خوراک کی سفارش حاصل کریں" : "Get Personalized Dosage Recommendation"}</>}
              </button>
            ) : (
              <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4">
                <h3 className={`text-sm font-bold text-indigo-900 mb-2 uppercase ${isUrdu ? "text-right" : ""}`}>
                  {isUrdu ? "آپ کی ذاتی خوراک" : "Your Personalized Dosage"}
                </h3>
                <p className={`text-sm text-gray-800 leading-relaxed mb-3 ${isUrdu ? "text-right leading-loose" : ""}`}>{dosage}</p>
                <button onClick={() => setDosage(null)} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline">
                  {isUrdu ? "چھپائیں" : "Hide Recommendation"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Dosage Guide ────────────────────────────────────────────────────── */}
        {data.dosageGuide && Object.values(data.dosageGuide).some(v => v) && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
              {isUrdu ? "خوراک کی ہدایات" : "Dosage Guidelines"}
            </h3>
            <table className="w-full border border-gray-300">
              <tbody>
                {data.dosageGuide.adult && (
                  <tr className="border-b border-gray-300">
                    <td className="bg-gray-100 px-4 py-3 font-semibold text-sm text-gray-700 w-1/4">{isUrdu ? "بالغ" : "Adults"}</td>
                    <td className={`px-4 py-3 text-sm text-gray-900 ${isUrdu ? "text-right" : ""}`}>{data.dosageGuide.adult}</td>
                  </tr>
                )}
                {data.dosageGuide.child && (
                  <tr className="border-b border-gray-300">
                    <td className="bg-gray-100 px-4 py-3 font-semibold text-sm text-gray-700">{isUrdu ? "بچے" : "Children"}</td>
                    <td className={`px-4 py-3 text-sm text-gray-900 ${isUrdu ? "text-right" : ""}`}>{data.dosageGuide.child}</td>
                  </tr>
                )}
                {data.dosageGuide.elderly && (
                  <tr>
                    <td className="bg-gray-100 px-4 py-3 font-semibold text-sm text-gray-700">{isUrdu ? "بزرگ" : "Elderly"}</td>
                    <td className={`px-4 py-3 text-sm text-gray-900 ${isUrdu ? "text-right" : ""}`}>{data.dosageGuide.elderly}</td>
                  </tr>
                )}
              </tbody>
            </table>
            {data.dosageGuide.notes && (
              <p className={`text-xs text-gray-600 mt-2 italic bg-blue-50 p-3 border-l-4 border-blue-400 ${isUrdu ? "text-right" : ""}`}>
                <strong>{isUrdu ? "نوٹ:" : "Note:"}</strong> {data.dosageGuide.notes}
              </p>
            )}
          </div>
        )}

        {/* ── Who Should NOT Take This ─────────────────────────────────────────── */}
        {data.whoShouldNotTake?.length > 0 && (
          <div className="mb-6 border-2 border-red-200 rounded-lg overflow-hidden">
            <div className={`bg-red-600 px-5 py-3 flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
              <UserX size={18} className="text-white" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {isUrdu ? "یہ دوا کون نہ لے" : "Who Should NOT Take This Medicine"}
              </h3>
            </div>
            <div className="bg-red-50 p-5">
              <ul className="space-y-2">
                {data.whoShouldNotTake.map((item, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm text-red-900 ${isUrdu ? "flex-row-reverse text-right" : ""}`}>
                    <Ban size={15} className="text-red-500 shrink-0 mt-0.5" />
                    <span className={isUrdu ? "leading-loose" : ""}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── Food & Drink to Avoid ────────────────────────────────────────────── */}
        {data.foodInteractions?.length > 0 && (
          <div className="mb-6 border-2 border-orange-200 rounded-lg overflow-hidden">
            <div className={`bg-orange-500 px-5 py-3 flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
              <Utensils size={18} className="text-white" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {isUrdu ? "کھانے پینے سے پرہیز" : "Food & Drink to Avoid"}
              </h3>
            </div>
            <div className="bg-orange-50 p-5">
              <ul className="space-y-2">
                {data.foodInteractions.map((item, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm text-orange-900 ${isUrdu ? "flex-row-reverse text-right" : ""}`}>
                    <XCircle size={15} className="text-orange-500 shrink-0 mt-0.5" />
                    <span className={isUrdu ? "leading-loose" : ""}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── How to Take With Food ────────────────────────────────────────────── */}
        {data.foodTiming && (
          <div className="mb-6 border-2 border-blue-200 rounded-lg overflow-hidden">
            <div className={`bg-blue-600 px-5 py-3 flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
              <Coffee size={18} className="text-white" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {isUrdu ? "کھانے کے ساتھ کیسے لیں" : "How to Take With Food"}
              </h3>
            </div>
            <div className="bg-blue-50 p-5">
              {typeof data.foodTiming === "string" ? (
                <p className={`text-sm text-blue-900 leading-relaxed ${isUrdu ? "text-right leading-loose" : ""}`}>{data.foodTiming}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {data.foodTiming.before && (
                    <div className="bg-white border border-blue-200 rounded-lg p-3 text-center">
                      <p className="text-xs font-bold text-blue-700 uppercase mb-1">{isUrdu ? "کھانے سے پہلے" : "Before Food"}</p>
                      <p className={`text-sm text-gray-800 ${isUrdu ? "leading-loose" : ""}`}>{data.foodTiming.before}</p>
                    </div>
                  )}
                  {data.foodTiming.during && (
                    <div className="bg-white border border-blue-200 rounded-lg p-3 text-center">
                      <p className="text-xs font-bold text-blue-700 uppercase mb-1">{isUrdu ? "کھانے کے ساتھ" : "With Food"}</p>
                      <p className={`text-sm text-gray-800 ${isUrdu ? "leading-loose" : ""}`}>{data.foodTiming.during}</p>
                    </div>
                  )}
                  {data.foodTiming.after && (
                    <div className="bg-white border border-blue-200 rounded-lg p-3 text-center">
                      <p className="text-xs font-bold text-blue-700 uppercase mb-1">{isUrdu ? "کھانے کے بعد" : "After Food"}</p>
                      <p className={`text-sm text-gray-800 ${isUrdu ? "leading-loose" : ""}`}>{data.foodTiming.after}</p>
                    </div>
                  )}
                  {data.foodTiming.recommendation && (
                    <div className="md:col-span-3 bg-white border border-blue-200 rounded-lg p-3">
                      <p className={`text-sm text-blue-900 font-medium ${isUrdu ? "text-right leading-loose" : ""}`}>{data.foodTiming.recommendation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Pregnancy & Breastfeeding ────────────────────────────────────────── */}
        {(data.pregnancyWarning || data.breastfeedingWarning) && (
          <div className="mb-6 border-2 border-pink-200 rounded-lg overflow-hidden">
            <div className={`bg-pink-600 px-5 py-3 flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
              <Baby size={18} className="text-white" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {isUrdu ? "حمل اور دودھ پلانا" : "Pregnancy & Breastfeeding"}
              </h3>
            </div>
            <div className="bg-pink-50 p-5 space-y-4">
              {data.pregnancyWarning && (
                <div>
                  <p className={`text-xs font-bold text-pink-700 uppercase mb-1 flex items-center gap-1 ${isUrdu ? "flex-row-reverse" : ""}`}>
                    <Baby size={12} /> {isUrdu ? "حمل" : "Pregnancy"}
                  </p>
                  <p className={`text-sm text-pink-900 leading-relaxed pl-3 border-l-2 border-pink-300 ${isUrdu ? "text-right pr-3 pl-0 border-r-2 border-l-0 leading-loose" : ""}`}>
                    {data.pregnancyWarning}
                  </p>
                </div>
              )}
              {data.breastfeedingWarning && (
                <div>
                  <p className={`text-xs font-bold text-pink-700 uppercase mb-1 flex items-center gap-1 ${isUrdu ? "flex-row-reverse" : ""}`}>
                    <Baby size={12} /> {isUrdu ? "دودھ پلانا" : "Breastfeeding"}
                  </p>
                  <p className={`text-sm text-pink-900 leading-relaxed pl-3 border-l-2 border-pink-300 ${isUrdu ? "text-right pr-3 pl-0 border-r-2 border-l-0 leading-loose" : ""}`}>
                    {data.breastfeedingWarning}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ── Clinical Details (expandable) ───────────────────────────────────── */}
      <div className="border-t-2 border-gray-300 bg-gray-50">
        <button onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold text-gray-900 hover:bg-gray-100 transition uppercase tracking-wide">
          <span>{isUrdu ? "طبی معلومات" : "Clinical Information"}</span>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {expanded && (
          <div className="bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-300">
              <ClinicalSection borderColor="border-blue-500" bgColor="bg-blue-500" icon={<AlertTriangle size={16} />}
                title={isUrdu ? "مضر اثرات" : "Adverse Effects"} items={data.sideEffects} />
              <ClinicalSection borderColor="border-blue-700" bgColor="bg-blue-700" icon={<XCircle size={16} />}
                title={isUrdu ? "استعمال کی ممانعت" : "Contraindications"} items={data.contraindications} />
              <ClinicalSection borderColor="border-blue-700" bgColor="bg-blue-700" icon={<AlertTriangle size={18} />}
                title={isUrdu ? "احتیاطی تدابیر" : "Warnings & Precautions"} items={data.warnings} />
              <ClinicalSection borderColor="border-blue-600" bgColor="bg-blue-600" icon={<Pill size={16} />}
                title={isUrdu ? "دوائی تعاملات" : "Drug Interactions"} items={data.drugInteractions} />
              <ClinicalSection borderColor="border-blue-500" bgColor="bg-blue-500" icon={<Utensils size={16} />}
                title={isUrdu ? "کھانے سے تعامل" : "Food Interactions"} items={data.foodInteractions} />
              <ClinicalSection borderColor="border-blue-600" bgColor="bg-blue-600" icon={<Clock size={16} />}
                title={isUrdu ? "طویل مدتی اثرات" : "Long-Term Effects"} items={data.longTermEffects} />
            </div>

            {/* Safe Alternatives */}
            {medicine.safeAlternatives?.length > 0 && (
              <div className="bg-blue-50 border-t-4 border-blue-600 p-5">
                <div className={`flex items-center gap-2 mb-4 ${isUrdu ? "flex-row-reverse" : ""}`}>
                  <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center font-bold text-sm rounded">
                    <CheckCircle size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    {isUrdu ? "متبادل ادویات" : "Alternative Medications"}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {medicine.safeAlternatives.map((alt, i) => (
                    <button key={i} onClick={() => navigate(`/search?q=${alt}`)}
                      className="bg-white border-2 border-blue-600 text-blue-700 text-sm font-bold px-5 py-2.5 hover:bg-blue-600 hover:text-white transition uppercase tracking-wide">
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