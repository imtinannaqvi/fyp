import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  User, Save, Loader, Edit3, AlertTriangle,
  ShieldCheck, Search, Zap, Info, Heart,
  Activity, Scale, Calendar, ChevronRight, X
} from "lucide-react";

const CONDITION_WARNINGS = {
  diabetes: { avoid: ["Dexamethasone", "Prednisolone", "Thiazide diuretics"], tip: "Steroids and some diuretics raise blood sugar. Monitor glucose regularly." },
  hypertension: { avoid: ["Ibuprofen", "Naproxen", "Pseudoephedrine", "Brufen"], tip: "NSAIDs and decongestants raise blood pressure. Use Paracetamol instead." },
  asthma: { avoid: ["Aspirin", "Ibuprofen", "Beta blockers", "Brufen"], tip: "NSAIDs and beta blockers can trigger asthma attacks. Avoid these." },
  "kidney disease": { avoid: ["Ibuprofen", "Naproxen", "Metformin"], tip: "NSAIDs reduce blood flow to kidneys. Use minimal doses of Paracetamol." },
  "liver disease": { avoid: ["Paracetamol (high dose)", "Methotrexate", "Statins"], tip: "Many medicines are metabolized by liver. Always consult before taking." },
  pregnancy: { avoid: ["Ibuprofen", "Aspirin", "Tetracycline", "Warfarin"], tip: "Many medicines are unsafe in pregnancy. Always consult your OB/GYN." },
  "heart disease": { avoid: ["Ibuprofen", "Naproxen", "Pseudoephedrine"], tip: "NSAIDs increase heart attack risk. Use Paracetamol for pain relief." },
};

const ALLERGY_WARNINGS = {
  penicillin: ["Amoxicillin", "Augmentin", "Ampicillin", "Cloxacillin"],
  sulfa: ["Septran", "Co-trimoxazole", "Sulfamethoxazole"],
  aspirin: ["Aspirin", "Disprin", "Low-dose Aspirin"],
  ibuprofen: ["Brufen", "Ibuprofen", "Nurofen", "Advil"],
  paracetamol: ["Panadol", "Paracetamol", "Calpol", "Dymadon"],
  codeine: ["Codeine", "Co-codamol", "Tylenol with Codeine"],
};

const getBMI = (weight) => {
  if (!weight) return null;
  if (weight < 50) return { label: "Underweight", color: "text-blue-600", bg: "bg-blue-50" };
  if (weight < 85) return { label: "Normal", color: "text-green-600", bg: "bg-green-50" };
  if (weight < 110) return { label: "Overweight", color: "text-yellow-600", bg: "bg-yellow-50" };
  return { label: "Obese", color: "text-red-600", bg: "bg-red-50" };
};

