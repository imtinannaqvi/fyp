import { useState, useEffect } from "react";
import { AlertTriangle, Loader, Mail, CheckCircle, Clock, Search, Eye, X } from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";

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

  useEffect(() => {
    fetchReports();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white border-b px-4 py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Fake Medicine Reports</h1>
            <p className="text-xs text-gray-500 mt-0.5">{reports.length} total reports submitted</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-full sm:w-72">
          <Search size={14} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by medicine, city, report ID..."
            className="flex-1 text-sm focus:outline-none"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader size={28} className="animate-spin text-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <AlertTriangle size={36} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No reports found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Report ID</th>
                    <th className="text-left px-5 py-3 font-medium">Medicine</th>
                    <th className="text-left px-5 py-3 font-medium">City</th>
                    <th className="text-left px-5 py-3 font-medium">Reporter</th>
                    <th className="text-left px-5 py-3 font-medium">Date</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="text-center px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-mono text-xs text-blue-600">{r.reportId}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">{r.medicineName}</p>
                        {r.manufacturer && <p className="text-xs text-gray-400">{r.manufacturer}</p>}
                      </td>
                      <td className="px-5 py-4 text-gray-600">{r.city}</td>
                      <td className="px-5 py-4">
                        <p className="text-gray-700">{r.reporterName || "Anonymous"}</p>
                        <p className="text-xs text-gray-400">{r.reporterPhone}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                      <td className="px-5 py-4">
                        <select
                          value={r.status}
                          disabled={updating === r._id || r.status === "forwarded"}
                          onChange={e => handleStatusChange(r._id, e.target.value)}
                          className={`text-xs font-semibold px-2 py-1.5 rounded-lg border focus:outline-none ${STATUS_STYLES[r.status]} disabled:opacity-60`}
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
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                            title="View Details"
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="font-bold text-gray-900">Report Details</h2>
                <p className="text-xs text-blue-600 font-mono">{selected.reportId}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <Row label="Medicine"         value={selected.medicineName} />
              <Row label="Batch Number"     value={selected.batchNumber || "N/A"} />
              <Row label="Manufacturer"     value={selected.manufacturer || "N/A"} />
              <Row label="Purchase Location" value={selected.purchaseLocation} />
              <Row label="City"             value={selected.city} />
              <Row label="Suspicion Reason" value={selected.suspicionReason} />
              <Row label="Reporter Name"    value={selected.reporterName || "Anonymous"} />
              <Row label="Reporter Phone"   value={selected.reporterPhone} />
              <Row label="Reporter Email"   value={selected.reporterEmail || "N/A"} />
              <Row label="Submitted By"     value={selected.user?.name ? `${selected.user.name} (${selected.user.email})` : "N/A"} />
              <Row label="Date"             value={formatDate(selected.createdAt)} />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-500">Status</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_STYLES[selected.status]}`}>
                  {selected.status?.toUpperCase()}
                </span>
              </div>
            </div>
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

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4">
    <span className="font-semibold text-gray-500 shrink-0">{label}</span>
    <span className="text-gray-800 text-right">{value}</span>
  </div>
);

export default FakeReports;
