import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { History, Loader, Trash2, Search, ArrowRight, Clock } from "lucide-react";

const SearchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get("/user/search-history");
        setHistory(data.history || []);
      } catch { toast.error("Failed to load"); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleClear = async () => {
    if (!window.confirm("Delete all history?")) return;
    try {
      await API.delete("/user/search-history");
      setHistory([]);
      toast.success("Cleared");
    } catch { toast.error("Failed"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Loader size={32} className="animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b px-4 py-8 md:px-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <History size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">History</h1>
              <p className="text-gray-500 text-sm">Recent searches</p>
            </div>
          </div>
          {history.length > 0 && (
            <button onClick={handleClear} className="text-xs font-bold text-red-500 uppercase tracking-widest hover:bg-red-50 px-4 py-2 rounded-xl transition border border-red-100">
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-8">
        {history.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Search size={48} className="text-gray-200 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-800">Clean Slate</h2>
            <p className="text-gray-400 text-sm mt-1 mb-8 px-8">No medicine searches recorded in your history.</p>
            <button onClick={() => navigate("/search")} className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-indigo-100">Explore Medicines</button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            {history.map((item, i) => (
              <div 
                key={i} 
                onClick={() => navigate(`/search?q=${item.query}`)}
                className="flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 transition cursor-pointer border-b border-gray-50 last:border-0 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-indigo-600 transition">
                    <Clock size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate uppercase tracking-tight">{item.query}</p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {new Date(item.createdAt).toLocaleDateString("en-PK", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-gray-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHistory;