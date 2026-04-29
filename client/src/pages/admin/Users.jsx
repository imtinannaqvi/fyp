import { useState, useEffect } from "react";
import {
  Users, Search, Filter, MoreVertical, Shield, ShieldOff,
  Trash2, ChevronLeft, ChevronRight, UserCheck, UserX,
  Crown, RefreshCw,
} from "lucide-react";
import axios from "axios";

const AdminUsers = () => {
  const [users, setUsers]               = useState([]);
  const [allUsers, setAllUsers]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [roleFilter, setRoleFilter]     = useState("all");
  const [currentPage, setCurrentPage]   = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalUsers, setTotalUsers]     = useState(0);
  const [openMenuId, setOpenMenuId]     = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const LIMIT = 10;

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchUsers = async (page = currentPage, searchVal = search) => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (searchVal.trim()) params.search = searchVal.trim();

      const res = await axios.get("/api/admin/users", { params, ...getAuthHeader() });

      // ✅ Backend returns "pages" not "totalPages"
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

  // Client-side role filter applied on top of fetched data
  useEffect(() => {
    if (roleFilter === "all") {
      setUsers(allUsers);
    } else {
      setUsers(allUsers.filter((u) => u.role === roleFilter));
    }
  }, [allUsers, roleFilter]);

  useEffect(() => {
    fetchUsers(currentPage, search);
    // eslint-disable-next-line
  }, [currentPage]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, search);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [search]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    setActionLoading(userId + "-role");
    try {
      await axios.patch(`/api/admin/users/${userId}/role`, { role: newRole }, getAuthHeader());
      setAllUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Role update failed:", err);
    } finally {
      setActionLoading(null);
      setOpenMenuId(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user permanently?")) return;
    setActionLoading(userId + "-delete");
    try {
      await axios.delete(`/api/admin/users/${userId}`, getAuthHeader());
      setAllUsers((prev) => prev.filter((u) => u._id !== userId));
      setTotalUsers((prev) => prev - 1);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setActionLoading(null);
      setOpenMenuId(null);
    }
  };

  // ── Badges & Avatar ────────────────────────────────────────────────────────
  const getRoleBadge = (role) =>
    role === "admin" ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
        <Crown size={10} /> Admin
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
        <Users size={10} /> User
      </span>
    );

  const getVerifiedBadge = (isVerified) =>
    isVerified ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-600">
        <UserCheck size={10} /> Verified
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-600">
        <UserX size={10} /> Unverified
      </span>
    );

  const getAvatar = (user) => {
    const initials = user.name
      ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "?";
    return (
      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
        {initials}
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-blue-600" size={24} />
            User Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalUsers} total registered users
          </p>
        </div>
        <button
          onClick={() => fetchUsers(currentPage, search)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition self-start"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Roles</option>
            <option value="user">Users Only</option>
            <option value="admin">Admins Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw size={20} className="animate-spin mr-2" />
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Users size={36} className="mb-3 opacity-30" />
            <p className="font-medium">No users found</p>
            <p className="text-sm">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">User</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Email</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Role</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Joined</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user, idx) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {(currentPage - 1) * LIMIT + idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {getAvatar(user)}
                        <span className="font-medium text-gray-800">{user.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                    <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3">{getVerifiedBadge(user.isVerified)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-PK", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === user._id ? null : user._id)
                        }
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500"
                      >
                        <MoreVertical size={15} />
                      </button>

                      {openMenuId === user._id && (
                        <div className="absolute right-6 top-10 z-20 bg-white border border-gray-200 rounded-xl shadow-lg w-48 py-1 text-sm">
                          <button
                            onClick={() => handleToggleRole(user._id, user.role)}
                            disabled={actionLoading === user._id + "-role"}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-50 text-gray-700 disabled:opacity-50 transition"
                          >
                            {user.role === "admin" ? (
                              <><ShieldOff size={13} className="text-orange-500" /> Remove Admin</>
                            ) : (
                              <><Shield size={13} className="text-blue-500" /> Make Admin</>
                            )}
                          </button>
                          <hr className="my-1 border-gray-100" />
                          <button
                            onClick={() => handleDelete(user._id)}
                            disabled={actionLoading === user._id + "-delete"}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-50 text-red-600 disabled:opacity-50 transition"
                          >
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
        <div className="flex items-center justify-between text-sm text-gray-500">
          <p>Page {currentPage} of {totalPages} · {totalUsers} users total</p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {openMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  );
};

export default AdminUsers;