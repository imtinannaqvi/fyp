import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { User, Mail, Lock, Loader, Eye, EyeOff } from "lucide-react";

// ── Username generator ────────────────────────────────────────────────────────
const generateUsernames = (name) => {
  if (!name || name.trim().length < 2) return [];
  const base = name.trim().toLowerCase().replace(/\s+/g, "");
  const nums = [Math.floor(Math.random() * 900) + 100, Math.floor(Math.random() * 9000) + 1000];
  const specials = ["_", ".", "__"];
  const suggestions = [
    `${base}${nums[0]}`,
    `${base}${specials[0]}${nums[1]}`,
    `${base}${specials[1]}${nums[0]}`,
    `${base}${specials[2]}${nums[0]}`,
    `${base}${nums[1]}`,
    `the${specials[0]}${base}`,
  ];
  return [...new Set(suggestions)].slice(0, 5);
};

// ── Username validation ───────────────────────────────────────────────────────
const validateUsername = (username) => {
  if (username.length < 5)          return { valid: false, msg: "At least 5 characters required" };
  if (!/[0-9]/.test(username))      return { valid: false, msg: "Must contain at least one number" };
  if (!/[!@#$%^&*_.\-]/.test(username)) return { valid: false, msg: "Must contain at least one special character (_, ., -, @, etc.)" };
  if (!/^[a-zA-Z0-9_.\-@]+$/.test(username)) return { valid: false, msg: "Only letters, numbers and _ . - @ allowed" };
  return { valid: true, msg: "Username looks good!" };
};

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [username, setUsername]       = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [usernameStatus, setUsernameStatus]   = useState(null); // {valid, msg}
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  // Auto-generate suggestions when name changes
  useEffect(() => {
    if (form.name.trim().length >= 2) {
      setSuggestions(generateUsernames(form.name));
    } else {
      setSuggestions([]);
    }
  }, [form.name]);

  // Validate username on change
  useEffect(() => {
    if (username.length > 0) {
      setUsernameStatus(validateUsername(username));
    } else {
      setUsernameStatus(null);
    }
  }, [username]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (s) => {
    setUsername(s);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (!username) {
      return toast.error("Please enter a username");
    }

    const check = validateUsername(username);
    if (!check.valid) {
      return toast.error(check.msg);
    }

    setLoading(true);
    try {
      await API.post("/auth/register", { ...form, username });
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
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input
                type="text" name="name" value={form.name}
                onChange={handleChange} required placeholder="John Doe"
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Username</label>
            <div className="relative mt-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">@</span>
              <input
                type="text" value={username}
                onChange={handleUsernameChange}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                required placeholder="e.g. john_doe123"
                className={`w-full border rounded-xl pl-8 pr-4 py-3 text-sm focus:ring-2 outline-none transition ${
                  usernameStatus === null ? "border-gray-200 focus:ring-blue-500" :
                  usernameStatus.valid   ? "border-green-400 focus:ring-green-400" :
                                           "border-red-400 focus:ring-red-400"
                }`}
              />
            </div>

            {/* Validation message */}
            {usernameStatus && (
              <p className={`text-xs mt-1 font-medium ${usernameStatus.valid ? "text-green-600" : "text-red-500"}`}>
                {usernameStatus.valid ? "✓ " : "✗ "}{usernameStatus.msg}
              </p>
            )}

            {/* Rules hint */}
            {!usernameStatus && (
              <p className="text-xs text-gray-400 mt-1">
                Must include numbers & special character (_, ., -)
              </p>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && form.name.length >= 2 && (
              <div className="mt-2">
                <p className="text-xs text-gray-400 mb-1.5">💡 Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i} type="button"
                      onClick={() => handleSuggestionClick(s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${
                        username === s
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                      }`}
                    >
                      @{s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <div className="relative mt-1">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
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
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input
                type={showPass ? "text" : "password"} name="password"
                value={form.password} onChange={handleChange}
                required placeholder="Minimum 6 characters"
                className="w-full border border-gray-200 rounded-xl pl-11 pr-11 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>

          <button disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition">
            {loading ? <><Loader className="animate-spin" size={18}/> Creating...</> : "Create Account"}
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