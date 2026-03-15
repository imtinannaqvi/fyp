// pages/user/Reminders.jsx
import { useState, useEffect } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  Bell, Plus, Trash2, Power, Clock, Phone,
  Pill, Calendar, Loader, CheckCircle, PauseCircle,
  AlertTriangle, ShieldAlert, PackageX
} from "lucide-react";
import MediBot from "../../components/MediBot";

const FREQUENCIES = [
  { value: "daily",     label: "Daily" },
  { value: "weekly",    label: "Weekly" },
  { value: "monthly",   label: "Monthly" },
  { value: "as-needed", label: "As Needed" },
];

const DEFAULT_REMINDER = {
  phone: "", medicineName: "", dosage: "", frequency: "daily",
  times: ["08:00"], startDate: new Date().toISOString().split("T")[0],
  endDate: "", notes: "",
};

const DEFAULT_EXPIRY = {
  phone: "", medicineName: "", expiryDate: "", batchNumber: "", notes: "",
};

// ── Days left helper ──────────────────────────────────────────────────────────
const getDaysLeft = (expiryDate) => {
  const diff = new Date(expiryDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const ExpiryBadge = ({ expiryDate }) => {
  const days = getDaysLeft(expiryDate);
  if (days < 0)  return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-200 text-gray-600">Expired</span>;
  if (days <= 7) return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">⚠️ {days}d left</span>;
  if (days <= 30) return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200">{days}d left</span>;
  return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">{days}d left</span>;
};

const Reminders = () => {
  const [activeTab, setActiveTab]   = useState("reminders"); // "reminders" | "expiry"

  // Reminders state
  const [reminders, setReminders]   = useState([]);
  const [loadingR, setLoadingR]     = useState(false);
  const [savingR, setSavingR]       = useState(false);
  const [showRForm, setShowRForm]   = useState(false);
  const [rForm, setRForm]           = useState(DEFAULT_REMINDER);

  // Expiry state
  const [expiries, setExpiries]     = useState([]);
  const [loadingE, setLoadingE]     = useState(false);
  const [savingE, setSavingE]       = useState(false);
  const [showEForm, setShowEForm]   = useState(false);
  const [eForm, setEForm]           = useState(DEFAULT_EXPIRY);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchReminders();
    fetchExpiries();
  }, []);

  // ── Reminders ───────────────────────────────────────────────────────────────
  const fetchReminders = async () => {
    setLoadingR(true);
    try {
      const { data } = await API.get("/reminders");
      setReminders(data.reminders || []);
    } catch { toast.error("Failed to load reminders"); }
    finally { setLoadingR(false); }
  };

  const handleRSubmit = async () => {
    if (!rForm.phone || !rForm.medicineName || !rForm.dosage || !rForm.startDate) {
      toast.error("Please fill all required fields"); return;
    }
    setSavingR(true);
    try {
      await API.post("/reminders", { ...rForm, times: rForm.times.filter(t => t) });
      toast.success("Reminder created! Check your WhatsApp 📱");
      setShowRForm(false);
      setRForm(DEFAULT_REMINDER);
      fetchReminders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create reminder");
    } finally { setSavingR(false); }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await API.patch(`/reminders/${id}/toggle`);
      setReminders(prev => prev.map(r => r._id === id ? { ...r, isActive: data.isActive } : r));
      toast.success(data.message);
    } catch { toast.error("Failed to toggle"); }
  };

  const handleDeleteR = async (id) => {
    if (!window.confirm("Delete this reminder?")) return;
    try {
      await API.delete(`/reminders/${id}`);
      setReminders(prev => prev.filter(r => r._id !== id));
      toast.success("Reminder deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const addTime = () => {
    if (rForm.times.length >= 4) { toast.error("Max 4 times"); return; }
    setRForm(prev => ({ ...prev, times: [...prev.times, "12:00"] }));
  };

  // ── Expiry Tracker ──────────────────────────────────────────────────────────
  const fetchExpiries = async () => {
    setLoadingE(true);
    try {
      const { data } = await API.get("/expiry");
      setExpiries(data.trackers || []);
    } catch { toast.error("Failed to load expiry trackers"); }
    finally { setLoadingE(false); }
  };

  const handleESubmit = async () => {
    if (!eForm.phone || !eForm.medicineName || !eForm.expiryDate) {
      toast.error("Phone, medicine name and expiry date are required"); return;
    }
    setSavingE(true);
    try {
      await API.post("/expiry", eForm);
      toast.success("Expiry tracker created! Check your WhatsApp 📱");
      setShowEForm(false);
      setEForm(DEFAULT_EXPIRY);
      fetchExpiries();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create tracker");
    } finally { setSavingE(false); }
  };

  const handleDeleteE = async (id) => {
    if (!window.confirm("Delete this expiry tracker?")) return;
    try {
      await API.delete(`/expiry/${id}`);
      setExpiries(prev => prev.filter(e => e._id !== id));
      toast.success("Tracker deleted");
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <>
    <div className="min-h-screen bg-white">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Medicine Manager</h1>
            <p className="text-gray-600 text-sm">Reminders & Expiry Tracker via WhatsApp</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1 mb-8">
          <button
            onClick={() => setActiveTab("reminders")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "reminders" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}>
            <Bell size={16} /> Reminders
            {reminders.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{reminders.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("expiry")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "expiry" ? "bg-white text-orange-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}>
            <PackageX size={16} /> Expiry Tracker
            {expiries.filter(e => getDaysLeft(e.expiryDate) <= 7).length > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {expiries.filter(e => getDaysLeft(e.expiryDate) <= 7).length}
              </span>
            )}
          </button>
        </div>

        {/* ── REMINDERS TAB ─────────────────────────────────────────────────── */}
        {activeTab === "reminders" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Bell size={18} className="text-blue-600" /> Medicine Reminders
              </h2>
              <button onClick={() => setShowRForm(!showRForm)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition text-sm">
                <Plus size={16} /> New Reminder
              </button>
            </div>

            {/* Reminder Form */}
            {showRForm && (
              <div className="bg-white border-2 border-blue-200 rounded-xl shadow-sm p-5 mb-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus size={16} className="text-blue-600" /> Set New Reminder
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1.5 block">WhatsApp Number *</label>
                    <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 transition">
                      <span className="bg-gray-100 px-3 py-3 text-sm text-gray-600 border-r border-gray-300 font-medium">+92</span>
                      <input type="tel" placeholder="3001234567"
                        value={rForm.phone.replace(/^92/, "")}
                        onChange={e => setRForm(prev => ({ ...prev, phone: "92" + e.target.value.replace(/\D/g, "") }))}
                        className="flex-1 px-3 py-3 text-sm outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1.5 block">Medicine Name *</label>
                    <input type="text" placeholder="e.g. Panadol..." value={rForm.medicineName}
                      onChange={e => setRForm(prev => ({ ...prev, medicineName: e.target.value }))}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-blue-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1.5 block">Dosage *</label>
                    <input type="text" placeholder="e.g. 500mg..." value={rForm.dosage}
                      onChange={e => setRForm(prev => ({ ...prev, dosage: e.target.value }))}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-blue-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1.5 block">Frequency</label>
                    <select value={rForm.frequency} onChange={e => setRForm(prev => ({ ...prev, frequency: e.target.value }))}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-blue-500 outline-none transition bg-white">
                      {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1.5 block">Start Date *</label>
                    <input type="date" value={rForm.startDate} min={new Date().toISOString().split("T")[0]}
                      onChange={e => setRForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-blue-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1.5 block">End Date (Optional)</label>
                    <input type="date" value={rForm.endDate} min={rForm.startDate}
                      onChange={e => setRForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-blue-500 outline-none transition" />
                  </div>
                </div>

                {/* Times */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-600 uppercase">Reminder Times *</label>
                    <button onClick={addTime} className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                      <Plus size={13} /> Add Time
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rForm.times.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                        <Clock size={13} className="text-blue-600" />
                        <input type="time" value={t}
                          onChange={e => { const u = [...rForm.times]; u[i] = e.target.value; setRForm(prev => ({ ...prev, times: u })); }}
                          className="text-sm font-semibold text-gray-800 bg-transparent outline-none" />
                        {rForm.times.length > 1 && (
                          <button onClick={() => setRForm(prev => ({ ...prev, times: prev.times.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-600">✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1.5 block">Notes (Optional)</label>
                  <textarea placeholder="e.g. Take after meals..." value={rForm.notes}
                    onChange={e => setRForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2} className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-blue-500 outline-none transition resize-none" />
                </div>

                <div className="flex gap-3">
                  <button onClick={handleRSubmit} disabled={savingR}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 text-sm">
                    {savingR ? <><Loader size={15} className="animate-spin" /> Setting...</> : <><Bell size={15} /> Set WhatsApp Reminder</>}
                  </button>
                  <button onClick={() => { setShowRForm(false); setRForm(DEFAULT_REMINDER); }}
                    className="px-5 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Reminders List */}
            {loadingR ? (
              <div className="flex justify-center py-12"><Loader className="animate-spin text-blue-600" size={28} /></div>
            ) : reminders.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
                <Bell size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No reminders yet</p>
                <p className="text-sm text-gray-400 mt-1">Click "New Reminder" to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map(r => (
                  <div key={r._id} className={`border-2 rounded-xl p-4 transition ${r.isActive ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50 opacity-70"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                            <Pill size={16} className="text-blue-600" /> {r.medicineName}
                          </h3>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                            {r.isActive ? "Active" : "Paused"}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full capitalize">{r.frequency}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
                          <span className="flex items-center gap-1"><Pill size={12} className="text-gray-400" /> {r.dosage}</span>
                          <span className="flex items-center gap-1"><Phone size={12} className="text-gray-400" /> +{r.phone}</span>
                          <span className="flex items-center gap-1"><Calendar size={12} className="text-gray-400" /> {new Date(r.startDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock size={12} className="text-gray-400" /> {r.times?.join(", ")}</span>
                        </div>
                        {r.notes && <p className="text-xs text-gray-400 mt-1.5 italic">📝 {r.notes}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => handleToggle(r._id)} title={r.isActive ? "Pause" : "Activate"}
                          className={`p-2 rounded-lg border-2 transition ${r.isActive ? "border-orange-300 text-orange-500 hover:bg-orange-50" : "border-green-300 text-green-500 hover:bg-green-50"}`}>
                          <Power size={14} />
                        </button>
                        <button onClick={() => handleDeleteR(r._id)} className="p-2 rounded-lg border-2 border-red-200 text-red-500 hover:bg-red-50 transition">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info */}
            <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex gap-3 items-start">
              <span className="text-xl">📱</span>
              <p className="text-sm text-green-700 leading-relaxed">
                <strong className="text-green-800">How it works:</strong> After setting a reminder, you'll get a WhatsApp confirmation. At your scheduled time, our AI sends a personalized reminder to your WhatsApp.
              </p>
            </div>
          </div>
        )}

        {/* ── EXPIRY TRACKER TAB ────────────────────────────────────────────── */}
        {activeTab === "expiry" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <PackageX size={18} className="text-orange-600" /> Medicine Expiry Tracker
              </h2>
              <button onClick={() => setShowEForm(!showEForm)}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition text-sm">
                <Plus size={16} /> Track Medicine
              </button>
            </div>

            {/* Expiry warning banner */}
            {expiries.filter(e => getDaysLeft(e.expiryDate) <= 7 && getDaysLeft(e.expiryDate) >= 0).length > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-5 flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-800">
                    {expiries.filter(e => getDaysLeft(e.expiryDate) <= 7 && getDaysLeft(e.expiryDate) >= 0).length} medicine(s) expiring within 7 days!
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">Check your medicines and get replacements if needed.</p>
                </div>
              </div>
            )}

            {/* Expiry Form */}
            {showEForm && (
              <div className="bg-white border-2 border-orange-200 rounded-xl shadow-sm p-5 mb-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus size={16} className="text-orange-500" /> Track New Medicine
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1.5 block">WhatsApp Number *</label>
                    <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-orange-400 transition">
                      <span className="bg-gray-100 px-3 py-3 text-sm text-gray-600 border-r border-gray-300 font-medium">+92</span>
                      <input type="tel" placeholder="3001234567"
                        value={eForm.phone.replace(/^92/, "")}
                        onChange={e => setEForm(prev => ({ ...prev, phone: "92" + e.target.value.replace(/\D/g, "") }))}
                        className="flex-1 px-3 py-3 text-sm outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1.5 block">Medicine Name *</label>
                    <input type="text" placeholder="e.g. Panadol..." value={eForm.medicineName}
                      onChange={e => setEForm(prev => ({ ...prev, medicineName: e.target.value }))}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-orange-400 outline-none transition" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1.5 block">Expiry Date *</label>
                    <input type="date" value={eForm.expiryDate} min={new Date().toISOString().split("T")[0]}
                      onChange={e => setEForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-orange-400 outline-none transition" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1.5 block">Batch Number (Optional)</label>
                    <input type="text" placeholder="e.g. BN2024..." value={eForm.batchNumber}
                      onChange={e => setEForm(prev => ({ ...prev, batchNumber: e.target.value }))}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-orange-400 outline-none transition" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1.5 block">Notes (Optional)</label>
                  <textarea placeholder="Any additional notes..." value={eForm.notes}
                    onChange={e => setEForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2} className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-orange-400 outline-none transition resize-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleESubmit} disabled={savingE}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 text-sm">
                    {savingE ? <><Loader size={15} className="animate-spin" /> Saving...</> : <><PackageX size={15} /> Track Medicine</>}
                  </button>
                  <button onClick={() => { setShowEForm(false); setEForm(DEFAULT_EXPIRY); }}
                    className="px-5 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Expiry List */}
            {loadingE ? (
              <div className="flex justify-center py-12"><Loader className="animate-spin text-orange-500" size={28} /></div>
            ) : expiries.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
                <PackageX size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No medicines being tracked</p>
                <p className="text-sm text-gray-400 mt-1">Click "Track Medicine" to get expiry alerts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expiries.map(e => {
                  const days = getDaysLeft(e.expiryDate);
                  const isExpired = days < 0;
                  const isWarning = days >= 0 && days <= 7;
                  return (
                    <div key={e._id} className={`border-2 rounded-xl p-4 transition ${
                      isExpired ? "border-gray-300 bg-gray-50 opacity-60" :
                      isWarning ? "border-red-200 bg-red-50" :
                      "border-orange-100 bg-orange-50/50"
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                              <Pill size={16} className="text-orange-500" /> {e.medicineName}
                            </h3>
                            <ExpiryBadge expiryDate={e.expiryDate} />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} className="text-gray-400" />
                              Expires: {new Date(e.expiryDate).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <span className="flex items-center gap-1"><Phone size={12} className="text-gray-400" /> +{e.phone}</span>
                            {e.batchNumber && <span className="flex items-center gap-1 text-gray-400">Batch: {e.batchNumber}</span>}
                          </div>
                          {e.notes && <p className="text-xs text-gray-400 mt-1.5 italic">📝 {e.notes}</p>}
                          {isWarning && (
                            <p className="text-xs text-red-600 font-semibold mt-2 flex items-center gap-1">
                              <AlertTriangle size={12} /> WhatsApp alert will be sent 7 days before expiry
                            </p>
                          )}
                        </div>
                        <button onClick={() => handleDeleteE(e._id)}
                          className="p-2 rounded-lg border-2 border-red-200 text-red-500 hover:bg-red-50 transition shrink-0">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Info */}
            <div className="mt-6 bg-orange-50 border-2 border-orange-200 rounded-xl p-4 flex gap-3 items-start">
              <span className="text-xl">🔔</span>
              <p className="text-sm text-orange-700 leading-relaxed">
                <strong className="text-orange-800">How it works:</strong> Add your medicines with expiry dates. You'll get a WhatsApp confirmation instantly, and an alert 7 days before expiry so you can get replacements in time.
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
    <MediBot />
    </>
  );
};

export default Reminders;