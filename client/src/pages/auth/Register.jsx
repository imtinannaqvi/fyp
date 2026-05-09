import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { User, Mail, Lock, Loader, Eye, EyeOff, AtSign } from "lucide-react";

// ✅ Generate username suggestions from typed input
const generateUsernameSuggestions = (input) => {
  if (!input || input.trim().length < 2) return [];

  const base = input.trim().toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');

  if (!base) return [];

  const shortYear = String(new Date().getFullYear()).slice(2);
  const fullYear = new Date().getFullYear();

  return [...new Set([
    base,
    `${base}_official`,
    `${base}${shortYear}`,
    `${base}_${shortYear}`,
    `${base}${fullYear}`,
    `the_${base}`,
    `${base}.pro`,
    `${base}x`,
    `${base}hq`,
    `real_${base}`,
    `${base}123`,
    `${base}_dev`,
  ])].slice(0, 6);
};

const getBadge = (username) => {
  if (username.includes('official')) return { label: 'official', color: '#eff6ff', text: '#3b82f6' };
  if (username.includes('pro'))      return { label: 'pro',      color: '#f0fdf4', text: '#16a34a' };
  if (username.includes('dev'))      return { label: 'dev',      color: '#faf5ff', text: '#9333ea' };
  if (username.includes('hq'))       return { label: 'hq',       color: '#fff7ed', text: '#ea580c' };
  if (username.includes('real'))     return { label: 'real',     color: '#fef2f2', text: '#dc2626' };
  if (/\d{4}/.test(username))        return { label: 'year',     color: '#f8fafc', text: '#64748b' };
  if (/\d+/.test(username))          return { label: 'numeric',  color: '#f8fafc', text: '#64748b' };
  return                                     { label: 'clean',   color: '#f0fdf4', text: '#16a34a' };
};

const Register = () => {
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" }); // ✅ username added
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionsRef = useRef(null);
  const usernameInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
        usernameInputRef.current && !usernameInputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ When name is typed, auto-generate username suggestions
  const handleNameChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, name: value }));
    // Auto-fill username field if it's still empty
    if (!form.username) {
      const base = value.trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
      if (base) setForm(prev => ({ ...prev, name: value, username: base }));
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, username: value }));
    setHighlightedIndex(-1);
    const s = generateUsernameSuggestions(value);
    setSuggestions(s);
    setShowSuggestions(s.length > 0);
  };

  const handleSuggestionClick = (username) => {
    setForm(prev => ({ ...prev, username }));
    setShowSuggestions(false);
    setSuggestions([]);
    usernameInputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : suggestions.length - 1);
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6)
      return toast.error("Password must be at least 6 characters");

    setLoading(true);
    try {
      await API.post("/auth/register", form); // sends name, username, email, password
      toast.success("Account created!");
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 border border-blue-100">

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">MG</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm mt-2">Join MedicoGuidance</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Full Name</label>
            <div className="relative mt-1">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleNameChange}
                required
                placeholder="Your full name"
                autoComplete="off"
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Username with suggestions */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Username
              {form.username && (
                <span className="ml-2 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  @{form.username}
                </span>
              )}
            </label>
            <div className="relative mt-1">
              <AtSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
              <input
                ref={usernameInputRef}
                type="text"
                name="username"
                value={form.username}
                onChange={handleUsernameChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  const s = generateUsernameSuggestions(form.username || form.name);
                  if (s.length > 0) { setSuggestions(s); setShowSuggestions(true); }
                }}
                required
                placeholder="e.g. ali_official"
                autoComplete="off"
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
              />

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-2xl overflow-hidden z-50"
                  style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
                >
                  <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-gray-50">
                    <AtSign size={11} className="text-blue-400" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Username suggestions
                    </p>
                  </div>

                  {suggestions.map((username, index) => {
                    const badge = getBadge(username);
                    return (
                      <div
                        key={username}
                        onMouseDown={() => handleSuggestionClick(username)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onMouseLeave={() => setHighlightedIndex(-1)}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all"
                        style={{
                          background: highlightedIndex === index ? '#eff6ff' : 'transparent',
                          borderLeft: highlightedIndex === index ? '3px solid #3b82f6' : '3px solid transparent'
                        }}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: highlightedIndex === index ? '#dbeafe' : '#f8fafc' }}
                        >
                          <AtSign size={12} color={highlightedIndex === index ? '#3b82f6' : '#94a3b8'} />
                        </div>
                        <span className="flex-1 text-sm font-semibold text-gray-700 font-mono">
                          {username}
                        </span>
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                          style={{ background: badge.color, color: badge.text }}
                        >
                          {badge.label}
                        </span>
                        {highlightedIndex === index && (
                          <span className="text-blue-400 text-xs">↵</span>
                        )}
                      </div>
                    );
                  })}

                  <div className="px-4 py-2 border-t border-gray-50 bg-gray-50/50">
                    <p className="text-[10px] text-gray-400">
                      ↑↓ navigate &nbsp;·&nbsp; Enter select &nbsp;·&nbsp; Esc close
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <div className="relative mt-1">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} required placeholder="name@example.com"
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <div className="relative mt-1">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPass ? "text" : "password"} name="password"
                value={form.password} onChange={handleChange} required
                placeholder="Minimum 6 characters"
                className="w-full border border-gray-200 rounded-xl pl-11 pr-11 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
          >
            {loading
              ? <><Loader className="animate-spin" size={18} /> Creating...</>
              : "Create Account"
            }
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;