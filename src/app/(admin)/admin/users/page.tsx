"use client";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useConfirmation } from "@/contexts/ConfirmationContext";
import { Eye, Mail, Search, Shield } from "lucide-react";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  emailVerified: boolean;
  phone: string;
}

export default function UsersPage() {
  const { confirm, setLoading: setConfirmLoading } = useConfirmation();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users);
      setFilteredUsers(data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    applyFilters(value, roleFilter);
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    applyFilters(search, role);
  };

  const applyFilters = (searchValue: string, role: string) => {
    let filtered = users;

    if (searchValue) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          u.email.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    if (role !== "ALL") {
      filtered = filtered.filter((u) => u.role === role);
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmed = await confirm({
      title: "Delete User",
      message: "This will permanently delete the user account and all associated data. This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });

    if (confirmed) {
      try {
        setConfirmLoading(true);
        const res = await fetch(`/api/admin/users?id=${userId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setUsers(users.filter((u) => u.id !== userId));
          setFilteredUsers(filteredUsers.filter((u) => u.id !== userId));
          setSelectedUser(null);
        }
      } catch (error) {
        console.error("Failed to delete user:", error);
      } finally {
        setConfirmLoading(false);
      }
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500/20 text-red-400";
      case "SELLER":
        return "bg-purple-500/20 text-purple-400";
      case "BUYER":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-background-dark">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-muted">Loading users...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto flex flex-col">
        <AdminHeader title="Users Management" />

        <div className="p-8 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold mb-2">User Management</h2>
            <p className="text-text-muted">
              Manage all platform users - buyers, sellers, and staff
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-surface-dark border border-border-dark rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-white"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => handleRoleFilter(e.target.value)}
              className="bg-surface-dark border border-border-dark rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-white"
            >
              <option value="ALL">All Roles</option>
              <option value="BUYER">Buyers</option>
              <option value="SELLER">Sellers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-background-dark text-text-muted text-xs uppercase border-b border-border-dark">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-background-dark/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium">{user.name}</td>
                        <td className="px-6 py-4 text-text-muted">{user.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">{user.phone || "N/A"}</td>
                        <td className="px-6 py-4">
                          {user.emailVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400">
                              <Mail size={12} /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400">
                              <Mail size={12} /> Unverified
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-text-muted">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-surface-dark border border-border-dark rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-8 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{selectedUser.name}</h2>
                    <p className="text-text-muted">{selectedUser.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-text-muted hover:text-white text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* User Information */}
                <div className="bg-background-dark rounded-lg p-4 space-y-3">
                  <h3 className="font-bold text-lg">User Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-text-muted text-sm">Name</p>
                      <p className="font-medium">{selectedUser.name}</p>
                    </div>
                    <div>
                      <p className="text-text-muted text-sm">Email</p>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-text-muted text-sm">Phone</p>
                      <p className="font-medium">{selectedUser.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-text-muted text-sm">Role</p>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-bold ${getRoleBadgeColor(
                          selectedUser.role
                        )}`}
                      >
                        {selectedUser.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                <div className="bg-background-dark rounded-lg p-4 space-y-3">
                  <h3 className="font-bold text-lg">Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted">Email Verified</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          selectedUser.emailVerified
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {selectedUser.emailVerified ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted">Account Created</span>
                      <span className="font-medium">
                        {new Date(selectedUser.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border-dark">
                  {selectedUser.role === "SELLER" && (
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-bold">
                      <Shield size={18} /> View Kitchen
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleDeleteUser(selectedUser.id);
                    }}
                    className="flex-1 px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg font-bold transition-colors"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
