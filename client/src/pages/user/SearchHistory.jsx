import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { History, Loader, Trash2, Search, ChevronRight, Calendar, Clock } from "lucide-react";

const SearchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 page-enter">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Search History</h1>
            <p className="text-gray-600">{history.length} recent {history.length === 1 ? 'search' : 'searches'}</p>
          </div>
          {history.length > 0 && (
            <button 
              onClick={handleClear} 
              className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-6 py-2.5 rounded-xl border border-red-200 transition-all"
            >
              Clear All
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search size={40} className="text-blue-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Search History</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Your medicine searches will be saved here for quick access</p>
            <button 
              onClick={() => navigate("/search")} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2"
            >
              Search Medicines <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => {
              const date = new Date(item.createdAt);
              const isValidDate = !isNaN(date.getTime());
              const isHovered = hoveredId === item._id;
              
              return (
                <div 
                  key={item._id} 
                  onMouseEnter={() => setHoveredId(item._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                          <Search size={24} className="text-white" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2">{item.query}</h3>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-600 font-medium">
                          {isValidDate ? date.toLocaleDateString("en-US", { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric'
                          }) : 'Date unavailable'}
                        </span>
                      </div>
                      
                      {isValidDate && (
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {date.toLocaleTimeString("en-US", { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => navigate(`/search?q=${item.query}`)} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        Search Again
                        <ChevronRight size={16} />
                      </button>
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