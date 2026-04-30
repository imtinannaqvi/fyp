import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import {
  Users, Pill, ScanLine, Bell, AlertTriangle, BarChart2,
  Loader, Trash2, Phone, Clock, CheckCircle,
  RefreshCw, Plus, ChevronRight, Activity, Shield, PlusCircle
} from "lucide-react";

const BAR_COLORS = ["bg-blue-600","bg-blue-500","bg-indigo-500","bg-indigo-400","bg-purple-500"];

const AdminDashboard = () => {
  const [stats,            setStats]            = useState(null);
  const [reminders,        setReminders]        = useState([]);
  const [analytics,        setAnalytics]        = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [days,             setDays]             = useState(7);
  const navigate   = useNavigate();
  const { isDark } = useTheme();

  // theme
  const bg   = isDark ? "#0f172a" : "#f8fafc";
  const card = isDark ? "#1e293b" : "#ffffff";
  const bdr  = isDark ? "#334155" : "#f1f5f9";
  const txt  = isDark ? "#f1f5f9" : "#111827";
  const sub  = isDark ? "#94a3b8" : "#6b7280";
  const hov  = isDark ? "#1e3a5f22" : "#f0f9ff";

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { fetchAnalytics(); }, [days]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([API.get("/admin/stats"), API.get("/admin/reminders/today")]);
      setStats(s.data);
      setReminders(r.data.reminders || []);
    } catch { setStats({ totalUsers: 0, totalMedicines: 0, totalScans: 0 }); }
    finally { setLoading(false); }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try { const { data } = await API.get(`/admin/search-analytics?days=${days}`); setAnalytics(data); }
    catch { setAnalytics(null); }
    finally { setAnalyticsLoading(false); }
  };

  const handleDeleteReminder = async (id) => {
    if (!window.confirm("Delete this reminder?")) return;
    try { await API.delete(`/admin/reminders/${id}`); setReminders(r => r.filter(x => x._id !== id)); toast.success("Deleted"); }
    catch { toast.error("Failed"); }
  };

  const maxCount = analytics?.topSearches?.[0]?.count || 1;

  const statCards = [
    { label: "Total Users",       value: stats?.totalUsers,     icon: <Users size={22} />,    iconCls: "text-blue-500",   bgCls: "bg-blue-50",   link: "/admin/users" },
    { label: "Medicines in DB",   value: stats?.totalMedicines, icon: <Pill size={22} />,     iconCls: "text-indigo-500", bgCls: "bg-indigo-50", link: "/admin/medicines" },
    { label: "OCR Scans",         value: stats?.totalScans,     icon: <ScanLine size={22} />, iconCls: "text-purple-500", bgCls: "bg-purple-50", link: "/admin/ocr-history" },
    { label: "Today's Reminders", value: reminders.length,      icon: <Bell size={22} />,     iconCls: "text-green-500",  bgCls: "bg-green-50",  link: null },
  ];

  const quickActions = [
    { label: "Add Medicine",     icon: <Plus size={14} />,          path: "/admin/add-medicine",     color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Medicines",        icon: <Pill size={14} />,          path: "/admin/medicines",        color: "bg-indigo-600 hover:bg-indigo-700" },
    { label: "OCR History",      icon: <ScanLine size={14} />,      path: "/admin/ocr-history",      color: "bg-purple-600 hover:bg-purple-700" },
    { label: "Fake Reports",     icon: <AlertTriangle size={14} />, path: "/admin/fake-reports",     color: "bg-red-600 hover:bg-red-700" },
    { label: "Analytics",        icon: <BarChart2 size={14} />,     path: "/admin/search-analytics", color: "bg-green-600 hover:bg-green-700" },
    { label: "Settings",         icon: <Shield size={14} />,        path: "/admin/settings",         color: "bg-gray-700 hover:bg-gray-800" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ backgroundColor: bg, minHeight: "100%" }}>

      {/* Welcome — slides down */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white flex items-center justify-between animate-fade-up"
        style={{ animationDelay: "0ms" }}>
        <div>
          <h2 className="text-lg font-black mb-0.5 flex items-center gap-2">
            <Shield size={18} /> Welcome back, Admin
          </h2>
          <p className="text-blue-200 text-sm">MedicoGuidance platform overview</p>
        </div>
        <button onClick={fetchAll} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Stat Cards — pop in with stagger */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader size={26} className="animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((c, i) => (
            <div key={i} onClick={() => c.link && navigate(c.link)}
              style={{ backgroundColor: card, borderColor: bdr, animationDelay: `${100 + i * 80}ms` }}
              className={`rounded-2xl border shadow-sm p-4 flex items-center gap-3 animate-fade-up ${
                c.link ? "cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200" : ""
              }`}>
              <div className={`${c.bgCls} w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.iconCls}`}>
                {c.icon}
              </div>
              <div>
                <p className="text-2xl font-black" style={{ color: txt }}>{c.value ?? "—"}</p>
                <p className="text-xs" style={{ color: sub }}>{c.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics + Reminders — slide up with delay */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Analytics */}
        <div style={{ backgroundColor: card, borderColor: bdr, animationDelay: "420ms" }}
          className="rounded-2xl border shadow-sm p-5 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2 text-sm" style={{ color: txt }}>
              <BarChart2 size={15} className="text-blue-600" /> Search Analytics
            </h3>
            <div className="flex items-center gap-2">
              <select value={days} onChange={e => setDays(Number(e.target.value))}
                style={{ backgroundColor: isDark ? "#0f172a" : "#f9fafb", color: txt, borderColor: bdr }}
                className="text-xs border rounded-lg px-2 py-1.5 focus:outline-none">
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
              <button onClick={() => navigate("/admin/search-analytics")}
                className="text-xs text-blue-500 font-semibold flex items-center gap-1">
                Full <ChevronRight size={11} />
              </button>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="flex justify-center py-6"><Loader size={22} className="animate-spin text-blue-600" /></div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "Total", value: analytics?.totalSearches || 0 },
                  { label: `Last ${days}d`, value: analytics?.recentSearches || 0 },
                  { label: "Users", value: analytics?.uniqueUsers || 0 },
                ].map((s, i) => (
                  <div key={i} style={{ backgroundColor: isDark ? "#1e3a5f" : "#eff6ff" }} className="rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-blue-500">{s.value}</p>
                    <p className="text-[10px] text-blue-400 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
              {analytics?.topSearches?.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: sub }}>Top Searches</p>
                  {analytics.topSearches.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
                        i === 0 ? "bg-yellow-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-600" : "bg-gray-300"
                      }`}>{i + 1}</div>
                      <p className="flex-1 text-xs font-semibold capitalize truncate" style={{ color: txt }}>{item.query}</p>
                      <div className="w-16 rounded-full h-1.5" style={{ backgroundColor: isDark ? "#334155" : "#e5e7eb" }}>
                        <div className={`h-1.5 rounded-full ${BAR_COLORS[i] || "bg-blue-400"}`}
                          style={{ width: `${(item.count / maxCount) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold w-5 text-right shrink-0" style={{ color: sub }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm py-4" style={{ color: sub }}>No search data yet</p>
              )}
            </>
          )}
        </div>

        {/* Reminders */}
        <div style={{ backgroundColor: card, borderColor: bdr, animationDelay: "500ms" }}
          className="rounded-2xl border shadow-sm overflow-hidden animate-fade-up">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${bdr}` }}>
            <h3 className="font-bold flex items-center gap-2 text-sm" style={{ color: txt }}>
              <Bell size={15} className="text-green-500" /> Today's Reminders
            </h3>
            <span className="text-xs font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100">
              {reminders.length} active
            </span>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><Loader size={22} className="animate-spin text-green-600" /></div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-10">
              <Bell size={30} className="mx-auto mb-2" style={{ color: bdr }} />
              <p className="text-sm" style={{ color: sub }}>No reminders for today</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {reminders.map(r => (
                <div key={r._id} className="px-5 py-3 flex items-start justify-between gap-3 transition"
                  style={{ borderBottom: `1px solid ${bdr}` }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = hov}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm truncate" style={{ color: txt }}>{r.medicineName}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${r.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {r.isActive ? "Active" : "Paused"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: sub }}>
                      <span className="flex items-center gap-1"><Phone size={10} /> +{r.phone}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {r.times?.join(", ")}</span>
                      <span className="capitalize px-2 py-0.5 rounded-full" style={{ backgroundColor: isDark ? "#334155" : "#f3f4f6" }}>{r.frequency}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteReminder(r._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Users */}
      {stats?.recentUsers?.length > 0 && (
        <div style={{ backgroundColor: card, borderColor: bdr, animationDelay: "600ms" }}
          className="rounded-2xl border shadow-sm overflow-hidden animate-fade-up">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${bdr}` }}>
            <h3 className="font-bold flex items-center gap-2 text-sm" style={{ color: txt }}>
              <Users size={15} className="text-blue-600" /> Recent Registrations
            </h3>
            <button onClick={() => navigate("/admin/users")} className="text-xs text-blue-500 font-semibold flex items-center gap-1">
              View All <ChevronRight size={11} />
            </button>
          </div>
          <div>
            {stats.recentUsers.map(u => (
              <div key={u._id} className="px-5 py-3 flex items-center gap-3 transition"
                style={{ borderBottom: `1px solid ${bdr}` }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = hov}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: txt }}>{u.name}</p>
                  <p className="text-xs truncate" style={{ color: sub }}>{u.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                    {u.role}
                  </span>
                  {u.isVerified && <CheckCircle size={13} className="text-green-500" />}
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
