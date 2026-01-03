"use client";

import React from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function AdminHeader({ title, description, actions }: AdminHeaderProps) {
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
      </div>
    </header>
  );
}
