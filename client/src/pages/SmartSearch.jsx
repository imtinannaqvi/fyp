import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { Search, AlertTriangle, Loader, Inbox } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MedicineCard from "../components/MedicineCard";
import MediBot from "../components/MediBot";

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
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
    <>
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 md:top-16 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Medicine Information Search</h1>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 flex items-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-4 py-3 shadow-sm hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200">
              <Search size={20} className="text-blue-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter medicine name (brand or generic)..."
                className="flex-1 text-sm bg-transparent focus:outline-none text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium text-sm px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              {loading ? <Loader size={18} className="animate-spin" /> : "Search"}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200">
            <Loader size={40} className="text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 text-sm">Searching database...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !results && !searchParams.get("q") && (
          <div className="bg-white border border-gray-200 p-12">
            <div className="max-w-3xl mx-auto text-center">
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Medicine Database</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Search for prescription and over-the-counter medications to view dosage information, 
                side effects, warnings, and drug interactions.
              </p>
              <div className="border-t border-gray-200 pt-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Search</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {["Panadol", "Aspirin", "Brufen", "Flagyl"].map((s) => (
                    <button 
                      key={s} 
                      onClick={() => setSearchParams({ q: s })} 
                      className="bg-white border border-gray-300 hover:border-blue-600 hover:text-blue-600 text-gray-700 text-sm font-medium px-5 py-2 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && results && results.medicines?.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white border border-gray-200 px-6 py-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">{results.medicines.length}</span> {results.medicines.length === 1 ? 'result' : 'results'} found
              </p>
              {results.source === "AI Generated" && (
                <span className="flex items-center gap-2 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1">
                  <AlertTriangle size={14} /> AI-Generated
                </span>
              )}
            </div>
            
            <div className="space-y-6">
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

        {/* No Results */}
        {!loading && results && results.medicines?.length === 0 && (
          <div className="bg-white border border-gray-200 p-12 text-center">
            <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600">No matches for "{query}". Please check the spelling or try a generic name.</p>
          </div>
        )}
      </div>
    </div>
    <MediBot />
    </>
  );
};

export default SmartSearch;
