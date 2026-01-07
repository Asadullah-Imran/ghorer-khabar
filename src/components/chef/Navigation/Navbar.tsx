"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Home, Loader2, LogOut, Menu, Settings, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function ChefNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [kitchenName, setKitchenName] = useState("Chef's Kitchen");
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Fetch kitchen data on mount
  useEffect(() => {
    const fetchKitchen = async () => {
      try {
        const res = await fetch("/api/chef/onboarding");
        const data = await res.json();
        if (data.success && data.data?.kitchen) {
          setKitchenName(data.data.kitchen.name || "Chef's Kitchen");
        }
      } catch (error) {
        console.error("Failed to fetch kitchen data:", error);
      }
    };
    fetchKitchen();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setIsProfileMenuOpen(false);
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  // Get user avatar from Google or use default
  const userAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.email || "Chef"
    )}&background=14b8a6&color=fff`;

  return (
    <>
      {/* --- DESKTOP TOP NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/chef/dashboard" className="flex items-center gap-2">
            <Image
              src="/ghorer-khabar-logo.png"
              alt="Ghorer Khabar Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="font-bold text-xl text-brand-teal tracking-tight hidden sm:block">
              Ghorer<span className="text-primary">Khabar</span>
            </span>
          </Link>

          {/* Kitchen Name - Center */}
          <div className="flex-1 flex justify-center">
            <h2 className="text-lg font-bold text-gray-900 hidden md:block">
              {kitchenName}
            </h2>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6">
            {/* Switch to Buyer Button */}
            <button
              onClick={() => router.push("/feed")}
              className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-teal transition"
            >
              <Home size={18} />
              <span>Switch to Buyer</span>
            </button>

            {/* Profile Dropdown */}
            <div className="hidden md:block relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm hover:border-brand-teal transition"
                title={user?.email || "Profile"}
              >
                <Image
                  src={userAvatar}
                  alt={user?.user_metadata?.full_name || "Profile"}
                  width={36}
                  height={36}
                  className="object-cover"
                />
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.user_metadata?.full_name ||
                        user?.user_metadata?.name ||
                        "Chef"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    href="/chef/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <User size={16} />
                    View Profile
                  </Link>

                  <Link
                    href="/chef/settings"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition border-t border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <LogOut size={16} />
                    )}
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* --- MOBILE MENU --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 shadow-sm">
          <div className="px-4 py-6 space-y-4">
            {/* Kitchen Name */}
            <div>
              <h2 className="text-lg font-bold text-gray-900">{kitchenName}</h2>
            </div>

            {/* Chef Info */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden border-2 border-brand-teal">
                <Image
                  src={userAvatar}
                  alt="Profile"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {user?.user_metadata?.full_name ||
                    user?.user_metadata?.name ||
                    "Chef"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Mobile Menu Items */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                router.push("/feed");
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <Home size={16} />
              Switch to Buyer
            </button>

            <Link
              href="/chef/profile"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User size={16} />
              View Profile
            </Link>

            <Link
              href="/chef/settings"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Settings size={16} />
              Settings
            </Link>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              disabled={isLoggingOut}
              className="w-full px-4 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
      )}
    </>
  );
}
