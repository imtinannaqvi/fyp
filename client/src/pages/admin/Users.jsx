import { useState, useEffect } from "react";
import {
  Users, Search, Filter, MoreVertical, Shield, ShieldOff,
  Trash2, ChevronLeft, ChevronRight, UserCheck, UserX,
  Crown, RefreshCw,
} from "lucide-react";
import API from "../../api/axios";
import { useTheme } from "../../context/ThemeContext";

const AdminUsers = () => {
  const [users,         setUsers]         = useState([]);
  const [allUsers,      setAllUsers]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [roleFilter,    setRoleFilter]    = useState("all");
  const [currentPage,   setCurrentPage]   = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [totalUsers,    setTotalUsers]    = useState(0);
  const [openMenuId,    setOpenMenuId]    = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const { isDark } = useTheme();

  const LIMIT = 10;
  const bg    = isDark ? "#0f172a" : "#f8fafc";
  const card  = isDark ? "#1e293b" : "#ffffff";
  const bdr   = isDark ? "#334155" : "#e5e7eb";
  const txt   = isDark ? "#f1f5f9" : "#111827";
  const sub   = isDark ? "#94a3b8" : "#6b7280";
  const thBg  = isDark ? "#0f172a"  : "#f9fafb";

  const fetchUsers = async (page = currentPage, searchVal = search) => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (searchVal.trim()) params.search = searchVal.trim();
      const res = await API.get("/admin/users", { params });
      const { users: fetched, total, pages } = res.data;
      setAllUsers(fetched || []);
      setTotalPages(pages || 1);
      setTotalUsers(total || 0);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roleFilter === "all") setUsers(allUsers);
    else setUsers(allUsers.filter(u => u.role === roleFilter));
  }, [allUsers, roleFilter]);

  useEffect(() => { fetchUsers(currentPage, search); }, [currentPage]);

  useEffect(() => {
    const t = setTimeout(() => { setCurrentPage(1); fetchUsers(1, search); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    setActionLoading(userId + "-role");
    try {
      await API.patch(`/admin/users/${userId}/role`, { role: newRole });
      setAllUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) { console.error("Role update failed:", err); }
    finally { setActionLoading(null); setOpenMenuId(null); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user permanently?")) return;
    setActionLoading(userId + "-delete");
    try {
      await API.delete(`/admin/users/${userId}`);
      setAllUsers(prev => prev.filter(u => u._id !== userId));
      setTotalUsers(prev => prev - 1);
    } catch (err) { console.error("Delete failed:", err); }
    finally { setActionLoading(null); setOpenMenuId(null); }
  };

  const getRoleBadge = (role) => role === "admin" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
      <Crown size={10} /> Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
      <Users size={10} /> User
    </span>
  );

  const getVerifiedBadge = (v) => v ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-600">
      <UserCheck size={10} /> Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-600">
      <UserX size={10} /> Unverified
    </span>
  );

  const getAvatar = (user) => (
    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
      {user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ backgroundColor: bg, minHeight: "100%" }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-up" style={{ animationDelay: "0ms" }}>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: txt }}>
            <Users className="text-blue-600" size={20} /> User Management
          </h1>
          <p className="text-sm mt-0.5" style={{ color: sub }}>{totalUsers} total registered users</p>
        </div>
        <button onClick={() => fetchUsers(currentPage, search)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition self-start hover:scale-105 active:scale-95">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or email..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ backgroundColor: card, borderColor: bdr, color: txt }}
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            style={{ backgroundColor: card, borderColor: bdr, color: txt }}
            className="pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Roles</option>
            <option value="user">Users Only</option>
            <option value="admin">Admins Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: card, borderColor: bdr, animationDelay: "160ms" }} className="rounded-2xl border shadow-sm overflow-hidden animate-fade-up">
        {loading ? (
          <div className="flex items-center justify-center py-16" style={{ color: sub }}>
            <RefreshCw size={18} className="animate-spin mr-2" /> Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: sub }}>
            <Users size={32} className="mb-3 opacity-30" />
            <p className="font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: thBg, borderBottom: `1px solid ${bdr}` }}>
                  {["#", "User", "Email", "Role", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 font-semibold text-left text-xs uppercase tracking-wide" style={{ color: sub }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user._id} style={{ borderBottom: `1px solid ${bdr}` }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#1e3a5f22" : "#f9fafb"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                    <td className="px-4 py-3 text-xs" style={{ color: sub }}>{(currentPage - 1) * LIMIT + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {getAvatar(user)}
                        <span className="font-medium" style={{ color: txt }}>{user.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: sub }}>{user.email}</td>
                    <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3">{getVerifiedBadge(user.isVerified)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: sub }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-4 py-3 relative">
                      <button onClick={() => setOpenMenuId(openMenuId === user._id ? null : user._id)}
                        className="p-1.5 rounded-lg transition" style={{ color: sub }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#334155" : "#f3f4f6"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        <MoreVertical size={15} />
                      </button>
                      {openMenuId === user._id && (
                        <div style={{ backgroundColor: card, borderColor: bdr }}
                          className="absolute right-6 top-10 z-20 border rounded-xl shadow-lg w-44 py-1 text-sm">
                          <button onClick={() => handleToggleRole(user._id, user.role)}
                            disabled={actionLoading === user._id + "-role"}
                            className="flex items-center gap-2 w-full px-4 py-2 disabled:opacity-50 transition"
                            style={{ color: txt }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#334155" : "#f0f9ff"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                            {user.role === "admin"
                              ? <><ShieldOff size={13} className="text-orange-500" /> Remove Admin</>
                              : <><Shield size={13} className="text-blue-500" /> Make Admin</>}
                          </button>
                          <hr style={{ borderColor: bdr }} />
                          <button onClick={() => handleDelete(user._id)}
                            disabled={actionLoading === user._id + "-delete"}
                            className="flex items-center gap-2 w-full px-4 py-2 text-red-500 disabled:opacity-50 transition"
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#3b0a0a" : "#fef2f2"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                            <Trash2 size={13} />
                            {actionLoading === user._id + "-delete" ? "Deleting..." : "Delete User"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm animate-fade-up" style={{ color: sub, animationDelay: "240ms" }}>
          <p>Page {currentPage} of {totalPages} · {totalUsers} users</p>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              style={{ borderColor: bdr, color: txt }}
              className="flex items-center gap-1 px-3 py-1.5 border rounded-xl disabled:opacity-40 transition"
              onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#334155" : "#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
              <ChevronLeft size={13} /> Prev
            </button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              style={{ borderColor: bdr, color: txt }}
              className="flex items-center gap-1 px-3 py-1.5 border rounded-xl disabled:opacity-40 transition"
              onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? "#334155" : "#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {openMenuId && <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />}
    </div>
  );
};

export default AdminUsers;
