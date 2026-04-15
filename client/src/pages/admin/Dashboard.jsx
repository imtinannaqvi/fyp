import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { Pill, Users, ScanLine,BarChart2,AlertTriangle , Plus, Loader, Search, Trash2, Bell, Phone, Clock, CheckCircle, PauseCircle } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats]               = useState(null);
  const [users, setUsers]               = useState([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [reminders, setReminders]       = useState([]);
  const [remindersLoading, setRemindersLoading] = useState(true);
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const navigate = useNavigate();
  const limit = 10;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get("/admin/stats");
        setStats(data);
      } catch {
        setStats({ totalUsers: 0, totalMedicines: 0, totalScans: 0, recentUsers: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const { data } = await API.get(`/admin/users?page=${page}&limit=${limit}&search=${search}`);
        setUsers(data.users || []);
        setTotal(data.total || 0);
      } catch {
        toast.error("Failed to load users");
      } finally {
        setUsersLoading(false);
      }
    };
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [search, page]);

  useEffect(() => {
    const fetchReminders = async () => {
      setRemindersLoading(true);
      try {
        const { data } = await API.get("/admin/reminders/today");
        setReminders(data.reminders || []);
      } catch {
        setReminders([]);
      } finally {
        setRemindersLoading(false);
      }
    };
    fetchReminders();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleDeleteReminder = async (id) => {
    if (!window.confirm("Delete this reminder?")) return;
    try {
      await API.delete(`/admin/reminders/${id}`);
      setReminders(reminders.filter(r => r._id !== id));
      toast.success("Reminder deleted");
    } catch {
      toast.error("Failed to delete reminder");
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await API.patch(`/admin/users/${id}/role`, { role });
      setUsers(users.map(u => u._id === id ? { ...u, role } : u));
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-PK", {
    day: "numeric", month: "short", year: "numeric"
  });

  const pages = Math.ceil(total / limit);

  const statCards = [
    { label: "Total Users",       value: stats?.totalUsers,     icon: <Users size={22} className="text-blue-600" />,      bg: "bg-blue-50" },
    { label: "Medicines",         value: stats?.totalMedicines, icon: <Pill size={22} className="text-indigo-600" />,     bg: "bg-indigo-50" },
    { label: "OCR Scans",         value: stats?.totalScans,     icon: <ScanLine size={22} className="text-purple-600" />, bg: "bg-purple-50" },
    { label: "Today's Reminders", value: reminders.length,      icon: <Bell size={22} className="text-green-600" />,      bg: "bg-green-50" },
    { label: "Search Analytics", icon: <BarChart2 size={16} />, link: "/admin/search-analytics", color: "bg-green-600 hover:bg-green-700" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white border-b px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-1">Manage Medico Guidance platform</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">

        {/* Stats */}
        {loading ? (
          <div className="flex justify-center py-8"><Loader size={28} className="animate-spin text-blue-600" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((card, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className={`${card.bg} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}>{card.icon}</div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{card.value ?? "—"}</p>
                  <p className="text-xs md:text-sm text-gray-500">{card.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Add Medicine",   icon: <Plus size={16} />,          link: "/admin/add-medicine",    color: "bg-blue-600 hover:bg-blue-700" },
              { label: "View Medicines", icon: <Pill size={16} />,          link: "/admin/medicines",        color: "bg-indigo-600 hover:bg-indigo-700" },
              { label: "OCR History",   icon: <ScanLine size={16} />,       link: "/admin/ocr-history",     color: "bg-purple-600 hover:bg-purple-700" },
              { label: "Fake Reports",  icon: <AlertTriangle size={16} />,  link: "/admin/fake-reports",    color: "bg-red-600 hover:bg-red-700" },
            ].map((action, i) => (
              <button key={i} onClick={() => navigate(action.link)}
                className={`${action.color} text-white font-medium py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm`}>
                {action.icon} {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Today's Reminders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Bell size={18} className="text-green-600" /> Today's Reminders
              </h2>
              <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                {reminders.length} active reminder{reminders.length !== 1 ? "s" : ""} scheduled for today
              </p>
            </div>
          </div>

          {remindersLoading ? (
            <div className="flex justify-center py-8">
              <Loader size={24} className="animate-spin text-green-600" />
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-10">
              <Bell size={36} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No reminders scheduled for today</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[750px]">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium">Medicine</th>
                    <th className="text-left px-6 py-3 font-medium">Dosage</th>
                    <th className="text-left px-6 py-3 font-medium">Phone</th>
                    <th className="text-left px-6 py-3 font-medium">Times</th>
                    <th className="text-left px-6 py-3 font-medium">Frequency</th>
                    <th className="text-left px-6 py-3 font-medium">Status</th>
                    <th className="text-center px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reminders.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{r.medicineName}</p>
                        {r.notes && <p className="text-xs text-gray-400 mt-0.5">📝 {r.notes}</p>}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{r.dosage}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <Phone size={13} className="text-gray-400" /> +{r.phone}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {r.times.map((t, i) => (
                            <span key={i} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                              <Clock size={10} /> {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full capitalize">
                          {r.frequency}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {r.isActive ? (
                          <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                            <CheckCircle size={11} /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                            <PauseCircle size={11} /> Paused
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDeleteReminder(r._id)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-800">All Registered Users</h2>
              <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">{total} total users found</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-full sm:w-64">
              <Search size={14} className="text-gray-400" />
              <input type="text" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search users..."
                className="flex-1 text-sm focus:outline-none bg-transparent" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="text-left px-6 py-4 font-medium">User Details</th>
                  <th className="text-left px-6 py-4 font-medium">Health Profile</th>
                  <th className="text-left px-6 py-4 font-medium">Joined Date</th>
                  <th className="text-left px-6 py-4 font-medium">Role</th>
                  <th className="text-center px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usersLoading ? (
                  <tr><td colSpan="5" className="py-10 text-center"><Loader className="animate-spin mx-auto text-blue-600" /></td></tr>
                ) : users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {u.age && <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">{u.age}y</span>}
                        {u.gender && <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full capitalize">{u.gender}</span>}
                        {u.conditions?.length > 0 && <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{u.conditions.length} Conditions</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                    <td className="px-6 py-4">
                      <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1.5 rounded-lg border focus:outline-none ${u.role === 'admin' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDeleteUser(u._id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-400">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-xs border rounded-xl disabled:opacity-40">Previous</button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-4 py-2 text-xs border rounded-xl disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;