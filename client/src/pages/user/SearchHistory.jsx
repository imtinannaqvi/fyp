import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { History, Loader, Trash2, Search, ChevronRight, Calendar } from "lucide-react";

const SearchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
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
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-gray-900">Search History</h1>
              <p className="text-xs text-gray-500 mt-0.5">{history.length} recent searches</p>
            </div>
            {history.length > 0 && (
              <button onClick={handleClear} className="text-xs font-medium text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition border border-red-200">
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5">
        {history.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-10 text-center">
            <Search size={36} className="text-gray-300 mx-auto mb-3" />
            <h2 className="text-sm font-semibold text-gray-900 mb-1">No Search History</h2>
            <p className="text-xs text-gray-500 mb-5">Your medicine searches will appear here</p>
            <button onClick={() => navigate("/search")} className="bg-blue-600 text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-blue-700">
              Search Medicines
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {history.map((item, i) => {
              const date = new Date(item.createdAt);
              const isValidDate = !isNaN(date.getTime());
              
              return (
                <div 
                  key={i} 
                  onClick={() => navigate(`/search?q=${item.query}`)}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Search size={18} />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition">
                    {item.query}
                  </h3>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar size={13} className="text-gray-400" />
                      <span className="font-medium">
                        {isValidDate ? date.toLocaleDateString("en-US", { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric'
                        }) : 'Date unavailable'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-[13px]"></span>
                      <span>
                        {isValidDate ? date.toLocaleTimeString("en-US", { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true
                        }) : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHistory;