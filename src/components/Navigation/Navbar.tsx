"use client";

import {
  ChefHat,
  FileText,
  Home,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type KeyboardEvent } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Dummy Cart Count (Replace with real state later)
  const cartCount = 3;

  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      router.push(
        `/explore?q=${encodeURIComponent(e.currentTarget.value)}&tab=dishes`
      );
    }
  };

  const handleSearchClick = () => {
    const query = searchQuery.trim();
    if (query.length > 0) {
      router.push(`/explore?q=${encodeURIComponent(query)}&tab=dishes`);
    }
  };

  return (
    <>
      {/* --- DESKTOP TOP NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* 1. Logo */}
          <Link href="/feed" className="flex items-center gap-2">
            <div className="bg-yellow-400 p-1.5 rounded-lg">
              <ChefHat size={24} className="text-teal-900" />
            </div>
            <span className="font-bold text-xl text-teal-900 tracking-tight hidden sm:block">
              Ghorer<span className="text-yellow-500">Khabar</span>
            </span>
          </Link>

          {/* 2. Search Bar (Hidden on small mobile, visible on desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search for bhorta, curry, or chefs..."
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-10 pr-24 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
              <button
                onClick={handleSearchClick}
                className="absolute right-1 top-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm px-3 py-1 rounded-full"
              >
                Search
              </button>
            </div>
          </div>

          {/* 3. Right Actions */}
          <div className="flex items-center gap-6">
            {/* Switch to Chef Mode (Desktop Only) */}
            <button className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-teal-700 transition">
              <ChefHat size={18} />
              <span>Switch to Chef</span>
            </button>

            {/* Cart Icon */}
            <button className="relative p-2 text-gray-600 hover:text-teal-700 transition">
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown (Simplified as Avatar) */}
            <Link
              href="/profile"
              className="hidden md:block w-9 h-9 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm"
            >
              <img
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                alt="Profile"
              />
            </Link>

            {/* Mobile Menu Toggle (Hamburger) */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* --- MOBILE BOTTOM NAVIGATION (Fixed at bottom) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6 flex justify-between z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Link
          href="/feed"
          className="flex flex-col items-center gap-1 text-teal-600"
        >
          <Home size={22} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        <Link
          href="/search"
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-teal-600"
        >
          <Search size={22} />
          <span className="text-[10px] font-medium">Search</span>
        </Link>

        <Link
          href="/orders"
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-teal-600"
        >
          <FileText size={22} />
          <span className="text-[10px] font-medium">Orders</span>
        </Link>

        <Link
          href="/profile"
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-teal-600"
        >
          <User size={22} />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>

      {/* --- MOBILE MENU OVERLAY (If Hamburger is clicked) --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 top-16 p-4 animate-in slide-in-from-top-5">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <Link
              href="/profile"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
            >
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div>
                <p className="font-bold text-sm">Asad User</p>
                <p className="text-xs text-gray-500">View Profile</p>
              </div>
            </Link>
            <div className="h-px bg-gray-100 my-2"></div>
            <button className="flex items-center gap-3 p-2 text-gray-600 font-medium">
              <ChefHat size={20} /> Switch to Chef View
            </button>
            <button className="flex items-center gap-3 p-2 text-red-500 font-medium">
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
