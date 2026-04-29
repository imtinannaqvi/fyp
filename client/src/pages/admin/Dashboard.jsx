// pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  Users, Pill, ScanLine, Bell, AlertTriangle, BarChart2,
  TrendingUp, Search, Loader, Trash2, Phone, Clock,
  CheckCircle, PauseCircle, RefreshCw, Plus, ChevronRight,
  Activity, Shield, Eye
} from "lucide-react";

const BAR_COLORS = [
  "bg-blue-600","bg-blue-500","bg-indigo-500","bg-indigo-400",
  "bg-purple-500","bg-purple-400","bg-violet-500","bg-violet-400",
  "bg-blue-400","bg-blue-300",
];

const AdminDashboard = () => {
  const [stats, setStats]             = useState(null);
  const [reminders, setReminders]     = useState([]);
  const [analytics, setAnalytics]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [days, setDays]               = useState(7);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, remindersRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/reminders/today"),
      ]);
      setStats(statsRes.data);
      setReminders(remindersRes.data.reminders || []);
    } catch {
      setStats({ totalUsers: 0, totalMedicines: 0, totalScans: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const { data } = await API.get(`/admin/search-analytics?days=${days}`);
      setAnalytics(data);
    } catch {
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleDeleteReminder = async (id) => {
    if (!window.confirm("Delete this reminder?")) return;
    try {
      await API.delete(`/admin/reminders/${id}`);
      setReminders(reminders.filter(r => r._id !== id));
      toast.success("Reminder deleted");
    } catch { toast.error("Failed"); }
  };

  const maxCount = analytics?.topSearches?.[0]?.count || 1;

  const statCards = [
    { label: "Total Users",       value: stats?.totalUsers,     icon: <Users size={22} />,    color: "blue",   link: "/admin/users" },
    { label: "Medicines in DB",   value: stats?.totalMedicines, icon: <Pill size={22} />,     color: "indigo", link: "/admin/medicines" },
    { label: "OCR Scans",         value: stats?.totalScans,     icon: <ScanLine size={22} />, color: "purple", link: "/admin/ocr-history" },
    { label: "Today's Reminders", value: reminders.length,      icon: <Bell size={22} />,     color: "green",  link: null },
  ];

  const colorMap = {
    blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   border: "border-blue-100" },
    indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", border: "border-indigo-100" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-100" },
    green:  { bg: "bg-green-50",  icon: "text-green-600",  border: "border-green-100" },
  };

  const quickActions = [
    { label: "Add Medicine",     icon: <Plus size={15} />,          path: "/admin/add-medicine",    color: "bg-blue-600 hover:bg-blue-700" },
    { label: "View Medicines",   icon: <Pill size={15} />,          path: "/admin/medicines",       color: "bg-indigo-600 hover:bg-indigo-700" },
    { label: "OCR History",      icon: <ScanLine size={15} />,      path: "/admin/ocr-history",     color: "bg-purple-600 hover:bg-purple-700" },
    { label: "Fake Reports",     icon: <AlertTriangle size={15} />, path: "/admin/fake-reports",    color: "bg-red-600 hover:bg-red-700" },
    { label: "Search Analytics", icon: <BarChart2 size={15} />,     path: "/admin/search-analytics",color: "bg-green-600 hover:bg-green-700" },
    { label: "Site Settings",    icon: <Shield size={15} />,        path: "/admin/settings",        color: "bg-gray-700 hover:bg-gray-800" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black mb-1">Welcome back, Admin! 👋</h2>
            <p className="text-blue-200 text-sm">Here's what's happening on MedicoGuidance today.</p>
          </div>
          <button onClick={fetchAll} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader size={28} className="animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => {
            const c = colorMap[card.color];
            return (
              <div key={i}
                onClick={() => card.link && navigate(card.link)}
                className={`bg-white rounded-2xl border ${c.border} shadow-sm p-5 flex items-center gap-4 ${card.link ? "cursor-pointer hover:shadow-md transition-all" : ""}`}>
                <div className={`${c.bg} w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">{card.value ?? "—"}</p>
                  <p className="text-xs text-gray-500">{card.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity size={16} className="text-blue-600" /> Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {quickActions.map((a, i) => (
            <button key={i} onClick={() => navigate(a.path)}
              className={`${a.color} text-white font-semibold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs`}>
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics + Reminders Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Search Analytics */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <BarChart2 size={16} className="text-blue-600" /> Search Analytics
            </h3>
            <div className="flex items-center gap-2">
              <select value={days} onChange={e => setDays(Number(e.target.value))}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none">
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
              <button onClick={() => navigate("/admin/search-analytics")}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                Full View <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="flex justify-center py-8"><Loader size={24} className="animate-spin text-blue-600" /></div>
          ) : (
            <>
              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Total Searches", value: analytics?.totalSearches || 0 },
                  { label: `Last ${days}d`,  value: analytics?.recentSearches || 0 },
                  { label: "Unique Users",   value: analytics?.uniqueUsers || 0 },
                ].map((s, i) => (
                  <div key={i} className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-blue-700">{s.value}</p>
                    <p className="text-[10px] text-blue-500 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Top searches */}
              {analytics?.topSearches?.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Top Searches</p>
                  {analytics.topSearches.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
                        i === 0 ? "bg-yellow-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-600" : "bg-gray-300"
                      }`}>{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 capitalize truncate">{item.query}</p>
                      </div>
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${BAR_COLORS[i] || "bg-blue-400"}`}
                          style={{ width: `${(item.count / maxCount) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-500 w-6 text-right shrink-0">{item.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm py-4">No search data yet</p>
              )}
            </>
          )}
        </div>

        {/* Today's Reminders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Bell size={16} className="text-green-600" /> Today's Reminders
            </h3>
            <span className="text-xs font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100">
              {reminders.length} active
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader size={24} className="animate-spin text-green-600" /></div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-10">
              <Bell size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No reminders for today</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {reminders.map((r) => (
                <div key={r._id} className="px-5 py-3 hover:bg-gray-50 transition flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 text-sm truncate">{r.medicineName}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        r.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>{r.isActive ? "Active" : "Paused"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1"><Phone size={10} /> +{r.phone}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {r.times?.join(", ")}</span>
                      <span className="capitalize bg-gray-100 px-2 py-0.5 rounded-full">{r.frequency}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteReminder(r._id)}
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Users */}
      {stats?.recentUsers?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Users size={16} className="text-blue-600" /> Recent Registrations
            </h3>
            <button onClick={() => navigate("/admin/users")}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentUsers.map((u) => (
              <div key={u._id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    u.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                  }`}>{u.role}</span>
                  {u.isVerified && <CheckCircle size={14} className="text-green-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;