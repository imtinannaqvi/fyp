import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { Plus, Clock, Calendar, Pill, Trash2, Edit2, Bell, CheckCircle, XCircle, Loader } from "lucide-react";

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    medicineName: "",
    dosage: "",
    frequency: "daily",
    times: ["09:00"],
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    notes: ""
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const { data } = await API.get("/user/reminders");
      setReminders(data.reminders || []);
    } catch (error) {
      toast.error("Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/user/reminders/${editingId}`, formData);
        toast.success("Reminder updated");
      } else {
        await API.post("/user/reminders", formData);
        toast.success("Reminder created");
      }
      fetchReminders();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save reminder");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this reminder?")) return;
    try {
      await API.delete(`/user/reminders/${id}`);
      setReminders(prev => prev.filter(r => r._id !== id));
      toast.success("Reminder deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleEdit = (reminder) => {
    setEditingId(reminder._id);
    setFormData({
      medicineName: reminder.medicineName,
      dosage: reminder.dosage,
      frequency: reminder.frequency,
      times: reminder.times,
      startDate: reminder.startDate.split('T')[0],
      endDate: reminder.endDate ? reminder.endDate.split('T')[0] : "",
      notes: reminder.notes || ""
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      medicineName: "",
      dosage: "",
      frequency: "daily",
      times: ["09:00"],
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      notes: ""
    });
    setEditingId(null);
    setShowModal(false);
  };

  const addTimeSlot = () => {
    setFormData(prev => ({ ...prev, times: [...prev.times, "09:00"] }));
  };

  const removeTimeSlot = (index) => {
    setFormData(prev => ({ ...prev, times: prev.times.filter((_, i) => i !== index) }));
  };

  const updateTimeSlot = (index, value) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.map((t, i) => i === index ? value : t)
    }));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Loader size={32} className="animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Reminders</h1>
            <p className="text-gray-600">Never miss a dose with smart reminders</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus size={20} /> Add Reminder
          </button>
        </div>

        {reminders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bell size={40} className="text-blue-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Reminders Set</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Start tracking your medication schedule by creating your first reminder</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2"
            >
              <Plus size={18} /> Create Reminder
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reminders.map((reminder) => (
              <div key={reminder._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                        <Pill size={24} className="text-white" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base leading-tight">{reminder.medicineName}</h3>
                        <p className="text-sm text-gray-500">{reminder.dosage}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-blue-600" />
                      <span className="text-xs text-gray-700 font-medium capitalize">{reminder.frequency}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {reminder.times.map((time, i) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-semibold">
                          {time}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-green-600" />
                      <span className="text-xs text-gray-700">
                        {new Date(reminder.startDate).toLocaleDateString()} - {reminder.endDate ? new Date(reminder.endDate).toLocaleDateString() : "Ongoing"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(reminder)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(reminder._id)}
                      className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? "Edit" : "Add"} Reminder</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={formData.medicineName}
                  onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Panadol"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dosage *</label>
                <input
                  type="text"
                  required
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 500mg, 1 tablet"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency *</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="as-needed">As Needed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reminder Times *</label>
                {formData.times.map((time, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => updateTimeSlot(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {formData.times.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 mt-2"
                >
                  <Plus size={16} /> Add Time
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="e.g., Take with food"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition"
                >
                  {editingId ? "Update" : "Create"} Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;
