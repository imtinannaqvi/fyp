import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMenu } from "../context/MenuContext";
import {
  LogOut, User, Shield, Menu, X, Search,
  Stethoscope, Zap, ScanLine, FileText, Bookmark, History, ChevronDown, Bell, Phone, MapPin, AlertTriangle, BookOpen, Calculator, Heart
} from "lucide-react";

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
    { label: "Emergency Contacts", path: "/emergency", icon: <Phone size={14} /> },
    { label: "Find Pharmacy", path: "/find-pharmacy", icon: <MapPin size={14} /> },
    { label: "Report Fake Medicine", path: "/report-fake", icon: <AlertTriangle size={14} /> },
    { label: "Health Blog", path: "/health-blog", icon: <BookOpen size={14} /> },
    { label: "Health Calculator", path: "/health-calculator", icon: <Calculator size={14} /> },
    { label: "First Aid Guide", path: "/first-aid", icon: <Heart size={14} /> },
  ];

  const userMenuItems = [
    { label: "My Profile",      path: "/profile", icon: <User size={14} /> },
    { label: "Saved Medicines", path: "/saved",   icon: <Bookmark size={14} /> },
    { label: "Search History",  path: "/history", icon: <History size={14} /> },
    { label: "Reminders",       path: "/reminders", icon: <Bell size={14} /> },
  ];

  return (
    <>
      <nav className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? "shadow-lg" : "shadow-md"
      }`}>

        <div className="max-w-7xl mx-auto px-6">
          <div className="h-20 flex items-center justify-between gap-8">

            {/* ── Logo ──────────────────────────────────────────────── */}
            <Link to="/" onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3.5 shrink-0 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </div>
              <div>
                <span className="font-extrabold text-gray-900 text-xl tracking-tight">
                  Medico<span className="text-blue-600">Guidance</span>
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav Links ──────────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path}
                  className={`relative flex items-center gap-2 text-sm px-5 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    isActive(link.path)
                      ? "text-white bg-blue-600 shadow-md shadow-blue-200"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>

            {/* ── Desktop Auth ───────────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              {user ? (
                <div className="relative">
                  <button onClick={() => setUserDropdown(!userDropdown)}
                    className={`flex items-center gap-3 h-12 pl-3 pr-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      userDropdown
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-sm ${
                      userDropdown ? "bg-white text-blue-600" : "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                    }`}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm max-w-[100px] truncate">
                      {user.name?.split(" ")[0]}
                    </span>
                    {user.role === "admin" && (
                      <span className={`text-[10px] px-2 py-1 rounded-lg font-bold ${
                        userDropdown ? "bg-amber-400 text-amber-900" : "bg-amber-100 text-amber-700"
                      }`}>
                        ADMIN
                      </span>
                    )}
                    <ChevronDown size={16} className={`transition-transform duration-200 ${userDropdown ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown */}
                  {userDropdown && (
                    <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">

                      {/* User Info */}
                      <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-blue-100/50 mx-2 rounded-xl mb-2">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-600 truncate mt-1">{user.email}</p>
                      </div>

                      {/* Admin Link */}
                      {user.role === "admin" && (
                        <div className="px-2 mb-2">
                          <Link to="/admin" onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition"
                          >
                            <Shield size={18} /> Admin Panel
                          </Link>
                        </div>
                      )}

                      {/* User Links */}
                      <div className="px-2">
                        {userMenuItems.map((item) => (
                          <Link key={item.path} to={item.path} onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                          >
                            {item.icon} {item.label}
                          </Link>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 mt-2 pt-2 px-2">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition"
                        >
                          <LogOut size={18} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login"
                    className="text-sm font-bold text-gray-700 hover:text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link to="/register"
                    className="text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-7 py-3 rounded-xl shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* ── Mobile Toggle ──────────────────────────────────────── */}
            <button
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={22} className="text-gray-700" /> : <Menu size={22} className="text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Second Layer - Utility Navigation */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-md">
          <div className="max-w-7xl mx-auto px-6">
            <div className="hidden md:flex items-center justify-center gap-1 py-3">
              {secondaryLinks.map((link) => (
                <Link key={link.path} to={link.path}
                  className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                    isActive(link.path)
                      ? "bg-white text-blue-700 shadow-lg"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className={`transition-transform group-hover:scale-110 ${
                    isActive(link.path) ? "text-blue-600" : ""
                  }`}>
                    {link.icon}
                  </span>
                  <span className="text-xs font-bold">{link.label}</span>
                  {isActive(link.path) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-md" />
                  )}
                </Link>
              ))}
            </div>
            
            {/* Mobile Scrollable - HIDDEN since links are in hamburger menu */}
            {/* <div className="md:hidden overflow-x-auto scrollbar-hide py-3">
              <div className="flex items-center gap-2 min-w-max px-2">
                {secondaryLinks.map((link) => (
                  <Link key={link.path} to={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                      isActive(link.path)
                        ? "bg-white text-blue-700 shadow-md"
                        : "text-white/90 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-sm">{link.icon}</span>
                    <span className="text-xs font-bold">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div> */}
          </div>
        </div>

        {/* ── Mobile Menu ──────────────────────────────────────────────── */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="px-4 py-6 space-y-6">

              {user && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-md">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Navigation</p>
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                          isActive(link.path)
                            ? "text-white bg-blue-600 shadow-md shadow-blue-200"
                            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                      >
                        {link.icon} {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {user && (
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Account</p>
                    <div className="space-y-1">
                      {userMenuItems.map((item) => (
                        <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          {item.icon} {item.label}
                        </Link>
                      ))}

                      {user.role === "admin" && (
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all"
                        >
                          <Shield size={14} /> Admin
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Utility Pages Section */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Access</p>
                <div className="grid grid-cols-2 gap-2">
                  {secondaryLinks.map((link) => (
                    <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive(link.path)
                          ? "text-white bg-blue-600 shadow-md"
                          : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      {link.icon}
                      <span className="truncate">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {user ? (
                <button onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              ) : (
                <div className="space-y-3">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-center text-sm font-bold bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-center text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl shadow-md shadow-blue-200 hover:shadow-lg transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {userDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setUserDropdown(false)} />
      )}
    </>
  );
};

export default Navbar;