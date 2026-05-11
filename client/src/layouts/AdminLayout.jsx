import { useState } from "react";
import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import {
  LayoutDashboard, Users, Pill, ScanLine,
  AlertTriangle, BarChart2, LogOut, Menu, X,
  ChevronRight, Shield, Settings, PlusCircle,
  Globe, ExternalLink
} from "lucide-react";

const navItems = [
  { label: "Dashboard",        icon: <LayoutDashboard size={17} />, path: "/admin" },
  { label: "Users",            icon: <Users size={17} />,           path: "/admin/users" },
  { label: "Medicines",        icon: <Pill size={17} />,            path: "/admin/medicines" },
  { label: "Add Medicine",     icon: <PlusCircle size={17} />,      path: "/admin/add-medicine" },
  { label: "OCR History",      icon: <ScanLine size={17} />,        path: "/admin/ocr-history" },
  { label: "Fake Reports",     icon: <AlertTriangle size={17} />,   path: "/admin/fake-reports" },
  { label: "Search Analytics", icon: <BarChart2 size={17} />,       path: "/admin/search-analytics" },
  { label: "Settings",         icon: <Settings size={17} />,        path: "/admin/settings" },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { isDark }       = useTheme();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [open, setOpen]  = useState(false);

  const isActive = (path) =>
    path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);

  const handleLogout = () => { logout(); window.location.href = "/login"; };

  const currentLabel = navItems.find(n => isActive(n.path))?.label || "Admin Panel";

  const sideBg  = isDark ? "#0f172a" : "#1e293b";
  const sideBdr = isDark ? "#1e293b" : "#334155";
  const mainBg  = isDark ? "#0f172a" : "#f8fafc";
  const topBg   = isDark ? "#1e293b" : "#ffffff";
  const topBdr  = isDark ? "#334155" : "#e5e7eb";
  const txtMain = isDark ? "#f1f5f9" : "#111827";
  const txtSub  = isDark ? "#94a3b8" : "#6b7280";

  return (
    // This wrapper fills exactly the remaining height below the Navbar
    <div className="flex overflow-hidden" style={{ backgroundColor: mainBg, height: "100vh" }}>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={`flex flex-col shrink-0 w-60 z-50 transition-transform duration-300
          fixed lg:static inset-y-0 left-0
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{
          backgroundColor: sideBg,
          borderRight: `1px solid ${sideBdr}`,
          height: "100vh",
          overflowY: "auto",
        }}>

        {/* Move to Website Button */}
        <div className="px-3 pt-3 shrink-0">
          <Link to="/"
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all group"
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              boxShadow: "0 4px 15px rgba(37,99,235,0.4)"
            }}>
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-white/30 transition">
              <Globe size={13} className="text-white" />
            </div>
            <span className="text-white flex-1">Move to Website</span>
            <ExternalLink size={12} className="text-white/70 group-hover:text-white transition" />
          </Link>
        </div>

        {/* Admin info */}
        <div style={{ borderBottom: `1px solid ${sideBdr}` }} className="px-3 py-3 shrink-0">
          <div className="flex items-center gap-2.5 bg-slate-800/60 rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item, i) => (
            <button key={i}
              onClick={() => { navigate(item.path); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(item.path)
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}>
              <span className={isActive(item.path) ? "text-white" : "text-slate-500"}>{item.icon}</span>
              {item.label}
              {isActive(item.path) && <ChevronRight size={13} className="ml-auto" />}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ borderTop: `1px solid ${sideBdr}` }} className="p-2 shrink-0">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-600/10 hover:text-red-400 transition">
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header style={{ backgroundColor: topBg, borderBottom: `1px solid ${topBdr}` }}
          className="px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={() => setOpen(true)}
            className="lg:hidden p-2 rounded-xl transition"
            style={{ backgroundColor: isDark ? "#334155" : "#f3f4f6" }}>
            <Menu size={18} style={{ color: txtSub }} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <Shield size={16} className="text-blue-600" />
            <h1 className="font-bold text-sm" style={{ color: txtMain }}>Admin Panel</h1>
            <span className="text-slate-400 mx-1">/</span>
            <span className="text-sm" style={{ color: txtSub }}>{currentLabel}</span>
          </div>
          <ThemeToggle />
        </header>

        {/* Page content — scrollable */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
