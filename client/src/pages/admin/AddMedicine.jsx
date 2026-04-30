import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import {
  Save, Loader, ArrowLeft, Pill, Clock, ShieldAlert,
  CheckCircle, AlertTriangle, Info, Tag, DollarSign,
  Package, FileText, ChevronRight
} from "lucide-react";

const CATEGORIES = [
  "painkiller","antibiotic","antiviral","antifungal","antihistamine",
  "antacid","vitamin","supplement","cardiovascular","diabetes",
  "respiratory","psychiatric","other"
];

const AddMedicine = () => {
  const navigate   = useNavigate();
  const { isDark } = useTheme();
  const [loading,  setLoading]  = useState(false);
  const [step,     setStep]     = useState(0); // 0=basic, 1=dosage, 2=safety
  const [form, setForm] = useState({
    name: "", brand: "", generic: "", category: "",
    description: "", dosage: "", price: "", stock: "",
    dosageAdult: "", dosageChild: "", dosageElderly: "", dosageNotes: "",
    sideEffects: "", longTermEffects: "", contraindications: "",
    foodInteractions: "", drugInteractions: "", warnings: "",
    requiresPrescription: false, isCommonlyMisused: false,
  });

  const bg   = isDark ? "#0f172a" : "#f8fafc";
  const card = isDark ? "#1e293b" : "#ffffff";
  const bdr  = isDark ? "#334155" : "#e5e7eb";
  const txt  = isDark ? "#f1f5f9" : "#111827";
  const sub  = isDark ? "#64748b" : "#9ca3af";
  const inBg = isDark ? "#0f172a" : "#f9fafb";
  const inBdrFocus = "#3b82f6";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.brand) { toast.error("Medicine name and brand are required"); return; }
    setLoading(true);
    try {
      await API.post("/medicine", {
        name: form.name, brand: form.brand, generic: form.generic,
        category: form.category, description: form.description,
        dosage: form.dosage,
        price: form.price ? parseFloat(form.price) : 0,
        stock: form.stock ? parseInt(form.stock) : 0,
        dosageGuide: { adult: form.dosageAdult, child: form.dosageChild, elderly: form.dosageElderly, notes: form.dosageNotes },
        sideEffects:       form.sideEffects.split(",").map(s => s.trim()).filter(Boolean),
        longTermEffects:   form.longTermEffects.split(",").map(s => s.trim()).filter(Boolean),
        contraindications: form.contraindications.split(",").map(s => s.trim()).filter(Boolean),
        foodInteractions:  form.foodInteractions.split(",").map(s => s.trim()).filter(Boolean),
        drugInteractions:  form.drugInteractions.split(",").map(s => s.trim()).filter(Boolean),
        warnings:          form.warnings.split(",").map(s => s.trim()).filter(Boolean),
        requiresPrescription: form.requiresPrescription,
        isCommonlyMisused:    form.isCommonlyMisused,
      });
      toast.success("Medicine added successfully!");
      navigate("/admin/medicines");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add medicine");
    } finally { setLoading(false); }
  };

  // ── Reusable input ────────────────────────────────────────────────────────
  const Input = ({ label, name, type = "text", placeholder, required, hint }) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: sub }}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {hint && <span className="text-[10px]" style={{ color: sub }}>{hint}</span>}
      </div>
      <input type={type} name={name} value={form[name]} onChange={handleChange}
        placeholder={placeholder} required={required}
        style={{ backgroundColor: inBg, borderColor: bdr, color: txt }}
        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400" />
    </div>
  );

  const Textarea = ({ label, name, placeholder, rows = 3, hint }) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: sub }}>{label}</label>
        {hint && <span className="text-[10px]" style={{ color: sub }}>{hint}</span>}
      </div>
      <textarea name={name} value={form[name]} onChange={handleChange}
        placeholder={placeholder} rows={rows}
        style={{ backgroundColor: inBg, borderColor: bdr, color: txt }}
        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none placeholder:text-gray-400" />
    </div>
  );

  // ── Steps config ──────────────────────────────────────────────────────────
  const steps = [
    { label: "Basic Info",   icon: <Pill size={16} />,        color: "blue"   },
    { label: "Dosage",       icon: <Clock size={16} />,       color: "indigo" },
    { label: "Safety",       icon: <ShieldAlert size={16} />, color: "red"    },
  ];

  const stepColors = {
    blue:   { active: "bg-blue-600 text-white",   done: "bg-blue-100 text-blue-600",   ring: "ring-blue-200"   },
    indigo: { active: "bg-indigo-600 text-white", done: "bg-indigo-100 text-indigo-600", ring: "ring-indigo-200" },
    red:    { active: "bg-red-500 text-white",    done: "bg-red-100 text-red-500",     ring: "ring-red-200"    },
  };

  return (
    <div className="min-h-full" style={{ backgroundColor: bg }}>

      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: card, borderBottom: `1px solid ${bdr}` }}
        className="px-6 py-4 flex items-center gap-4 animate-fade-up sticky top-0 z-10">
        <button onClick={() => navigate("/admin/medicines")}
          className="p-2 rounded-xl transition hover:scale-105"
          style={{ color: sub, backgroundColor: isDark ? "#334155" : "#f3f4f6" }}>
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold" style={{ color: txt }}>Add New Medicine</h1>
          <p className="text-xs" style={{ color: sub }}>Fill in the details to add a medicine to the database</p>
        </div>
        <button type="button" onClick={handleSubmit} disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm hover:scale-105 active:scale-95">
          {loading ? <><Loader size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Medicine</>}
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">

        {/* ── Step Indicator ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-0 mb-8 animate-fade-up" style={{ animationDelay: "60ms" }}>
          {steps.map((s, i) => {
            const c = stepColors[s.color];
            const isActive = step === i;
            const isDone   = step > i;
            return (
              <div key={i} className="flex items-center flex-1">
                <button onClick={() => setStep(i)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all w-full ${
                    isActive ? `${c.active} shadow-md ring-4 ${c.ring}` :
                    isDone   ? `${c.done}` :
                    "text-slate-400 hover:text-slate-200"
                  }`}
                  style={!isActive && !isDone ? { color: sub } : {}}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    isActive ? "bg-white/20" : isDone ? "bg-current/10" : isDark ? "bg-slate-600" : "bg-gray-200"
                  }`}>
                    {isDone ? <CheckCircle size={14} /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < steps.length - 1 && (
                  <ChevronRight size={16} className="mx-1 shrink-0" style={{ color: sub }} />
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── STEP 0: Basic Information ─────────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-5 animate-fade-up" style={{ animationDelay: "120ms" }}>

              {/* Identity */}
              <div style={{ backgroundColor: card, borderColor: bdr }} className="rounded-2xl border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: bdr, backgroundColor: isDark ? "#1e293b" : "#f8fafc" }}>
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Pill size={15} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm" style={{ color: txt }}>Medicine Identity</h2>
                    <p className="text-xs" style={{ color: sub }}>Core identification details</p>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Medicine Name" name="name" placeholder="e.g. Panadol" required />
                  <Input label="Brand Name"    name="brand" placeholder="e.g. GlaxoSmithKline" required />
                  <Input label="Generic / INN Name" name="generic" placeholder="e.g. Paracetamol" />
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: sub }}>Category</label>
                    <select name="category" value={form.category} onChange={handleChange}
                      style={{ backgroundColor: inBg, borderColor: bdr, color: form.category ? txt : "#9ca3af" }}
                      className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                      <option value="">Select pharmacological category</option>
                      {CATEGORIES.map(c => (
                        <option key={c} value={c} style={{ color: txt, backgroundColor: card }} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ backgroundColor: card, borderColor: bdr }} className="rounded-2xl border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: bdr, backgroundColor: isDark ? "#1e293b" : "#f8fafc" }}>
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <FileText size={15} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm" style={{ color: txt }}>Description</h2>
                    <p className="text-xs" style={{ color: sub }}>What this medicine is used for</p>
                  </div>
                </div>
                <div className="p-6">
                  <Textarea name="description" placeholder="Describe what this medicine treats, how it works, and key clinical uses..." rows={4} />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div style={{ backgroundColor: card, borderColor: bdr }} className="rounded-2xl border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: bdr, backgroundColor: isDark ? "#1e293b" : "#f8fafc" }}>
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <Package size={15} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm" style={{ color: txt }}>Pricing & Inventory</h2>
                    <p className="text-xs" style={{ color: sub }}>Price and stock information</p>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input label="Price" name="price" type="number" placeholder="0.00" hint="PKR (Rs.)" />
                  <Input label="Stock Quantity" name="stock" type="number" placeholder="0" hint="Units" />
                </div>
              </div>

              {/* Flags */}
              <div style={{ backgroundColor: card, borderColor: bdr }} className="rounded-2xl border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: bdr, backgroundColor: isDark ? "#1e293b" : "#f8fafc" }}>
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                    <Tag size={15} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm" style={{ color: txt }}>Classification Flags</h2>
                    <p className="text-xs" style={{ color: sub }}>Regulatory and safety classification</p>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: "requiresPrescription", label: "Requires Prescription", desc: "Only dispensed with a valid doctor's prescription", icon: <ShieldAlert size={18} className="text-red-500" /> },
                    { name: "isCommonlyMisused",    label: "Commonly Misused",      desc: "This medicine has a known history of misuse or abuse",  icon: <AlertTriangle size={18} className="text-amber-500" /> },
                  ].map(({ name, label, desc, icon }) => (
                    <label key={name} className="flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all"
                      style={{
                        borderColor: form[name] ? "#3b82f6" : bdr,
                        backgroundColor: form[name] ? (isDark ? "#1e3a5f" : "#eff6ff") : inBg
                      }}>
                      <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} className="hidden" />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        form[name] ? "bg-blue-600 border-blue-600" : isDark ? "border-slate-500" : "border-gray-300"
                      }`}>
                        {form[name] && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          {icon}
                          <p className="text-sm font-semibold" style={{ color: txt }}>{label}</p>
                        </div>
                        <p className="text-xs" style={{ color: sub }}>{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button type="button" onClick={() => setStep(1)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]">
                Continue to Dosage <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── STEP 1: Dosage ────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-up" style={{ animationDelay: "120ms" }}>
              <div style={{ backgroundColor: card, borderColor: bdr }} className="rounded-2xl border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: bdr, backgroundColor: isDark ? "#1e293b" : "#f8fafc" }}>
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Clock size={15} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm" style={{ color: txt }}>Dosage Guidelines</h2>
                    <p className="text-xs" style={{ color: sub }}>Standard dosing information for different patient groups</p>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <Input label="Standard Dosage" name="dosage" placeholder="e.g. 500mg every 6–8 hours" hint="General" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div style={{ backgroundColor: isDark ? "#0f172a" : "#eff6ff", borderColor: isDark ? "#2563eb" : "#bfdbfe" }}
                      className="rounded-xl border p-4 space-y-3">
                      <p className="text-xs font-bold text-blue-500 uppercase tracking-wide">Adult Dose</p>
                      <input name="dosageAdult" value={form.dosageAdult} onChange={handleChange}
                        placeholder="e.g. 500mg every 6 hours"
                        style={{ backgroundColor: inBg, borderColor: bdr, color: txt }}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                    </div>
                    <div style={{ backgroundColor: isDark ? "#052e16" : "#f0fdf4", borderColor: isDark ? "#16a34a" : "#86efac" }}
                      className="rounded-xl border p-4 space-y-3">
                      <p className="text-xs font-bold text-green-500 uppercase tracking-wide">Child Dose</p>
                      <input name="dosageChild" value={form.dosageChild} onChange={handleChange}
                        placeholder="e.g. 250mg every 6 hours"
                        style={{ backgroundColor: inBg, borderColor: bdr, color: txt }}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
                    </div>
                    <div style={{ backgroundColor: isDark ? "#1e1b4b" : "#eef2ff", borderColor: isDark ? "#6366f1" : "#c7d2fe" }}
                      className="rounded-xl border p-4 space-y-3">
                      <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide">Elderly Dose</p>
                      <input name="dosageElderly" value={form.dosageElderly} onChange={handleChange}
                        placeholder="e.g. 250mg every 8 hours"
                        style={{ backgroundColor: inBg, borderColor: bdr, color: txt }}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                  </div>
                  <Textarea label="Dosage Notes" name="dosageNotes" placeholder="e.g. Take with food. Do not crush tablets. Avoid in renal impairment." rows={2} />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(0)}
                  className="flex-1 py-3.5 rounded-xl border-2 font-semibold text-sm transition hover:scale-[1.01]"
                  style={{ borderColor: bdr, color: txt }}>
                  Back
                </button>
                <button type="button" onClick={() => setStep(2)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]">
                  Continue to Safety <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Safety ────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-up" style={{ animationDelay: "120ms" }}>

              <div style={{ backgroundColor: isDark ? "#1e293b" : "#fff7ed", borderColor: isDark ? "#334155" : "#fed7aa" }}
                className="rounded-xl border px-4 py-3 flex items-center gap-3">
                <Info size={15} className="text-amber-500 shrink-0" />
                <p className="text-xs" style={{ color: isDark ? "#fbbf24" : "#92400e" }}>
                  Separate multiple values with commas — e.g. <strong>nausea, headache, dizziness</strong>
                </p>
              </div>

              <div style={{ backgroundColor: card, borderColor: bdr }} className="rounded-2xl border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: bdr, backgroundColor: isDark ? "#1e293b" : "#f8fafc" }}>
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <ShieldAlert size={15} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm" style={{ color: txt }}>Safety & Clinical Information</h2>
                    <p className="text-xs" style={{ color: sub }}>Adverse effects, warnings and interactions</p>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Textarea label="Side Effects"       name="sideEffects"       placeholder="nausea, rash, headache, dizziness" rows={2} />
                  <Textarea label="Long Term Effects"  name="longTermEffects"   placeholder="liver damage, kidney issues, bone loss" rows={2} />
                  <Textarea label="Contraindications"  name="contraindications" placeholder="liver disease, pregnancy, renal failure" rows={2} />
                  <Textarea label="Warnings"           name="warnings"          placeholder="do not exceed daily dose, avoid in children under 2" rows={2} />
                  <Textarea label="Drug Interactions"  name="drugInteractions"  placeholder="warfarin, aspirin, methotrexate" rows={2} />
                  <Textarea label="Food Interactions"  name="foodInteractions"  placeholder="avoid with alcohol, dairy products, grapefruit" rows={2} />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-xl border-2 font-semibold text-sm transition hover:scale-[1.01]"
                  style={{ borderColor: bdr, color: txt }}>
                  Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-200">
                  {loading
                    ? <><Loader size={17} className="animate-spin" /> Saving Medicine...</>
                    : <><Save size={17} /> Save Medicine</>}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default AddMedicine;
