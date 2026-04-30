import { useState, useEffect } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { ScanLine, Loader, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

const OcrHistory = () => {
  const [scans, setScans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [expanded, setExpanded] = useState(null);
  const limit = 10;

  useEffect(() => {
    fetchScans();
  }, [page]);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/ocr/history?page=${page}&limit=${limit}`);
      setScans(data.results || []);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load OCR history");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // prevent row expand on click
    if (!window.confirm("Delete this scan record?")) return;
    try {
      await API.delete(`/ocr/history/${id}`);
      setScans(prev => prev.filter(s => s._id !== id));
      setTotal(prev => prev - 1);
      toast.success("Scan deleted");
    } catch {
      toast.error("Failed to delete scan");
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-PK", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const pages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white border-b px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">OCR History</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-1">{total} total scans processed</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{total}</p>
            <p className="text-xs text-gray-600 mt-1 uppercase tracking-wider font-semibold">Total Scans</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{scans.filter(s => s.isFake).length}</p>
            <p className="text-xs text-gray-600 mt-1 uppercase tracking-wider font-semibold">Fake Detected</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{scans.filter(s => !s.isFake).length}</p>
            <p className="text-xs text-gray-600 mt-1 uppercase tracking-wider font-semibold">Verified Real</p>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size={32} className="animate-spin text-blue-600" />
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
            <ScanLine size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400">No scan history found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {scans.map((scan, i) => (
              <div key={scan._id} className="border-b border-gray-50 last:border-0">

                {/* Row */}
                <div
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="flex items-start gap-4 px-4 md:px-6 py-4 hover:bg-gray-50 transition cursor-pointer"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1 ${
                    scan.isFake ? "bg-red-50" : "bg-green-50"
                  }`}>
                    {scan.isFake
                      ? <AlertTriangle size={18} className="text-red-500" />
                      : <CheckCircle size={18} className="text-green-500" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <p className="font-bold text-gray-800 truncate">{scan.medicineName || "Unknown Item"}</p>
                      <span className={`w-fit text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        scan.isFake ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}>
                        {scan.isFake ? "Suspicious" : "Verified"}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {formatDate(scan.createdAt)} • Confidence: {scan.confidence}% • User: {scan.scannedBy?.name || "Guest"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 mt-1">
                    <button
                      onClick={(e) => handleDelete(e, scan._id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                      title="Delete scan">
                      <Trash2 size={16} />
                    </button>
                    <span className="text-gray-400">
                      {expanded === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expanded === i && (
                  <div className="px-4 md:px-6 pb-6 pt-2 border-t border-gray-50 space-y-4 bg-gray-50/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Similarity Score</p>
                        <p className="text-sm font-semibold">{Math.round(scan.similarityScore * 100)}% Match</p>
                      </div>
                      {scan.matchedWith && (
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Matched Against</p>
                          <p className="text-sm font-semibold text-blue-600">{scan.matchedWith}</p>
                        </div>
                      )}
                    </div>
                    {scan.rawText && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Raw OCR Text Extracted</p>
                        <div className="bg-gray-900 rounded-xl p-4">
                          <p className="text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
                            {scan.rawText}
                          </p>
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
          <div className="flex items-center justify-center gap-4 py-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-5 py-2 text-sm bg-white border rounded-xl disabled:opacity-40 shadow-sm">
              Prev
            </button>
            <span className="text-sm text-gray-500 font-medium">Page {page} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="px-5 py-2 text-sm bg-white border rounded-xl disabled:opacity-40 shadow-sm">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OcrHistory;