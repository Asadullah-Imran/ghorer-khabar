"use client";

import React, { useState } from 'react';
import { Search, Bell, HelpCircle, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AdminHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function AdminHeader({ title, description, actions }: AdminHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/admin/logout', {
        method: 'POST',
      });
      router.push('/admin-login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border-dark bg-background-dark/80 backdrop-blur-md px-8 flex items-center justify-between">
      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
        <input
          className="w-full bg-surface-dark border-none rounded-lg pl-10 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-white"
          placeholder="Search..."
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <button className="p-2 bg-surface-dark rounded-lg relative hover:bg-border-dark transition-colors text-white">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full" />
        </button>
        <button className="p-2 bg-surface-dark rounded-lg hover:bg-border-dark transition-colors text-white">
          <HelpCircle size={20} />
        </button>
        
        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 bg-surface-dark rounded-lg hover:bg-border-dark transition-colors text-white"
          >
            <User size={20} />
            <span className="text-sm">{user?.email?.split('@')[0] || 'Admin'}</span>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-surface-dark border border-border-dark rounded-lg shadow-lg z-20">
                <div className="p-3 border-b border-border-dark">
                  <p className="text-sm text-white font-medium">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-border-dark transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
