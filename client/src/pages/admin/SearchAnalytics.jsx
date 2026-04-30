import { useState, useEffect } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import { Search, TrendingUp, Users, BarChart2, Loader, RefreshCw } from "lucide-react";

const BAR_COLORS = ["bg-blue-600","bg-blue-500","bg-blue-400","bg-indigo-500","bg-indigo-400","bg-purple-500","bg-purple-400","bg-violet-500","bg-violet-400","bg-blue-300"];

const SearchAnalytics = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [days,    setDays]    = useState(7);
  const { isDark } = useTheme();

  const bg   = isDark ? "#0f172a" : "#f8fafc";
  const card = isDark ? "#1e293b" : "#ffffff";
  const bdr  = isDark ? "#334155" : "#e5e7eb";
  const txt  = isDark ? "#f1f5f9" : "#111827";
  const sub  = isDark ? "#94a3b8" : "#6b7280";

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data: res } = await API.get(`/admin/search-analytics?days=${days}`);
      setData(res);
    } catch { toast.error("Failed to load analytics"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnalytics(); }, [days]);

  const maxCount = data?.topSearches?.[0]?.count || 1;

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ backgroundColor: bg, minHeight: "100%" }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-up" style={{ animationDelay: "0ms" }}>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: txt }}>
            <BarChart2 size={20} className="text-blue-600" /> Search Analytics
          </h1>
          <p className="text-sm mt-0.5" style={{ color: sub }}>Track what medicines users are searching for</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={days} onChange={e => setDays(Number(e.target.value))}
            style={{ backgroundColor: card, borderColor: bdr, color: txt }}
            className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <button onClick={fetchAnalytics}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition hover:scale-105 active:scale-95">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-blue-600" /></div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Searches",     value: data?.totalSearches?.toLocaleString()  || "0", icon: <Search size={20} />,    iconCls: "text-blue-500",   bgCls: "bg-blue-50",   sub: "All time",         delay: 80  },
              { label: `Searches (${days}d)`, value: data?.recentSearches?.toLocaleString() || "0", icon: <TrendingUp size={20} />, iconCls: "text-green-500",  bgCls: "bg-green-50",  sub: `Last ${days} days`, delay: 160 },
              { label: "Unique Users",        value: data?.uniqueUsers?.toLocaleString()    || "0", icon: <Users size={20} />,     iconCls: "text-purple-500", bgCls: "bg-purple-50", sub: "Logged-in users",  delay: 240 },
            ].map((c, i) => (
              <div key={i}
                style={{ backgroundColor: card, borderColor: bdr, animationDelay: `${c.delay}ms` }}
                className="rounded-2xl border shadow-sm p-5 flex items-center gap-4 animate-fade-up hover:-translate-y-1 transition-transform duration-200">
                <div className={`${c.bgCls} w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.iconCls}`}>{c.icon}</div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: txt }}>{c.value}</p>
                  <p className="text-sm" style={{ color: sub }}>{c.label}</p>
                  <p className="text-xs" style={{ color: isDark ? "#475569" : "#9ca3af" }}>{c.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Daily Trend */}
          <div style={{ backgroundColor: card, borderColor: bdr, animationDelay: "320ms" }}
            className="rounded-2xl border shadow-sm p-5 animate-fade-up">
            <h2 className="font-bold mb-5 flex items-center gap-2 text-sm" style={{ color: txt }}>
              <TrendingUp size={16} className="text-blue-600" /> Daily Search Trend
            </h2>
            {data?.dailyTrend?.length > 0 ? (
              <div className="flex items-end gap-1 sm:gap-2 h-36">
                {data.dailyTrend.map((d, i) => {
                  const maxVal = Math.max(...data.dailyTrend.map(x => x.count), 1);
                  const height = d.count === 0 ? 4 : Math.max((d.count / maxVal) * 100, 6);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full flex justify-center">
                        <div className="w-full bg-blue-600 hover:bg-blue-500 rounded-t-lg transition-all cursor-pointer relative"
                          style={{ height: `${height}%`, minHeight: "4px", animation: `fade-up 0.4s ease ${i * 30}ms both` }}>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                            {d.count} searches
                          </div>
                        </div>
                      </div>
                      <p className="text-[9px] text-center" style={{ color: sub }}>
                        {new Date(d.date).toLocaleDateString("en-PK", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-8 text-sm" style={{ color: sub }}>No data for this period</p>
            )}
          </div>

          {/* Top Searches */}
          <div style={{ backgroundColor: card, borderColor: bdr, animationDelay: "400ms" }}
            className="rounded-2xl border shadow-sm p-5 animate-fade-up">
            <h2 className="font-bold mb-5 flex items-center gap-2 text-sm" style={{ color: txt }}>
              <Search size={16} className="text-blue-600" /> Top Searched Medicines
            </h2>
            {data?.topSearches?.length > 0 ? (
              <div className="space-y-3">
                {data.topSearches.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 animate-fade-up"
                    style={{ animationDelay: `${420 + i * 50}ms` }}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
                      i === 0 ? "bg-yellow-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-600" : "bg-gray-300"
                    }`}>{i + 1}</div>
                    <div className="w-28 sm:w-36 shrink-0">
                      <p className="text-sm font-semibold capitalize truncate" style={{ color: txt }}>{item.query}</p>
                      <p className="text-xs" style={{ color: sub }}>
                        {new Date(item.lastSearched).toLocaleDateString("en-PK", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <div className="flex-1 rounded-full h-2.5 overflow-hidden" style={{ backgroundColor: isDark ? "#334155" : "#e5e7eb" }}>
                      <div className={`h-full rounded-full transition-all duration-700 ${BAR_COLORS[i] || "bg-blue-400"}`}
                        style={{ width: `${(item.count / maxCount) * 100}%` }} />
                    </div>
                    <div className="w-16 text-right shrink-0">
                      <span className="text-sm font-bold" style={{ color: txt }}>{item.count}</span>
                      <span className="text-xs ml-1" style={{ color: sub }}>searches</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search size={32} className="mx-auto mb-3" style={{ color: bdr }} />
                <p className="text-sm" style={{ color: sub }}>No search data yet</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchAnalytics;
