import { useState, useEffect } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { Search, TrendingUp, Users, BarChart2, Loader, RefreshCw } from "lucide-react";

const BAR_COLORS = [
  "bg-blue-600", "bg-blue-500", "bg-blue-400", "bg-indigo-500",
  "bg-indigo-400", "bg-purple-500", "bg-purple-400", "bg-violet-500",
  "bg-violet-400", "bg-blue-300",
];

const SearchAnalytics = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays]       = useState(7);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
const { data: res } = await API.get(`/admin/search-analytics?days=${days}`);
      setData(res);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [days]);

  const maxCount = data?.topSearches?.[0]?.count || 1;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* Header */}
      <div className="bg-white border-b px-4 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart2 size={24} className="text-blue-600" /> Search Analytics
            </h1>
            <p className="text-gray-500 text-xs md:text-sm mt-1">Track what medicines users are searching for</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
            <button onClick={fetchAnalytics}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size={32} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Total Searches",
                  value: data?.totalSearches?.toLocaleString() || "0",
                  icon: <Search size={22} className="text-blue-600" />,
                  bg: "bg-blue-50",
                  sub: "All time",
                },
                {
                  label: `Searches (${days}d)`,
                  value: data?.recentSearches?.toLocaleString() || "0",
                  icon: <TrendingUp size={22} className="text-green-600" />,
                  bg: "bg-green-50",
                  sub: `Last ${days} days`,
                },
                {
                  label: "Unique Users",
                  value: data?.uniqueUsers?.toLocaleString() || "0",
                  icon: <Users size={22} className="text-purple-600" />,
                  bg: "bg-purple-50",
                  sub: "Logged-in users",
                },
              ].map((card, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                  <div className={`${card.bg} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="text-xs text-gray-400">{card.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Daily Trend Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-600" /> Daily Search Trend
              </h2>
              {data?.dailyTrend?.length > 0 ? (
                <div className="flex items-end gap-1 sm:gap-2 h-40">
                  {data.dailyTrend.map((d, i) => {
                    const maxVal = Math.max(...data.dailyTrend.map(x => x.count), 1);
                    const height = d.count === 0 ? 4 : Math.max((d.count / maxVal) * 100, 8);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="relative w-full flex justify-center">
                          <div
                            className="w-full bg-blue-600 hover:bg-blue-700 rounded-t-lg transition-all cursor-pointer relative group"
                            style={{ height: `${height}%`, minHeight: "4px" }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                              {d.count} searches
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center">
                          {new Date(d.date).toLocaleDateString("en-PK", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-10">No search data for this period</p>
              )}
            </div>

            {/* Top Searched Medicines */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Search size={18} className="text-blue-600" /> Top Searched Medicines
              </h2>

              {data?.topSearches?.length > 0 ? (
                <div className="space-y-3">
                  {data.topSearches.map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      {/* Rank */}
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                        i === 0 ? "bg-yellow-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-600" : "bg-gray-300"
                      }`}>
                        {i + 1}
                      </div>

                      {/* Medicine name */}
                      <div className="w-28 sm:w-36 shrink-0">
                        <p className="text-sm font-semibold text-gray-900 capitalize truncate">{item.query}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(item.lastSearched).toLocaleDateString("en-PK", { month: "short", day: "numeric" })}
                        </p>
                      </div>

                      {/* Bar */}
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${BAR_COLORS[i] || "bg-blue-400"}`}
                          style={{ width: `${(item.count / maxCount) * 100}%` }}
                        />
                      </div>

                      {/* Count */}
                      <div className="w-16 text-right shrink-0">
                        <span className="text-sm font-bold text-gray-700">{item.count}</span>
                        <span className="text-xs text-gray-400 ml-1">searches</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Search size={36} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No search data yet</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchAnalytics;