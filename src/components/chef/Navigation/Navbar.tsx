"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ChefHat, Loader2, LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ChefNavbarProps {
  kitchenName?: string;
  onToggleEditMode?: () => void;
  isEditMode?: boolean;
}

export default function ChefNavbar({
  kitchenName = "Chef's Kitchen",
  onToggleEditMode,
  isEditMode = false
}: ChefNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { signOut, user } = useAuth();
  const router = useRouter();

  // Get user avatar from Google or use default
  const userAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.email || "Chef"
    )}&background=0D8ABC&color=fff`;

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
    <>
      {/* --- DESKTOP TOP NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/chef/dashboard" className="flex items-center gap-2">
            <div className="bg-yellow-400 p-1.5 rounded-lg">
              <Image
                src="/ghorer-khabar-logo.png"
                alt="Ghorer Khabar Logo"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <span className="font-bold text-xl text-teal-900 tracking-tight hidden sm:block">
              Ghorer<span className="text-yellow-500">Khabar</span>
            </span>
          </Link>

          {/* Kitchen Name - Center */}
          <div className="flex-1 flex justify-center">
            <h2 className="text-lg font-bold text-gray-900 hidden md:block">
              {kitchenName}
            </h2>
          </div>

          {/* Right Section - Chef Info & Logout */}
          <div className="flex items-center gap-4">
            {/* Toggle Edit Mode Button (when in edit mode within profile) */}
            {onToggleEditMode && (
              <button
                onClick={onToggleEditMode}
                className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-teal-600 transition"
              >
                <span>{isEditMode ? "Back to View" : "Edit Kitchen"}</span>
              </button>
            )}

            {/* Switch to Buyer Button */}
            {!onToggleEditMode && (
              <button
                onClick={() => router.push("/feed")}
                className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-teal-600 transition"
              >
                <ChefHat size={18} />
                <span>Switch to Buyer</span>
              </button>
            )}

            {/* Profile Button with Menu (Desktop) */}
            <div className="hidden md:flex items-center gap-3 relative">
              {/* Profile Button */}
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="relative w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-teal-600 shadow-sm hover:border-teal-700 transition"
              >
                <Image
                  src={userAvatar}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden min-w-[200px]">
                  <Link
                    href="/chef-profile"
                    className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
                  >
                    View Profile
                  </Link>
                  <Link
                    href="/chef/settings"
                    className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition border-t border-gray-100"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleLogout();
                    }}
                    disabled={isLoggingOut}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition border-t border-gray-100 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden border-2 border-teal-600">
                <Image
                  src={userAvatar}
                  alt="Profile"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
            </div>

            {/* Mobile Menu Items */}
            <Link
              href="/chef-profile"
              className="block px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              View Profile
            </Link>
            <Link
              href="/chef/settings"
              className="block px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Settings
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                router.push("/feed");
              }}
              className="w-full px-4 py-3 text-sm font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition flex items-center justify-center gap-2"
            >
              <ChefHat size={16} />
              Switch to Buyer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
