import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { Save, Loader, AlertTriangle, ShieldCheck, Mail, Activity, Scale, Calendar } from "lucide-react";

const CONDITION_WARNINGS = {
  diabetes: { avoid: ["Dexamethasone", "Prednisolone", "Thiazide diuretics"], tip: "Steroids raise blood sugar. Monitor glucose regularly." },
  hypertension: { avoid: ["Ibuprofen", "Naproxen", "Pseudoephedrine"], tip: "NSAIDs raise blood pressure. Use Paracetamol instead." },
  asthma: { avoid: ["Aspirin", "Ibuprofen", "Beta blockers"], tip: "NSAIDs can trigger asthma attacks." },
  "kidney disease": { avoid: ["Ibuprofen", "Naproxen", "Metformin"], tip: "NSAIDs reduce kidney blood flow." },
  "liver disease": { avoid: ["Paracetamol (high dose)", "Methotrexate"], tip: "Many medicines metabolized by liver." },
  pregnancy: { avoid: ["Ibuprofen", "Aspirin", "Tetracycline"], tip: "Consult OB/GYN before taking medicines." },
  "heart disease": { avoid: ["Ibuprofen", "Naproxen"], tip: "NSAIDs increase heart attack risk." },
};

const ALLERGY_WARNINGS = {
  penicillin: ["Amoxicillin", "Augmentin", "Ampicillin"],
  sulfa: ["Septran", "Co-trimoxazole"],
  aspirin: ["Aspirin", "Disprin"],
  ibuprofen: ["Brufen", "Ibuprofen", "Advil"],
  paracetamol: ["Panadol", "Paracetamol", "Calpol"],
};

const getBMI = (weight) => {
  if (!weight) return { label: "—" };
  if (weight < 50) return { label: "Underweight" };
  if (weight < 85) return { label: "Normal" };
  if (weight < 110) return { label: "Overweight" };
  return { label: "Obese" };
};

const getAgeGroup = (age) => {
  if (!age) return { label: "—" };
  if (age < 12) return { label: "Child" };
  if (age < 18) return { label: "Teen" };
  if (age < 60) return { label: "Adult" };
  return { label: "Elderly" };
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [tab, setTab] = useState("overview");

  useEffect(() => { 
    window.scrollTo(0, 0);
    fetchProfile(); 
  }, []);

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
    } catch { toast.error("Failed to load"); }
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
      setTab("overview");
      toast.success("Updated!");
    } catch { toast.error("Failed to update"); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Loader size={28} className="animate-spin text-blue-600" />
    </div>
  );

  const hasProfile = profile?.age || profile?.weight || profile?.conditions?.length || profile?.allergies?.length;
  const bmi = getBMI(profile?.weight);
  const ageGroup = getAgeGroup(profile?.age);

  const conditionWarnings = (profile?.conditions || [])
    .map(c => ({ condition: c, ...(CONDITION_WARNINGS[c.toLowerCase()] || null) }))
    .filter(w => w.avoid);

  const allergyWarnings = (profile?.allergies || [])
    .map(a => ({ allergy: a, medicines: ALLERGY_WARNINGS[a.toLowerCase()] || [] }))
    .filter(w => w.medicines.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-gray-600">Manage your health information</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setTab("overview")} className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "overview" ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"}`}>Overview</button>
            <button onClick={() => setTab("edit")} className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "edit" ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"}`}>Edit</button>
          </div>
        </div>
        {tab === "overview" ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md">
                  {profile?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{profile?.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Mail size={16} />
                    {profile?.email}
                  </div>
                  <div className="flex gap-2">
                    {profile?.age && <span className="bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1 rounded-lg">{profile.age} years</span>}
                    {profile?.gender && <span className="bg-purple-50 text-purple-700 text-sm font-semibold px-3 py-1 rounded-lg capitalize">{profile.gender}</span>}
                    {profile?.weight && <span className="bg-green-50 text-green-700 text-sm font-semibold px-3 py-1 rounded-lg">{profile.weight} kg</span>}
                  </div>
                </div>
              </div>
            </div>

            {!hasProfile ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Activity size={40} className="text-blue-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Health Profile</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">Add your health information for personalized medicine alerts and recommendations</p>
                <button onClick={() => setTab("edit")} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2">
                  Complete Now
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: <Calendar size={18} />, label: "Age Group", value: ageGroup.label, color: "text-blue-600", bg: "bg-blue-50" },
                    { icon: <Scale size={18} />, label: "BMI Status", value: bmi.label, color: "text-green-600", bg: "bg-green-50" },
                    { icon: <Activity size={18} />, label: "Conditions", value: profile?.conditions?.length || 0, color: "text-red-600", bg: "bg-red-50" },
                    { icon: <AlertTriangle size={18} />, label: "Allergies", value: profile?.allergies?.length || 0, color: "text-amber-600", bg: "bg-amber-50" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                      <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
                        <div className={s.color}>{s.icon}</div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{s.value}</p>
                      <p className="text-sm font-medium text-gray-600">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {conditionWarnings.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-red-600 px-6 py-4 flex items-center gap-3">
                        <AlertTriangle size={20} className="text-white" />
                        <h3 className="text-base font-bold text-white">Condition Warnings</h3>
                      </div>
                      <div className="p-6 space-y-5">
                        {conditionWarnings.map((w, i) => (
                          <div key={i} className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                            <span className="inline-block bg-red-100 text-red-700 text-sm font-bold uppercase px-3 py-1 rounded-lg mb-3">{w.condition}</span>
                            <p className="text-sm text-gray-700 mb-3 leading-relaxed">{w.tip}</p>
                            <div className="flex flex-wrap gap-2">
                              {w.avoid.map((m, j) => (
                                <span key={j} className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg">⛔ {m}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {allergyWarnings.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-amber-600 px-6 py-4 flex items-center gap-3">
                        <ShieldCheck size={20} className="text-white" />
                        <h3 className="text-base font-bold text-white">Allergy Alerts</h3>
                      </div>
                      <div className="p-6 space-y-5">
                        {allergyWarnings.map((w, i) => (
                          <div key={i} className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                            <span className="inline-block bg-amber-100 text-amber-700 text-sm font-bold uppercase px-3 py-1 rounded-lg mb-3">{w.allergy}</span>
                            <p className="text-sm text-gray-700 mb-3">Avoid these medicines:</p>
                            <div className="flex flex-wrap gap-2">
                              {w.medicines.map((m, j) => (
                                <span key={j} className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-lg">⚠️ {m}</span>
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-base font-bold text-white">Edit Profile</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Gender</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Age</label>
                  <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="Enter age" className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Weight (kg)</label>
                  <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="Enter weight" className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Medical Conditions</label>
                <textarea value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })} placeholder="e.g., diabetes, asthma, hypertension (comma separated)" className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-24 resize-none transition" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Allergies</label>
                <textarea value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="e.g., penicillin, aspirin, ibuprofen (comma separated)" className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-24 resize-none transition" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-200 hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm">
                  {saving ? <Loader className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
                </button>
                <button onClick={() => setTab("overview")} className="px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl transition-all text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
