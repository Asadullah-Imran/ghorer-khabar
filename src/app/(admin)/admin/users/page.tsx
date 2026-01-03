"use client";

import React, { useState } from 'react';
import {
  Search, Filter, ChevronDown, Download, Plus,
  MoreVertical, CheckCircle2, Trash2, Archive
} from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { USER_STATS, USERS_LIST } from '@/lib/dummy-data/admin/userData';

export default function UserManagement() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  return (
    <div className="flex h-screen bg-background-dark text-white font-display overflow-hidden">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <AdminHeader />

        {/* Page Content */}
        <div className="p-8 space-y-8 flex-1">
          {/* Page Title */}
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold">All Users</h2>
              <p className="text-text-muted text-sm mt-1">Manage buyers, sellers, and administrators across the platform.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-surface-dark border border-border-dark rounded-lg text-sm hover:bg-border-dark transition-colors">
                <Download size={16} /> Export CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark font-bold rounded-lg text-sm hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(17,212,180,0.3)]">
                <Plus size={16} /> Add New User
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {USER_STATS.map((stat, i) => (
              <div key={i} className="bg-surface-dark border border-border-dark p-5 rounded-xl">
                <p className="text-sm text-text-muted mb-2">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className={`text-xs ${
                    stat.trend === 'up' ? 'text-primary' : stat.trend === 'down' ? 'text-red-400' : 'text-orange-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="bg-surface-dark border border-border-dark p-4 rounded-xl flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input className="w-full bg-background-dark border-none rounded-lg pl-10 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-white" placeholder="Search by name, email, or phone..." />
            </div>
            <FilterSelect label="Role" />
            <FilterSelect label="Status" />
            <button className="p-2 bg-background-dark rounded-lg hover:bg-border-dark transition-colors">
              <Filter size={18} />
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-darker text-text-muted text-xs uppercase border-b border-border-dark">
                <tr>
                  <th className="px-6 py-4"><input type="checkbox" className="rounded bg-background-dark border border-border-dark" /></th>
                  <th className="px-6 py-4">User Info</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Join Date</th>
                  <th className="px-6 py-4">Orders</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {USERS_LIST.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-darker/50 transition-colors">
                    <td className="px-6 py-4"><input type="checkbox" className="rounded bg-background-dark border border-border-dark" /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-border-dark rounded-full" />
                        <div>
                          <p className="font-bold">{user.name}</p>
                          <p className="text-xs text-text-muted">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 w-fit ${
                        user.role === 'Seller'
                          ? 'bg-secondary/10 text-secondary'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {user.role === 'Seller' ? '💼' : '👤'} {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs">{user.email}</p>
                      <p className="text-xs text-text-muted">{user.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-xs ${
                        user.status === 'Active' ? 'text-primary' : 'text-red-400'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          user.status === 'Active' ? 'bg-primary' : 'bg-red-400'
                        }`} />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-text-muted">{user.joinDate}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold">{user.orders}</p>
                      <p className="text-xs text-text-muted">{user.revenue}</p>
                    </td>
                    <td className="px-6 py-4"><MoreVertical size={16} className="text-text-muted cursor-pointer hover:text-white transition-colors" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selection Toolbar */}
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-surface-dark border border-border-dark px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-primary text-background-dark px-2 py-0.5 rounded-full text-xs font-bold">2</span>
              <span className="text-sm font-medium">Selected</span>
            </div>
            <div className="h-6 w-px bg-border-dark" />
            <button className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors"><CheckCircle2 size={16}/> Verify</button>
            <button className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors"><Archive size={16}/> Archive</button>
            <button className="flex items-center gap-2 text-sm text-red-400 hover:text-red-500 transition-colors"><Trash2 size={16}/> Delete</button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-components
function FilterSelect({ label }: { label: string }) {
  return (
    <div className="bg-background-dark px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer text-sm border border-border-dark hover:border-text-muted transition-colors">
      <span className="font-medium">{label}</span>
      <ChevronDown size={14} className="text-text-muted" />
    </div>
  );
}
