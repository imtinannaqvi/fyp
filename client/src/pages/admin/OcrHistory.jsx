import { useState, useEffect } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import { ScanLine, Loader, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

const OcrHistory = () => {
  const [scans,    setScans]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [expanded, setExpanded] = useState(null);
  const { isDark } = useTheme();
  const limit = 10;

  const bg   = isDark ? "#0f172a" : "#f8fafc";
  const card = isDark ? "#1e293b" : "#ffffff";
  const bdr  = isDark ? "#334155" : "#e5e7eb";
  const txt  = isDark ? "#f1f5f9" : "#111827";
  const sub  = isDark ? "#94a3b8" : "#6b7280";

  useEffect(() => { fetchScans(); }, [page]);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/ocr/history?page=${page}&limit=${limit}`);
      setScans(data.results || []);
      setTotal(data.total || 0);
    } catch { toast.error("Failed to load OCR history"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this scan record?")) return;
    try {
      await API.delete(`/ocr/history/${id}`);
      setScans(prev => prev.filter(s => s._id !== id));
      setTotal(prev => prev - 1);
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-PK", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const pages = Math.ceil(total / limit);

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ backgroundColor: bg, minHeight: "100%" }}>

      {/* Header */}
      <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
        <h1 className="text-xl font-bold" style={{ color: txt }}>OCR Scan History</h1>
        <p className="text-sm mt-0.5" style={{ color: sub }}>{total} total scans processed</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Scans",   value: total,                              color: "blue" },
          { label: "Suspicious",    value: scans.filter(s => s.isFake).length, color: "red" },
          { label: "Verified Real", value: scans.filter(s => !s.isFake).length,color: "green" },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: card, borderColor: bdr, animationDelay: `${80 + i * 80}ms` }}
            className="rounded-2xl border p-4 text-center animate-fade-up hover:-translate-y-1 transition-transform duration-200">
            <p className={`text-2xl font-bold text-${s.color}-500`}>{s.value}</p>
            <p className="text-xs font-semibold uppercase tracking-wide mt-1" style={{ color: sub }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-blue-600" /></div>
      ) : scans.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed animate-fade-up" style={{ borderColor: bdr, animationDelay: "320ms" }}>
          <ScanLine size={40} className="mx-auto mb-3" style={{ color: bdr }} />
          <p style={{ color: sub }}>No scan history found</p>
        </div>
      ) : (
        <div style={{ backgroundColor: card, borderColor: bdr, animationDelay: "320ms" }} className="rounded-2xl border shadow-sm overflow-hidden animate-fade-up">
          {scans.map((scan, i) => (
            <div key={scan._id} style={{ borderBottom: i < scans.length - 1 ? `1px solid ${bdr}` : "none" }}>

              {/* Row */}
              <div onClick={() => setExpanded(expanded === i ? null : i)}
                className="flex items-start gap-4 px-5 py-4 cursor-pointer transition"
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#1e3a5f22" : "#f9fafb"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${scan.isFake ? "bg-red-50" : "bg-green-50"}`}>
                  {scan.isFake
                    ? <AlertTriangle size={17} className="text-red-500" />
                    : <CheckCircle size={17} className="text-green-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-bold text-sm" style={{ color: txt }}>{scan.medicineName || "Unknown"}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${scan.isFake ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {scan.isFake ? "Suspicious" : "Verified"}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: sub }}>
                    {formatDate(scan.createdAt)} · Confidence: {scan.confidence}% · {scan.scannedBy?.name || "Guest"}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={e => handleDelete(e, scan._id)}
                    className="p-2 text-red-400 rounded-lg transition"
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#3b0a0a" : "#fef2f2"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                    <Trash2 size={14} />
                  </button>
                  <span style={{ color: sub }}>
                    {expanded === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </div>
              </div>

              {/* Expanded */}
              {expanded === i && (
                <div className="px-5 pb-5 pt-3 space-y-3" style={{ borderTop: `1px solid ${bdr}`, backgroundColor: isDark ? "#0f172a" : "#f9fafb" }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div style={{ backgroundColor: card, borderColor: bdr }} className="p-3 rounded-xl border">
                      <p className="text-[10px] font-bold uppercase mb-1" style={{ color: sub }}>Similarity Score</p>
                      <p className="text-sm font-semibold" style={{ color: txt }}>{Math.round(scan.similarityScore * 100)}% Match</p>
                    </div>
                    {scan.matchedWith && (
                      <div style={{ backgroundColor: card, borderColor: bdr }} className="p-3 rounded-xl border">
                        <p className="text-[10px] font-bold uppercase mb-1" style={{ color: sub }}>Matched Against</p>
                        <p className="text-sm font-semibold text-blue-500">{scan.matchedWith}</p>
                      </div>
                    )}
                  </div>
                  {scan.rawText && (
                    <div>
                      <p className="text-[10px] font-bold uppercase mb-2" style={{ color: sub }}>Raw OCR Text</p>
                      <div className="bg-gray-900 rounded-xl p-4">
                        <p className="text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">{scan.rawText}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ backgroundColor: card, borderColor: bdr, color: txt }}
            className="px-5 py-2 text-sm border rounded-xl disabled:opacity-40 transition">Prev</button>
          <span className="text-sm font-medium" style={{ color: sub }}>Page {page} of {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            style={{ backgroundColor: card, borderColor: bdr, color: txt }}
            className="px-5 py-2 text-sm border rounded-xl disabled:opacity-40 transition">Next</button>
        </div>
      )}
    </div>
  );
};

export default OcrHistory;
