import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut, User, Shield, Menu, X, Search,
  Stethoscope, Zap, ScanLine, FileText, Bookmark, History, ChevronDown
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen]         = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [scrolled, setScrolled]         = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
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

  const userMenuItems = [
    { label: "My Profile",      path: "/profile", icon: <User size={14} /> },
    { label: "Saved Medicines", path: "/saved",   icon: <Bookmark size={14} /> },
    { label: "Search History",  path: "/history", icon: <History size={14} /> },
  ];

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled ? "bg-white/98 backdrop-blur-sm shadow-sm" : "bg-white"
      } border-b border-gray-200`}>

        <div className="max-w-7xl mx-auto px-6">
          <div className="h-[60px] flex items-center justify-between gap-8">

            {/* ── Logo ──────────────────────────────────────────────── */}
            <Link to="/" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 shrink-0"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </div>
              <div>
                <span className="font-bold text-gray-900 text-[15px] tracking-tight">
                  Medico <span className="text-blue-600">Guidance</span>
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav Links ──────────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path}
                  className={`flex items-center gap-1.5 text-[13px] px-3.5 py-2 rounded-lg font-medium transition-all ${
                    isActive(link.path)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>

            {/* ── Desktop Auth ───────────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              {user ? (
                <div className="relative">
                  <button onClick={() => setUserDropdown(!userDropdown)}
                    className={`flex items-center gap-2 h-9 pl-2 pr-3 rounded-lg text-sm transition-all border ${
                      userDropdown
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-[13px] max-w-[90px] truncate">
                      {user.name?.split(" ")[0]}
                    </span>
                    {user.role === "admin" && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">
                        Admin
                      </span>
                    )}
                    <ChevronDown size={13} className={`transition-transform duration-200 ${userDropdown ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown */}
                  {userDropdown && (
                    <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-100 py-1.5 z-50">

                      {/* User Info */}
                      <div className="px-3.5 py-2.5 border-b border-gray-100 mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                      </div>

                      {/* Admin Link */}
                      {user.role === "admin" && (
                        <div className="px-1.5 mb-1">
                          <Link to="/admin" onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                          >
                            <Shield size={13} /> Admin Panel
                          </Link>
                        </div>
                      )}

                      {/* User Links */}
                      <div className="px-1.5">
                        {userMenuItems.map((item) => (
                          <Link key={item.path} to={item.path} onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
                          >
                            {item.icon} {item.label}
                          </Link>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 mt-1 pt-1 px-1.5">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <LogOut size={13} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login"
                    className="text-[13px] font-medium text-gray-600 hover:text-gray-900 px-3.5 py-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    Sign In
                  </Link>
                  <Link to="/register"
                    className="text-[13px] font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* ── Mobile Toggle ──────────────────────────────────────── */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={18} className="text-gray-600" /> : <Menu size={18} className="text-gray-600" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ──────────────────────────────────────────────── */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-3 space-y-0.5">

              {/* Nav Links */}
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive(link.path)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {link.icon} {link.label}
                </Link>
              ))}

              {/* Divider */}
              <div className="border-t border-gray-100 my-2" />

              {user ? (
                <>
                  {/* User Card */}
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg mb-1">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                    </div>
                  </div>

                  {userMenuItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
                    >
                      {item.icon} {item.label}
                    </Link>
                  ))}

                  {user.role === "admin" && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                    >
                      <Shield size={14} /> Admin Panel
                    </Link>
                  )}

                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-1">
                  <Link to="/login" onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center text-sm font-medium border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50 transition"
                  >
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center text-sm font-semibold bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition"
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