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
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-gray-900">Profile</h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage health information</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setTab("overview")} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${tab === "overview" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>Overview</button>
              <button onClick={() => setTab("edit")} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${tab === "edit" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>Edit</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5">
        {tab === "overview" ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                  {profile?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-gray-900">{profile?.name}</h2>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                    <Mail size={12} />
                    {profile?.email}
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {profile?.age && <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded">{profile.age}y</span>}
                    {profile?.gender && <span className="bg-purple-50 text-purple-700 text-xs font-medium px-2 py-0.5 rounded capitalize">{profile.gender}</span>}
                    {profile?.weight && <span className="bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded">{profile.weight}kg</span>}
                  </div>
                </div>
              </div>
            </div>

            {!hasProfile ? (
              <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                <Activity size={36} className="text-blue-600 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Complete Health Profile</h3>
                <p className="text-xs text-gray-500 mb-4">Add info for personalized alerts</p>
                <button onClick={() => setTab("edit")} className="bg-blue-600 text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-blue-700">
                  Complete Now
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: <Calendar size={16} />, label: "Age", value: ageGroup.label, bg: "bg-blue-50", color: "text-blue-600" },
                    { icon: <Scale size={16} />, label: "BMI", value: bmi.label, bg: "bg-green-50", color: "text-green-600" },
                    { icon: <Activity size={16} />, label: "Conditions", value: profile?.conditions?.length || 0, bg: "bg-red-50", color: "text-red-600" },
                    { icon: <AlertTriangle size={16} />, label: "Allergies", value: profile?.allergies?.length || 0, bg: "bg-amber-50", color: "text-amber-600" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 border">
                      <div className={`w-9 h-9 ${s.bg} ${s.color} rounded-lg flex items-center justify-center mb-2`}>{s.icon}</div>
                      <p className="text-base font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs font-medium text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {conditionWarnings.length > 0 && (
                    <div className="bg-white rounded-lg border border-red-200 overflow-hidden">
                      <div className="bg-red-500 px-4 py-2.5 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-white" />
                        <h3 className="text-xs font-semibold text-white">Condition Warnings</h3>
                      </div>
                      <div className="p-4 space-y-3">
                        {conditionWarnings.map((w, i) => (
                          <div key={i}>
                            <span className="bg-red-100 text-red-700 text-xs font-semibold uppercase px-2 py-0.5 rounded">{w.condition}</span>
                            <p className="text-xs text-gray-600 mt-1.5">{w.tip}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {w.avoid.map((m, j) => (
                                <span key={j} className="bg-red-50 border border-red-200 text-red-700 text-xs px-2 py-0.5 rounded">⛔ {m}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {allergyWarnings.length > 0 && (
                    <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
                      <div className="bg-amber-500 px-4 py-2.5 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-white" />
                        <h3 className="text-xs font-semibold text-white">Allergy Alerts</h3>
                      </div>
                      <div className="p-4 space-y-3">
                        {allergyWarnings.map((w, i) => (
                          <div key={i}>
                            <span className="bg-amber-100 text-amber-700 text-xs font-semibold uppercase px-2 py-0.5 rounded">{w.allergy}</span>
                            <p className="text-xs text-gray-600 mt-1.5">Avoid:</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {w.medicines.map((m, j) => (
                                <span key={j} className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-2 py-0.5 rounded">⚠️ {m}</span>
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
          <div className="bg-white rounded-lg border">
            <div className="bg-blue-600 px-4 py-2.5">
              <h2 className="text-xs font-semibold text-white">Edit Profile</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Gender</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Age</label>
                  <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Weight (kg)</label>
                  <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Conditions</label>
                <textarea value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })} placeholder="diabetes, asthma..." className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Allergies</label>
                <textarea value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="penicillin, aspirin..." className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm">
                  {saving ? <Loader className="animate-spin" size={14} /> : <><Save size={14} /> Save</>}
                </button>
                <button onClick={() => setTab("overview")} className="px-4 bg-gray-100 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-200 text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
