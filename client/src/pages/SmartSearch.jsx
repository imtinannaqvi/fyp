import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { Search, AlertTriangle, Loader, Inbox, Database } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MedicineCard from "../components/MedicineCard";
import MediBot from "../components/MediBot";
import { useTheme } from "../context/ThemeContext";

const SmartSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  const doSearch = useCallback(async (searchQuery) => {
    const term = searchQuery?.trim();
    if (!term) {
      setResults(null);
      return;
    }

    setLoading(true);
    setShowDropdown(false);
    try {
      const { data } = await API.get(`/medicine/smart-search?q=${encodeURIComponent(term)}`);
      setResults(data);

      // ✅ Only log search history if user is logged in with a valid token
      const token = localStorage.getItem("token");
      if (user && token) {
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

  const fetchSuggestions = useCallback(async (searchQuery) => {
    const term = searchQuery?.trim();
    if (!term || term.length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    try {
      const { data } = await API.get(`/medicine/autocomplete?q=${encodeURIComponent(term)}`);
      setSuggestions(data.suggestions || []);
      setShowDropdown(data.suggestions?.length > 0);
    } catch (err) {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      doSearch(q);
    } else {
      setResults(null);
      setQuery("");
    }
  }, [searchParams, doSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    clearTimeout(debounceRef.current);
    setShowDropdown(false);

    if (trimmedQuery === searchParams.get("q")) {
      doSearch(trimmedQuery);
    } else {
      setSearchParams({ q: trimmedQuery });
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    clearTimeout(debounceRef.current);

    if (value.trim().length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 400);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.name);
    setShowDropdown(false);
    setSuggestions([]);
    setSearchParams({ q: suggestion.name });
  };

  const handleSaveToggle = (medicineId, isSaved) => {
    setSavedIds((prev) =>
      isSaved ? [...prev, medicineId] : prev.filter((id) => id !== medicineId)
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
        {/* Search Header */}
        <div style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderBottom: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }} className="sticky top-0 md:top-16 z-10 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <h1 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Medicine Information Search</h1>
            <form onSubmit={handleSearch} className="relative">
              <div className="flex gap-3">
                <div ref={dropdownRef} className="flex-1 relative">
                  <div style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: isDark ? '#475569' : '#d1d5db' }} className="flex items-center gap-3 border-2 rounded-lg px-4 py-3 shadow-sm transition-all duration-200">
                    <Search size={20} className="text-blue-500" />
                    <input
                      type="text"
                      value={query}
                      onChange={handleInputChange}
                      onFocus={() => query && suggestions.length > 0 && setShowDropdown(true)}
                      placeholder="Enter medicine name (brand or generic)..."
                      style={{ backgroundColor: 'transparent', color: isDark ? '#f1f5f9' : '#111827', outline: 'none', border: 'none' }}
                      className="hero-search-input flex-1 text-sm placeholder:text-gray-400"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setSuggestions([]);
                          setShowDropdown(false);
                          clearTimeout(debounceRef.current);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Dropdown */}
                  {showDropdown && suggestions.length > 0 && (
                    <div style={{
                      background: isDark ? '#1e293b' : '#ffffff',
                      border: isDark ? '1px solid #334155' : '1px solid #d1d5db',
                      borderRadius: '12px',
                      boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.1)'
                    }} className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto z-50">
                      {suggestions.map((suggestion, i) => (
                        <div
                          key={suggestion._id || i}
                          onClick={() => handleSuggestionClick(suggestion)}
                          style={{
                            borderBottom: i < suggestions.length - 1 ? (isDark ? '1px solid #334155' : '1px solid #f1f5f9') : 'none'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? '#334155' : '#eff6ff'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                          className="px-4 py-3 cursor-pointer transition-colors"
                        >
                          <div style={{ color: isDark ? '#f1f5f9' : '#111827' }} className="font-medium text-sm">
                            <span style={{ color: '#3b82f6', fontWeight: '600' }}>
                              {suggestion.name.slice(0, query.length)}
                            </span>
                            {suggestion.name.slice(query.length)}
                          </div>
                          {(suggestion.brand || suggestion.generic) && (
                            <div style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mt-1">
                              {suggestion.brand && <span>Brand: {suggestion.brand}</span>}
                              {suggestion.brand && suggestion.generic && <span className="mx-1">•</span>}
                              {suggestion.generic && <span>Generic: {suggestion.generic}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium text-sm px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {loading ? <Loader size={18} className="animate-spin" /> : "Search"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Loading */}
          {loading && (
            <div className={`flex flex-col items-center justify-center py-20 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <Loader size={40} className="text-blue-600 animate-spin mb-4" />
              <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'} text-sm`}>Searching database...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !results && !searchParams.get("q") && (
            <div className={`border p-12 rounded-lg ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <div className="max-w-3xl mx-auto text-center">
                <Database size={48} className="mx-auto text-blue-600 mb-4" />
                <h2 className={`text-2xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Medicine Database</h2>
                <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'} mb-8 leading-relaxed`}>
                  Search for prescription and over-the-counter medications to view dosage information,
                  side effects, warnings, and drug interactions.
                </p>
                <div className={`border-t pt-6 ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Search</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {["Panadol", "Aspirin", "Brufen", "Flagyl"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSearchParams({ q: s })}
                        className={`border rounded px-5 py-2 text-sm font-medium transition ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-blue-500' : 'bg-white border-gray-300 hover:border-blue-600 hover:text-blue-600 text-gray-700'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Unified Results Section */}
          {!loading && results && results.medicines?.length > 0 && (
            <div className="space-y-6">
              <div className={`flex items-center justify-between border px-6 py-4 rounded-lg ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{results.medicines.length}</span>{" "}
                  {results.medicines.length === 1 ? "result" : "results"} found
                </p>
                {results.source !== "database" && (
                  <span className="flex items-center gap-2 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1">
                    <AlertTriangle size={14} /> AI-Generated Information
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
            <div className={`border p-12 text-center rounded-lg ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Results Found</h3>
              <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                No matches for "{query}". Please check the spelling or try a generic name.
              </p>
            </div>
          )}
        </div>
      </div>
      <MediBot />
    </>
  );
};

export default SmartSearch;