const getAgeGroup = (age) => {
  if (!age) return null;
  if (age < 12) return { label: "Child", note: "Paediatric dosing required" };
  if (age < 18) return { label: "Teen", note: "Restricted medicine list" };
  if (age < 60) return { label: "Adult", note: "Standard dosing" };
  return { label: "Elderly", note: "Lower doses recommended" };
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [tab, setTab] = useState("insights");
  const navigate = useNavigate();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get("/user/profile");
      setProfile(data.user);
      setForm({
        name: data.user.name || "",
        age: data.user.age || "",
        weight: data.user.weight || "",
        gender: data.user.gender || "",
        conditions: data.user.conditions?.join(", ") || "",
        allergies: data.user.allergies?.join(", ") || "",
      });
    } catch { toast.error("Failed to load profile"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        age: form.age ? parseInt(form.age) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        gender: form.gender || undefined,
        conditions: form.conditions ? form.conditions.split(",").map(s => s.trim()).filter(Boolean) : [],
        allergies: form.allergies ? form.allergies.split(",").map(s => s.trim()).filter(Boolean) : [],
      };
      const { data } = await API.put("/user/profile", payload);
      setProfile(data.user);
      setTab("insights");
      toast.success("Profile updated!");
    } catch { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Loader size={32} className="animate-spin text-blue-600" />
    </div>
  );

  const hasProfile = profile?.age || profile?.weight || profile?.conditions?.length || profile?.allergies?.length;
  const bmi = getBMI(profile?.weight);
  const ageGroup = getAgeGroup(profile?.age);

  const conditionWarnings = (profile?.conditions || [])
    .map(c => ({ condition: c, ...(CONDITION_WARNINGS[c.toLowerCase()] || null) }))
    .filter(w => w.avoid);

  const allergyWarnings = (profile?.allergies || [])
    .map(a => ({
      allergy: a,
      medicines: ALLERGY_WARNINGS[a.toLowerCase()] || [],
    }))
    .filter(w => w.medicines.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30 px-4 py-4 md:px-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Health Profile</h1>
            <p className="text-gray-500 text-xs md:text-sm mt-0.5">Personalized safety dashboard</p>
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-full md:w-fit">
            <button onClick={() => setTab("insights")} className={`flex-1 md:flex-none text-xs md:text-sm font-medium px-4 py-2 rounded-lg transition ${tab === "insights" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"}`}>
              Insights
            </button>
            <button onClick={() => setTab("edit")} className={`flex-1 md:flex-none text-xs md:text-sm font-medium px-4 py-2 rounded-lg transition ${tab === "edit" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"}`}>
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-4 md:space-y-6">
        {/* User Identity Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 flex items-center gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg shadow-blue-100">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{profile?.name}</h2>
            <p className="text-xs md:text-sm text-gray-400 truncate">{profile?.email}</p>
          </div>
          <div className="hidden sm:flex gap-2">
            {profile?.age && <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{profile.age} yrs</span>}
            {profile?.weight && <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">{profile.weight} kg</span>}
          </div>
        </div>

        {tab === "insights" ? (
          <div className="space-y-4 md:space-y-6">
            {!hasProfile ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-8 md:p-16 text-center">
                <div className="text-5xl mb-4">🏥</div>
                <h3 className="text-lg font-bold text-gray-800">Your profile is empty</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">Add your age and conditions to unlock safety alerts.</p>
                <button onClick={() => setTab("edit")} className="w-full md:w-auto bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition">Complete Now</button>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {[
                    { icon: <Calendar size={18} />, label: "Group", value: ageGroup?.label || "—", sub: ageGroup?.note, color: "text-blue-600", bg: "bg-blue-50" },
                    { icon: <Scale size={18} />, label: "Weight", value: bmi?.label || "Normal", color: "text-emerald-600", bg: "bg-emerald-50" },
                    { icon: <Activity size={18} />, label: "Conditions", value: profile?.conditions?.length || 0, color: "text-rose-600", bg: "bg-rose-50" },
                    { icon: <AlertTriangle size={18} />, label: "Allergies", value: profile?.allergies?.length || 0, color: "text-amber-600", bg: "bg-amber-50" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                      <div className={`w-8 h-8 ${s.bg} ${s.color} rounded-lg flex items-center justify-center mb-3`}>{s.icon}</div>
                      <p className="text-sm font-bold text-gray-900">{s.value}</p>
                      <p className="text-[10px] uppercase tracking-wider font-black text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Warnings Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {conditionWarnings.length > 0 && (
                    <div className="bg-white rounded-2xl border border-red-100 overflow-hidden shadow-sm">
                      <div className="bg-red-50 px-4 py-3 flex items-center gap-2 border-b border-red-100">
                        <AlertTriangle size={16} className="text-red-600" />
                        <h3 className="text-sm font-bold text-red-800">Condition Risks</h3>
                      </div>
                      <div className="p-4 space-y-4">
                        {conditionWarnings.map((w, i) => (
                          <div key={i} className="space-y-2">
                            <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">{w.condition}</span>
                            <div className="flex flex-wrap gap-1.5">
                              {w.avoid.map((m, j) => (
                                <span key={j} className="bg-white border border-red-100 text-red-700 text-[11px] px-2 py-1 rounded-md font-medium">⛔ {m}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {allergyWarnings.length > 0 && (
                    <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden shadow-sm">
                      <div className="bg-amber-50 px-4 py-3 flex items-center gap-2 border-b border-amber-100">
                        <ShieldCheck size={16} className="text-amber-600" />
                        <h3 className="text-sm font-bold text-amber-800">Allergy Alerts</h3>
                      </div>
                      <div className="p-4 space-y-4">
                        {allergyWarnings.map((w, i) => (
                          <div key={i} className="space-y-2">
                            <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">{w.allergy}</span>
                            <div className="flex flex-wrap gap-1.5">
                              {w.medicines.map((m, j) => (
                                <span key={j} className="bg-white border border-amber-100 text-amber-700 text-[11px] px-2 py-1 rounded-md font-medium">⚠️ {m}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Responsive Edit Form */
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Full Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Age (Yrs)</label>
                <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Weight (Kg)</label>
                <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Medical Conditions (Comma separated)</label>
              <textarea value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })} placeholder="diabetes, asthma..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none" />
            </div>

            <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
              {saving ? <Loader className="animate-spin" size={20} /> : <><Save size={20} /> Update Profile</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;