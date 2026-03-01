import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { Search, AlertTriangle, Loader, Inbox } from "lucide-react"; // Added Inbox for empty states
import { useAuth } from "../context/AuthContext";
import MedicineCard from "../components/MedicineCard";

const SmartSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState([]);

  const doSearch = useCallback(async (searchQuery) => {
    const term = searchQuery?.trim();
    if (!term) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.get(`/medicine/smart-search?q=${encodeURIComponent(term)}`);
      setResults(data);
      
      // Log history only on successful search
      if (user) {
        API.post("/user/search-history", { query: term }).catch(() => {});
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Search failed";
      toast.error(msg);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Sync: Listen to URL changes and trigger search
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q); // Sync input field with URL
      doSearch(q);
    } else {
      setResults(null);
      setQuery("");
    }
  }, [searchParams, doSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) return;

    // If searching for the same thing again, manually trigger search 
    // because setSearchParams won't trigger the useEffect if the value is identical
    if (trimmedQuery === searchParams.get("q")) {
      doSearch(trimmedQuery);
    } else {
      setSearchParams({ q: trimmedQuery });
    }
  };

  const handleSaveToggle = (medicineId, isSaved) => {
    setSavedIds(prev => 
      isSaved ? [...prev, medicineId] : prev.filter(id => id !== medicineId)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white border-b sticky top-0 md:top-16 z-10 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-2 sm:gap-3">
            <div className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search brand or generic..."
                className="flex-1 text-sm bg-transparent focus:outline-none text-gray-700"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium text-sm px-5 sm:px-8 rounded-xl transition-colors shrink-0"
            >
              {loading ? <Loader size={18} className="animate-spin" /> : "Search"}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* State 1: Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader size={32} className="text-blue-600 animate-spin" />
            <p className="text-gray-500 text-sm animate-pulse">Analyzing medical database...</p>
          </div>
        )}

        {/* State 2: No Search Performed yet */}
        {!loading && !results && !searchParams.get("q") && (
          <div className="text-center py-20 animate-in fade-in duration-500">
            <div className="text-6xl mb-4">💊</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Search Any Medicine</h2>
            <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">Enter a medicine name to get dosage, side effects, and precautions.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Panadol", "Aspirin", "Brufen", "Flagyl"].map((s) => (
                <button 
                  key={s} 
                  onClick={() => setSearchParams({ q: s })} 
                  className="bg-white border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-600 text-sm px-4 py-2 rounded-xl transition-all active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* State 3: Search Results Found */}
        {!loading && results && results.medicines?.length > 0 && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
               <p className="text-sm text-gray-500">
                Found <span className="font-bold text-gray-800">{results.medicines.length}</span> results
               </p>
               {results.source === "AI Generated" && (
                 <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                   <AlertTriangle size={12} /> AI Assisted Info
                 </span>
               )}
            </div>
            
            <div className="space-y-4">
              {results.medicines.map((med, i) => (
                <MedicineCard 
                  key={med._id || `med-${i}`} 
                  medicine={med} 
                  source={results.source} 
                  savedIds={savedIds} 
                  onSaveToggle={handleSaveToggle} 
                />
              ))}
            </div>
          </div>
        )}

        {/* State 4: Search Performed but 0 Results */}
        {!loading && results && results.medicines?.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No results for "{query}"</h3>
            <p className="text-sm text-gray-400 mt-1">Try checking the spelling or use a generic name.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartSearch;