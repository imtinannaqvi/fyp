import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { Save, Loader, ArrowLeft } from "lucide-react";

const Field = ({ label, name, value, onChange, type = "text", placeholder, required }) => (
  <div className="w-full">
    <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}{required && " *"}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
    />
  </div>
);

const AddMedicine = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", brand: "", generic: "", category: "",
    description: "", dosage: "", price: "", stock: "",
    dosageAdult: "", dosageChild: "", dosageElderly: "", dosageNotes: "",
    sideEffects: "", longTermEffects: "", contraindications: "",
    foodInteractions: "", drugInteractions: "", warnings: "",
    requiresPrescription: false, isCommonlyMisused: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        brand: form.brand,
        generic: form.generic,
        category: form.category,
        description: form.description,
        dosage: form.dosage,
        price: form.price ? parseFloat(form.price) : 0,
        stock: form.stock ? parseInt(form.stock) : 0,
        dosageGuide: {
          adult: form.dosageAdult,
          child: form.dosageChild,
          elderly: form.dosageElderly,
          notes: form.dosageNotes,
        },
        sideEffects: form.sideEffects.split(",").map(s => s.trim()).filter(Boolean),
        longTermEffects: form.longTermEffects.split(",").map(s => s.trim()).filter(Boolean),
        contraindications: form.contraindications.split(",").map(s => s.trim()).filter(Boolean),
        foodInteractions: form.foodInteractions.split(",").map(s => s.trim()).filter(Boolean),
        drugInteractions: form.drugInteractions.split(",").map(s => s.trim()).filter(Boolean),
        warnings: form.warnings.split(",").map(s => s.trim()).filter(Boolean),
        requiresPrescription: form.requiresPrescription,
        isCommonlyMisused: form.isCommonlyMisused,
      };
      await API.post("/medicine", payload);
      toast.success("Medicine added successfully!");
      navigate("/admin/medicines");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add medicine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white border-b px-4 py-6">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate("/admin/medicines")} className="text-gray-400 hover:text-gray-600 transition shrink-0">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Add Medicine</h1>
            <p className="text-gray-500 text-xs md:text-sm mt-1">Add a new medicine to the database</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 border-b border-gray-50 pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Medicine Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Panadol" required />
            <Field label="Brand Name" name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. GSK" />
            <Field label="Generic Name" name="generic" value={form.generic} onChange={handleChange} placeholder="e.g. Paracetamol" />
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select category</option>
                {["painkiller","antibiotic","antiviral","antifungal","antihistamine","antacid","vitamin","supplement","cardiovascular","diabetes","respiratory","psychiatric","other"].map(c => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>
            <Field label="Price (Rs.)" name="price" type="number" value={form.price} onChange={handleChange} placeholder="0" />
            <Field label="Stock" name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="0" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              placeholder="What is this medicine used for..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2">
            <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer group">
              <input type="checkbox" name="requiresPrescription" checked={form.requiresPrescription} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              Requires Prescription
            </label>
            <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer group">
              <input type="checkbox" name="isCommonlyMisused" checked={form.isCommonlyMisused} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              Commonly Misused
            </label>
          </div>
        </div>

        {/* Dosage */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 border-b border-gray-50 pb-2">Dosage Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Standard Dosage" name="dosage" value={form.dosage} onChange={handleChange} placeholder="e.g. 500mg" />
            <Field label="Adult Dosage" name="dosageAdult" value={form.dosageAdult} onChange={handleChange} placeholder="e.g. 500mg every 6 hours" />
            <Field label="Child Dosage" name="dosageChild" value={form.dosageChild} onChange={handleChange} placeholder="e.g. 250mg every 6 hours" />
            <Field label="Elderly Dosage" name="dosageElderly" value={form.dosageElderly} onChange={handleChange} placeholder="e.g. 250mg every 8 hours" />
          </div>
          <Field label="Dosage Notes" name="dosageNotes" value={form.dosageNotes} onChange={handleChange} placeholder="Additional notes..." />
        </div>

        {/* Safety Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 border-b border-gray-50 pb-2">Safety Information</h2>
          <p className="text-[10px] md:text-xs text-gray-400">Separate multiple values with commas</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Side Effects" name="sideEffects" value={form.sideEffects} onChange={handleChange} placeholder="nausea, rash, headache" />
            <Field label="Long Term Effects" name="longTermEffects" value={form.longTermEffects} onChange={handleChange} placeholder="liver damage, kidney issues" />
            <Field label="Contraindications" name="contraindications" value={form.contraindications} onChange={handleChange} placeholder="liver disease, pregnancy" />
            <Field label="Food Interactions" name="foodInteractions" value={form.foodInteractions} onChange={handleChange} placeholder="avoid with alcohol" />
            <Field label="Drug Interactions" name="drugInteractions" value={form.drugInteractions} onChange={handleChange} placeholder="warfarin, aspirin" />
            <Field label="Warnings" name="warnings" value={form.warnings} onChange={handleChange} placeholder="do not exceed daily dose" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader size={18} className="animate-spin" /> Adding...</> : <><Save size={18} /> Add Medicine</>}
        </button>
      </form>
    </div>
  );
};

export default AddMedicine;