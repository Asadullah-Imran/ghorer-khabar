"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3,
  LayoutDashboard,
  Loader2,
  LogOut,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  {
    section: "Main",
    items: [
      {
        icon: <LayoutDashboard size={18} />,
        label: "Dashboard",
        href: "/admin/dashboard",
      },
      { icon: <Users size={18} />, label: "Users", href: "/admin/users" },
      { icon: <Package size={18} />, label: "Content", href: "/admin/content" },
      {
        icon: <Receipt size={18} />,
        label: "Transactions",
        href: "/admin/transactions",
      },
    ],
  },
  {
    section: "Platform",
    items: [
      {
        icon: <ShieldCheck size={18} />,
        label: "Integrity",
        href: "/admin/integrity",
      },
      {
        icon: <BarChart3 size={18} />,
        label: "Reports",
        href: "/admin/reports",
      },
      {
        icon: <Settings size={18} />,
        label: "Settings",
        href: "/admin/settings",
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="hidden w-64 flex-col border-r border-border-dark bg-background-dark lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 gap-3">
        <div className="bg-primary/20 p-2 rounded-lg text-primary">
          <Package size={20} />
        </div>
        <h1 className="text-lg font-bold tracking-tight">Ghorer Khabar</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        {navItems.map((section) => (
          <div key={section.section}>
            <p className="px-2 text-xs font-semibold uppercase text-text-muted mb-4">
              {section.section}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-text-muted hover:bg-surface-dark hover:text-white"
                    }`}
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin Profile Card */}
      <div className="p-4 border-t border-border-dark">
        <div className="bg-surface-dark p-3 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-border-dark" />
            <div>
              <p className="text-sm font-bold">
                {user?.user_metadata?.full_name ||
                  user?.user_metadata?.name ||
                  "Admin User"}
              </p>
              <p className="text-xs text-text-muted">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogOut size={16} />
            )}
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </aside>
  );
}
