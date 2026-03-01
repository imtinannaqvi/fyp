import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { Plus, Search, CheckCircle, XCircle, Trash2, Loader, Edit } from "lucide-react";

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("q", search);
      if (filter === "approved") params.append("isApproved", "true");
      if (filter === "pending") params.append("isApproved", "false");
      const { data } = await API.get(`/medicine?${params}`);
      setMedicines(data.medicines || data || []);
    } catch {
      toast.error("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedicines(); }, [search, filter]);

  const handleApprove = async (id) => {
    try {
      await API.patch(`/medicine/${id}/approve`);
      toast.success("Medicine approved!");
      fetchMedicines();
    } catch { toast.error("Failed to approve"); }
  };

  const handleReject = async (id) => {
    try {
      await API.patch(`/medicine/${id}/reject`);
      toast.success("Medicine rejected");
      fetchMedicines();
    } catch { toast.error("Failed to reject"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this medicine permanently?")) return;
    try {
      await API.delete(`/medicine/${id}`);
      toast.success("Deleted successfully");
      fetchMedicines();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white border-b px-4 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Manage Medicines</h1>
            <p className="text-gray-500 text-xs md:text-sm mt-1">Review and update the medicine database</p>
          </div>
          <button onClick={() => navigate("/admin/add-medicine")} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-100">
            <Plus size={18} /> Add New Medicine
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 bg-white border rounded-xl px-4 py-2.5 flex items-center gap-3">
            <Search size={18} className="text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, brand, generic..." className="w-full text-sm focus:outline-none" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-white border rounded-xl px-4 py-2.5 text-sm focus:outline-none">
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Responsive Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="text-left px-6 py-4 font-medium">Medicine Name</th>
                  <th className="text-left px-6 py-4 font-medium">Brand/Generic</th>
                  <th className="text-left px-6 py-4 font-medium">Stock/Price</th>
                  <th className="text-left px-6 py-4 font-medium">Status</th>
                  <th className="text-center px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="5" className="py-20 text-center"><Loader className="animate-spin mx-auto text-blue-600" /></td></tr>
                ) : medicines.length === 0 ? (
                  <tr><td colSpan="5" className="py-20 text-center text-gray-400">No medicines found</td></tr>
                ) : medicines.map((med) => (
                  <tr key={med._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-800">{med.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-0.5">{med.category}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-600">B: {med.brand || "—"}</p>
                      <p className="text-xs text-gray-400 italic">G: {med.generic || "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-semibold text-gray-700">Rs. {med.price}</p>
                      <p className={`text-[10px] ${med.stock < 10 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>Stock: {med.stock}</p>
                    </td>
                    <td className="px-6 py-4">
                      {med.isApproved ? (
                        <span className="flex items-center gap-1.5 text-green-600 text-xs font-medium bg-green-50 w-fit px-2.5 py-1 rounded-full"><CheckCircle size={12} /> Approved</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-600 text-xs font-medium bg-amber-50 w-fit px-2.5 py-1 rounded-full"><Loader size={12} /> Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {!med.isApproved && (
                          <button onClick={() => handleApprove(med._id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Approve"><CheckCircle size={16} /></button>
                        )}
                        <button onClick={() => handleDelete(med._id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Medicines;