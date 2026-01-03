"use client";

import {
  ChefHat,
  Home,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type KeyboardEvent } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get current path
  const pathname = usePathname();
  const router = useRouter();

  // Paths where Navbar should be hidden
  const excludedPaths = ["/", "/checkout", "/login", "/register"];

  if (excludedPaths.includes(pathname)) {
    return null;
  }

  // Dummy Cart Count
  const cartCount = 3;

  // Search Handler
  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      router.push(
        `/explore?q=${encodeURIComponent(e.currentTarget.value)}&tab=dishes`
      );
    }
  };

  return (
    <>
      {/* --- DESKTOP TOP NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2">
            <div className="bg-yellow-400 p-1.5 rounded-lg">
              <ChefHat size={24} className="text-teal-900" />
            </div>
            <span className="font-bold text-xl text-teal-900 tracking-tight hidden sm:block">
              Ghorer<span className="text-yellow-500">Khabar</span>
            </span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search for bhorta, curry, or chefs..."
                onKeyDown={handleSearch}
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push("/chef/dashboard")}
              className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-teal-700 transition"
            >
              <ChefHat size={18} />
              <span>Switch to Chef</span>
            </button>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-teal-700 transition"
            >
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/profile"
              className="hidden md:block w-9 h-9 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm"
            >
              <Image
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                alt="Profile"
                width={36}
                height={36}
              />
            </Link>

            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6 flex justify-between z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Link
          href="/feed"
          className={`flex flex-col items-center gap-1 ${
            pathname === "/feed" ? "text-teal-600" : "text-gray-400"
          }`}
        >
          <Home size={22} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        <Link
          href="/explore"
          className={`flex flex-col items-center gap-1 ${
            pathname === "/explore" ? "text-teal-600" : "text-gray-400"
          }`}
        >
          <Search size={22} />
          <span className="text-[10px] font-medium">Explore</span>
        </Link>

        <Link
          href="/orders"
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-teal-600"
        >
          <ShoppingBag size={22} />
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
    </>
  );
}
