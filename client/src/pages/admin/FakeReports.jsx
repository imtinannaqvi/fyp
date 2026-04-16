import { useState, useEffect } from "react";
import { AlertTriangle, Loader, Mail, CheckCircle, Search, Eye, X } from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";

const STATUS_STYLES = {
  pending:       "bg-yellow-100 text-yellow-700 border-yellow-200",
  investigating: "bg-blue-100 text-blue-700 border-blue-200",
  verified:      "bg-green-100 text-green-700 border-green-200",
  rejected:      "bg-red-100 text-red-700 border-red-200",
  forwarded:     "bg-purple-100 text-purple-700 border-purple-200",
};

const FakeReports = () => {
  const [reports, setReports]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState(null);
  const [forwarding, setForwarding] = useState(null);
  const [updating, setUpdating]     = useState(null);
  const { isDark } = useTheme();

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/fake-report/all");
      setReports(data.reports || []);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setUpdating(id);
    try {
      await API.put(`/fake-report/${id}/status`, { status });
      setReports(reports.map(r => r._id === id ? { ...r, status } : r));
      if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const handleForward = async (report) => {
    setForwarding(report._id);
    try {
      await API.post(`/fake-report/${report._id}/forward`);
      setReports(reports.map(r => r._id === report._id ? { ...r, status: "forwarded" } : r));
      if (selected?._id === report._id) setSelected(prev => ({ ...prev, status: "forwarded" }));
      toast.success("Report forwarded to DRAP successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to forward report");
    } finally {
      setForwarding(null);
    }
  };

  const filtered = reports.filter(r =>
    r.medicineName?.toLowerCase().includes(search.toLowerCase()) ||
    r.city?.toLowerCase().includes(search.toLowerCase()) ||
    r.reportId?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => new Date(d).toLocaleDateString("en-PK", {
    day: "numeric", month: "short", year: "numeric"
  });

  // ── Theme shortcuts ──────────────────────────────────────────────────────────
  const bg       = isDark ? "#0f172a" : "#f8fafc";
  const card     = isDark ? "#1e293b" : "#ffffff";
  const border   = isDark ? "#334155" : "#e5e7eb";
  const headBg   = isDark ? "#1e293b" : "#ffffff";
  const headBdr  = isDark ? "#334155" : "#e5e7eb";
  const tHeadBg  = isDark ? "#0f172a" : "#f9fafb";
  const tHeadClr = isDark ? "#94a3b8" : "#6b7280";
  const rowHover = isDark ? "#1e3a5f22" : "#f0f9ff";
  const textMain = isDark ? "#f1f5f9" : "#111827";
  const textSub  = isDark ? "#94a3b8"  : "#6b7280";
  const textMono = isDark ? "#60a5fa"  : "#2563eb";
  const divider  = isDark ? "#1e293b"  : "#f9fafb";
  const inputBg  = isDark ? "#1e293b"  : "#ffffff";
  const inputBdr = isDark ? "#334155"  : "#e5e7eb";

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: bg }}>

      {/* Header */}
      <div className="border-b px-4 py-6" style={{ backgroundColor: headBg, borderColor: headBdr }}>
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: textMain }}>Fake Medicine Reports</h1>
            <p className="text-xs mt-0.5" style={{ color: textSub }}>{reports.length} total reports submitted</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 w-full sm:w-72 border"
          style={{ backgroundColor: inputBg, borderColor: inputBdr }}>
          <Search size={14} style={{ color: textSub }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by medicine, city, report ID..."
            className="flex-1 text-sm focus:outline-none bg-transparent"
            style={{ color: textMain }}
          />
        </div>

        {/* Table Card */}
        <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ backgroundColor: card, borderColor: border }}>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader size={28} className="animate-spin text-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <AlertTriangle size={36} className="mx-auto mb-2" style={{ color: textSub }} />
              <p className="text-sm" style={{ color: textSub }}>No reports found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead style={{ backgroundColor: tHeadBg, borderBottom: `1px solid ${border}` }}>
                  <tr>
                    {["Report ID", "Medicine", "City", "Reporter", "Date", "Status", "Actions"].map((h, i) => (
                      <th key={i} className={`px-5 py-3 font-medium text-xs uppercase tracking-wide ${i === 6 ? "text-center" : "text-left"}`}
                        style={{ color: tHeadClr }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r._id} className="transition"
                      style={{ borderBottom: `1px solid ${divider}` }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = rowHover}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <td className="px-5 py-4 font-mono text-xs" style={{ color: textMono }}>{r.reportId}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold" style={{ color: textMain }}>{r.medicineName}</p>
                        {r.manufacturer && <p className="text-xs" style={{ color: textSub }}>{r.manufacturer}</p>}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: textSub }}>{r.city}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm" style={{ color: textMain }}>{r.reporterName || "Anonymous"}</p>
                        <p className="text-xs" style={{ color: textSub }}>{r.reporterPhone}</p>
                      </td>
                      <td className="px-5 py-4 text-xs whitespace-nowrap" style={{ color: textSub }}>{formatDate(r.createdAt)}</td>
                      <td className="px-5 py-4">
                        <select
                          value={r.status}
                          disabled={updating === r._id || r.status === "forwarded"}
                          onChange={e => handleStatusChange(r._id, e.target.value)}
                          className={`text-xs font-semibold px-2 py-1.5 rounded-lg border focus:outline-none disabled:opacity-60 ${STATUS_STYLES[r.status]}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="investigating">Investigating</option>
                          <option value="verified">Verified</option>
                          <option value="rejected">Rejected</option>
                          <option value="forwarded">Forwarded</option>
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelected(r)}
                            title="View Details"
                            className="p-2 rounded-lg transition"
                            style={{ color: "#3b82f6" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#1e3a5f" : "#eff6ff"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleForward(r)}
                            disabled={forwarding === r._id || r.status === "forwarded"}
                            title={r.status === "forwarded" ? "Already forwarded" : "Forward to DRAP"}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              r.status === "forwarded"
                                ? "bg-purple-100 text-purple-500 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                          >
                            {forwarding === r._id ? (
                              <Loader size={12} className="animate-spin" />
                            ) : r.status === "forwarded" ? (
                              <><CheckCircle size={12} /> Forwarded</>
                            ) : (
                              <><Mail size={12} /> Forward to DRAP</>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: card, border: `1px solid ${border}` }}>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: border }}>
              <div>
                <h2 className="font-bold" style={{ color: textMain }}>Report Details</h2>
                <p className="text-xs font-mono" style={{ color: textMono }}>{selected.reportId}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg transition"
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#334155" : "#f3f4f6"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <X size={18} style={{ color: textMain }} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3 text-sm">
              {[
                ["Medicine",          selected.medicineName],
                ["Batch Number",      selected.batchNumber || "N/A"],
                ["Manufacturer",      selected.manufacturer || "N/A"],
                ["Purchase Location", selected.purchaseLocation],
                ["City",              selected.city],
                ["Suspicion Reason",  selected.suspicionReason],
                ["Reporter Name",     selected.reporterName || "Anonymous"],
                ["Reporter Phone",    selected.reporterPhone],
                ["Reporter Email",    selected.reporterEmail || "N/A"],
                ["Submitted By",      selected.user?.name ? `${selected.user.name} (${selected.user.email})` : "N/A"],
                ["Date",              formatDate(selected.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-1 border-b" style={{ borderColor: isDark ? "#1e293b" : "#f3f4f6" }}>
                  <span className="font-semibold shrink-0" style={{ color: textSub }}>{label}</span>
                  <span className="text-right" style={{ color: textMain }}>{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-1">
                <span className="font-semibold" style={{ color: textSub }}>Status</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_STYLES[selected.status]}`}>
                  {selected.status?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={() => handleForward(selected)}
                disabled={forwarding === selected._id || selected.status === "forwarded"}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition ${
                  selected.status === "forwarded"
                    ? "bg-purple-100 text-purple-500 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {forwarding === selected._id ? (
                  <><Loader size={16} className="animate-spin" /> Forwarding...</>
                ) : selected.status === "forwarded" ? (
                  <><CheckCircle size={16} /> Already Forwarded to DRAP</>
                ) : (
                  <><Mail size={16} /> Forward to DRAP (complaints@drap.gov.pk)</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FakeReports;
