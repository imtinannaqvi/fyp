// src/layouts/AdminLayout.jsx
import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Users, Pill, ScanLine, Bell,
  AlertTriangle, BarChart2, LogOut, Menu, X,
  ChevronRight, Shield, Settings
} from "lucide-react";

const navItems = [
  { label: "Dashboard",        icon: <LayoutDashboard size={18} />, path: "/admin" },
  { label: "Users",            icon: <Users size={18} />,           path: "/admin/users" },
  { label: "Medicines",        icon: <Pill size={18} />,            path: "/admin/medicines" },
  { label: "Add Medicine",     icon: <Pill size={18} />,            path: "/admin/add-medicine" },
  { label: "OCR History",      icon: <ScanLine size={18} />,        path: "/admin/ocr-history" },
  { label: "Fake Reports",     icon: <AlertTriangle size={18} />,   path: "/admin/fake-reports" },
  { label: "Search Analytics", icon: <BarChart2 size={18} />,       path: "/admin/search-analytics" },
  { label: "Settings",         icon: <Settings size={18} />,        path: "/admin/settings" },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>

        {/* Logo */}
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <p className="font-black text-white text-sm">MedicoGuidance</p>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Admin Info */}
        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => (
            <button key={i}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(item.path)
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}>
              <span className={isActive(item.path) ? "text-white" : "text-slate-500"}>
                {item.icon}
              </span>
              {item.label}
              {isActive(item.path) && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-700/50">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-600/10 hover:text-red-400 transition">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 shrink-0">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition">
            <Menu size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-gray-900 text-sm">
              {navItems.find(n => isActive(n.path))?.label || "Admin Panel"}
            </h1>
          </div>
          <button onClick={() => navigate("/")}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition">
            View Site →
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;