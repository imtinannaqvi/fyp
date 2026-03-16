import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMenu } from "../context/MenuContext";
import {
  LogOut, User, Shield, Menu, X, Search,
  Stethoscope, Zap, ScanLine, FileText, Bookmark, History,
  ChevronDown, Bell, AlertTriangle, BookOpen, Calculator,
  ShieldAlert, 
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isMenuOpen, setIsMenuOpen } = useMenu();
  const navigate = useNavigate();
  const location = useLocation();
  const [userDropdown, setUserDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setUserDropdown(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMenuOpen(false);
    setUserDropdown(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: "Search",        path: "/search",       icon: <Search size={14} /> },
    { label: "Symptoms",      path: "/symptoms",     icon: <Stethoscope size={14} /> },
    { label: "Interactions",  path: "/interactions", icon: <Zap size={14} /> },
    { label: "Scan Medicine", path: "/ocr",          icon: <ScanLine size={14} /> },
    { label: "Prescription",  path: "/prescription", icon: <FileText size={14} /> },
  ];

  const secondaryLinks = [
    { label: "Report Fake Medicine", path: "/report-fake",       icon: <AlertTriangle size={14} /> },
    { label: "Health Blog",          path: "/health-blog",       icon: <BookOpen size={14} /> },
    { label: "Health Calculator",    path: "/health-calculator", icon: <Calculator size={14} /> },
    { label: "Awareness",            path: "/awareness",         icon: <ShieldAlert size={14} /> },
    { label: "Compare",              path: "/compare",           icon: <Zap size={14} /> },
  ];

  const userMenuItems = [
    { label: "My Profile",      path: "/profile",   icon: <User size={14} /> },
    { label: "Saved Medicines", path: "/saved",     icon: <Bookmark size={14} /> },
    { label: "Search History",  path: "/history",   icon: <History size={14} /> },
    { label: "Reminders",       path: "/reminders", icon: <Bell size={14} /> },
  ];

  const { isDark } = useTheme();

  return (
    <>
      <nav style={{ backgroundColor: isDark ? '#111827' : '#ffffff', borderBottom: isDark ? '1px solid #1f2937' : '1px solid #e5e7eb', boxShadow: scrolled ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none' }} className="sticky top-0 z-50 transition-shadow duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-16 sm:h-20 flex items-center justify-between gap-4 sm:gap-8">

            {/* Logo */}
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 sm:gap-3.5 shrink-0 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-md">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </div>
              <span style={{ color: isDark ? '#ffffff' : '#111827' }} className="font-extrabold text-lg sm:text-xl tracking-tight">
                Medico<span className="text-blue-600">Guidance</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path}
                  style={!isActive(link.path) ? { color: isDark ? '#e2e8f0' : '#374151' } : {}}
                  className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl font-semibold transition-all ${
                    isActive(link.path)
                      ? "text-white bg-blue-600 shadow-md"
                      : isDark
                        ? "hover:text-white hover:bg-slate-700"
                        : "hover:text-blue-600 hover:bg-blue-50"
                  }`}>
                  {link.icon} {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Auth + Theme Toggle */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <ThemeToggle />
              {user ? (
                <div className="relative">
                  <button onClick={() => setUserDropdown(!userDropdown)}
                    style={userDropdown
                      ? { backgroundColor: '#2563eb', color: '#ffffff', border: 'none' }
                      : isDark
                        ? { backgroundColor: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' }
                        : { backgroundColor: '#eff6ff', color: '#374151', border: '1px solid #dbeafe' }
                    }
                    className="flex items-center gap-2 h-11 pl-3 pr-4 rounded-xl text-sm font-semibold transition-all">
                    <div style={userDropdown
                      ? { backgroundColor: '#ffffff', color: '#2563eb' }
                      : { backgroundColor: '#2563eb', color: '#ffffff' }
                    } className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[80px] truncate">{user.name?.split(" ")[0]}</span>
                    {user.role === "admin" && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${userDropdown ? "bg-amber-400 text-amber-900" : "bg-amber-100 text-amber-700"}`}>ADMIN</span>
                    )}
                    <ChevronDown size={14} className={`transition-transform ${userDropdown ? "rotate-180" : ""}`} />
                  </button>

                  {userDropdown && (
                    <div style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#f3f4f6' }} className="absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-2xl border py-2 z-50">
                      <div style={{ backgroundColor: isDark ? '#334155' : '#eff6ff' }} className="px-4 py-3 mx-2 rounded-xl mb-2">
                        <p style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-sm font-bold truncate">{user.name}</p>
                        <p style={{ color: isDark ? '#94a3b8' : '#6b7280' }} className="text-xs truncate">{user.email}</p>
                      </div>
                      {user.role === "admin" && (
                        <div className="px-2 mb-1">
                          <Link to="/admin" onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition">
                            <Shield size={16} /> Admin Panel
                          </Link>
                        </div>
                      )}
                      <div className="px-2">
                        {userMenuItems.map((item) => (
                          <Link key={item.path} to={item.path} onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition">
                            {item.icon} {item.label}
                          </Link>
                        ))}
                      </div>
                      <div style={{ borderColor: isDark ? '#334155' : '#f3f4f6' }} className="border-t mt-1 pt-1 px-2">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition">
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-blue-600 px-4 py-2.5 rounded-xl hover:bg-blue-50 border border-gray-200 transition">Sign In</Link>
                  <Link to="/register" className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md transition">Get Started</Link>
                </div>
              )}
            </div>

            {/* Mobile: Theme Toggle + Hamburger */}
            <div className="md:hidden flex items-center gap-2 shrink-0">
              <ThemeToggle />
              <button
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={20} className="text-gray-700" /> : <Menu size={20} className="text-gray-700" />}
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Bar - Desktop */}
        <div style={{ background: 'linear-gradient(to right, #2563eb, #1d4ed8, #1e40af)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="hidden md:flex items-center justify-center gap-1 py-2.5">
              {secondaryLinks.map((link) => (
                <Link key={link.path} to={link.path}
                  style={isActive(link.path) ? { backgroundColor: '#ffffff', color: '#1d4ed8' } : {}}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold transition-all ${
                    isActive(link.path)
                      ? ""
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}>
                  {link.icon}
                  <span className="text-xs font-bold">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderTop: isDark ? '1px solid #334155' : '1px solid #f3f4f6' }} className="md:hidden shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-5 space-y-5">

              {/* User Info */}
              {user && (
                <div style={{ backgroundColor: isDark ? '#1e293b' : '#eff6ff', borderColor: isDark ? '#334155' : '#dbeafe' }} className="rounded-2xl p-4 border">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-sm font-bold truncate">{user.name}</p>
                      <p style={{ color: isDark ? '#94a3b8' : '#6b7280' }} className="text-xs truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div>
                <p style={{ color: isDark ? '#64748b' : '#9ca3af' }} className="text-xs font-bold uppercase tracking-wider mb-2">Navigation</p>
                <div className="grid grid-cols-2 gap-1">
                  {navLinks.map((link) => (
                    <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive(link.path)
                          ? "text-white bg-blue-600"
                          : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      }`}>
                      {link.icon} {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Access */}
              <div>
                <p style={{ color: isDark ? '#64748b' : '#9ca3af' }} className="text-xs font-bold uppercase tracking-wider mb-2">Quick Access</p>
                <div className="grid grid-cols-2 gap-1">
                  {secondaryLinks.map((link) => (
                    <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive(link.path)
                          ? "text-white bg-blue-600"
                          : "text-gray-700 hover:text-blue-600 hover:bg-blue-50 bg-gray-50"
                      }`}>
                      {link.icon}
                      <span className="truncate">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Account */}
              {user && (
                <div>
                  <p style={{ color: isDark ? '#64748b' : '#9ca3af' }} className="text-xs font-bold uppercase tracking-wider mb-2">Account</p>
                  <div className="grid grid-cols-2 gap-1">
                    {userMenuItems.map((item) => (
                      <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        {item.icon} {item.label}
                      </Link>
                    ))}
                    {user.role === "admin" && (
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all col-span-2">
                        <Shield size={14} /> Admin Panel
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Auth Buttons */}
              {user ? (
                <button onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all">
                  <LogOut size={16} /> Sign Out
                </button>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-center text-sm font-bold bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-center text-sm font-bold bg-blue-600 text-white py-3 rounded-xl shadow-md transition">
                    Get Started
                  </Link>
                </div>
              )}

            </div>
          </div>
        )}
      </nav>

      {userDropdown && <div className="fixed inset-0 z-40" onClick={() => setUserDropdown(false)} />}
    </>
  );
};

export default Navbar;