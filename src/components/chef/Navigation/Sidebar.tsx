"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { chefNavItems } from "@/lib/navigation/chefNavItems";

export default function ChefSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("chef-sidebar-collapsed");
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("chef-sidebar-collapsed", JSON.stringify(newState));
  };

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside
        className={`hidden md:flex bg-white border-r border-gray-200 flex-col sticky top-16 h-[calc(100vh-64px)] transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64 lg:w-72"
        }`}
      >
        {/* Collapse Toggle Button */}
        <div className="flex justify-end p-2 border-b border-gray-200">
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>

        {/* Sidebar Content */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
          {chefNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-lg transition-all group relative ${
                  isCollapsed
                    ? "justify-center px-3 py-3"
                    : "gap-3 px-4 py-3"
                } ${
                  isActive
                    ? isCollapsed
                      ? "bg-teal-50 text-teal-700"
                      : "bg-teal-50 text-teal-700 font-semibold border-l-4 border-teal-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full border-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="border-t border-gray-200 p-4">
            <p className="text-xs text-gray-500 text-center">
              Ghorer Khabar v1.0
            </p>
          </div>
        )}
      </aside>

    </>
  );
}
