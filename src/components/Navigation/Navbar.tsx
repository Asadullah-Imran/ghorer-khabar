"use client";

import { useCart } from "@/components/cart/CartProvider";
import { useAuth } from "@/contexts/AuthContext";
import UserNotificationFeed from "@/components/notifications/UserNotificationFeed";
import {
  Bell,
  ChefHat,
  Home,
  Loader2,
  LogOut,
  Menu,
  Search,
  Settings,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { user, role, signOut } = useAuth();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await fetch("/api/user/notifications?limit=10", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setNotifications(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }

      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    if (isProfileMenuOpen || isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen, isNotificationOpen]);

  // Fetch notifications on mount and when dropdown opens
  useEffect(() => {
    if (isNotificationOpen) {
      fetchNotifications();
    }
  }, [isNotificationOpen]);

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

  const excludedPaths = ["/", "/checkout", "/login", "/register"];
  if (excludedPaths.includes(pathname)) return null;

  const cartCount = totalItems;

  // Get user avatar from Google or use default
  const userAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.email || "User"
    )}&background=0D8ABC&color=fff`;

  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      router.push(
        `/explore?q=${encodeURIComponent(e.currentTarget.value)}&tab=dishes`
      );
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2">
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
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            {/* Show Switch to Chef button only for sellers */}
            {role === "SELLER" && (
              <button
                onClick={() => router.push("/chef/dashboard")}
                className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-teal transition"
              >
                <ChefHat size={18} />
                <span>Switch to Chef</span>
              </button>
            )}

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-brand-teal transition"
            >
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Notification Dropdown */}
            <div className="hidden md:block relative" ref={notificationMenuRef}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 text-gray-600 hover:text-brand-teal transition"
                title="Notifications"
              >
                <Bell size={24} />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
                  {notificationsLoading ? (
                    <div className="p-8 text-center">
                      <div className="w-8 h-8 border-4 border-gray-200 border-t-brand-teal rounded-full animate-spin mx-auto"></div>
                      <p className="text-gray-500 mt-2 text-sm">Loading notifications...</p>
                    </div>
                  ) : (
                    <UserNotificationFeed notifications={notifications} />
                  )}
                </div>
              )}
            </div>

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
                        "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <User size={16} />
                    View Profile
                  </Link>

                  <Link
                    href="/profile/settings"
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
            pathname === "/feed" ? "text-brand-teal" : "text-gray-400"
          }`}
        >
          <Home size={22} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        <Link
          href="/explore"
          className={`flex flex-col items-center gap-1 ${
            pathname === "/explore" ? "text-brand-teal" : "text-gray-400"
          }`}
        >
          <Search size={22} />
          <span className="text-[10px] font-medium">Explore</span>
        </Link>

        <Link
          href="/orders"
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-brand-teal"
        >
          <ShoppingBag size={22} />
          <span className="text-[10px] font-medium">Orders</span>
        </Link>

        <Link
          href="/profile"
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-brand-teal"
        >
          <User size={22} />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </>
  );
}
