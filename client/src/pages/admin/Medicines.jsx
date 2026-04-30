import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import { Plus, Search, CheckCircle, Trash2, Loader, Filter } from "lucide-react";

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("all");
  const navigate   = useNavigate();
  const { isDark } = useTheme();

  const bg   = isDark ? "#0f172a" : "#f8fafc";
  const card = isDark ? "#1e293b" : "#ffffff";
  const bdr  = isDark ? "#334155" : "#e5e7eb";
  const txt  = isDark ? "#f1f5f9" : "#111827";
  const sub  = isDark ? "#94a3b8" : "#6b7280";
  const thBg = isDark ? "#0f172a"  : "#f9fafb";

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("q", search);
      if (filter === "approved") params.append("isApproved", "true");
      if (filter === "pending")  params.append("isApproved", "false");
      const { data } = await API.get(`/medicine?${params}`);
      setMedicines(data.medicines || data || []);
    } catch { toast.error("Failed to load medicines"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMedicines(); }, [search, filter]);

  const handleApprove = async (id) => {
    try { await API.patch(`/medicine/${id}/approve`); toast.success("Approved!"); fetchMedicines(); }
    catch { toast.error("Failed to approve"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this medicine permanently?")) return;
    try { await API.delete(`/medicine/${id}`); toast.success("Deleted"); fetchMedicines(); }
    catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ backgroundColor: bg, minHeight: "100%" }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-up" style={{ animationDelay: "0ms" }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: txt }}>Manage Medicines</h1>
          <p className="text-sm mt-0.5" style={{ color: sub }}>Review and update the medicine database</p>
        </div>
        <button onClick={() => navigate("/admin/add-medicine")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 text-sm transition self-start hover:scale-105 active:scale-95">
          <Plus size={16} /> Add Medicine
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="flex-1 flex items-center gap-2 border rounded-xl px-3 py-2.5"
          style={{ backgroundColor: card, borderColor: bdr }}>
          <Search size={15} className="text-gray-400 shrink-0" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, brand, generic..."
            style={{ backgroundColor: "transparent", color: txt }}
            className="w-full text-sm focus:outline-none" />
        </div>
        <div className="flex items-center gap-2 border rounded-xl px-3 py-2.5"
          style={{ backgroundColor: card, borderColor: bdr }}>
          <Filter size={13} className="text-gray-400 shrink-0" />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ backgroundColor: "transparent", color: txt }}
            className="text-sm focus:outline-none">
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: card, borderColor: bdr, animationDelay: "160ms" }} className="rounded-2xl border shadow-sm overflow-hidden animate-fade-up">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr style={{ backgroundColor: thBg, borderBottom: `1px solid ${bdr}` }}>
                {["Medicine", "Brand / Generic", "Price / Stock", "Status", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: sub }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="py-16 text-center"><Loader className="animate-spin mx-auto text-blue-600" size={28} /></td></tr>
              ) : medicines.length === 0 ? (
                <tr><td colSpan="5" className="py-16 text-center text-sm" style={{ color: sub }}>No medicines found</td></tr>
              ) : medicines.map(med => (
                <tr key={med._id} style={{ borderBottom: `1px solid ${bdr}` }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#1e3a5f22" : "#f9fafb"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-sm" style={{ color: txt }}>{med.name}</p>
                    <p className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: sub }}>{med.category}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-xs" style={{ color: txt }}>B: {med.brand || "—"}</p>
                    <p className="text-xs italic" style={{ color: sub }}>G: {med.generic || "—"}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-xs font-semibold" style={{ color: txt }}>Rs. {med.price}</p>
                    <p className={`text-[10px] font-medium ${med.stock < 10 ? "text-red-500" : ""}`} style={med.stock >= 10 ? { color: sub } : {}}>
                      Stock: {med.stock}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    {med.isApproved ? (
                      <span className="flex items-center gap-1.5 text-green-600 text-xs font-medium bg-green-50 w-fit px-2.5 py-1 rounded-full">
                        <CheckCircle size={11} /> Approved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber-600 text-xs font-medium bg-amber-50 w-fit px-2.5 py-1 rounded-full">
                        <Loader size={11} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      {!med.isApproved && (
                        <button onClick={() => handleApprove(med._id)}
                          className="p-2 text-green-500 rounded-lg transition"
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#052e16" : "#f0fdf4"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                          title="Approve"><CheckCircle size={15} /></button>
                      )}
                      <button onClick={() => handleDelete(med._id)}
                        className="p-2 text-red-400 rounded-lg transition"
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#3b0a0a" : "#fef2f2"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                        title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Medicines;
