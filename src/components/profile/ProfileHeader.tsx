"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Loader2, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function ProfileHeader() {
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

  const userAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.email || "User"
    )}&background=0D8ABC&color=fff`;

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center text-center">
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 mb-4">
        <Image src={userAvatar} alt="Profile" fill className="object-cover" />
      </div>
      <h1 className="text-xl font-bold text-gray-900">{userName}</h1>
      <p className="text-sm text-teal-600 font-medium mb-4">{user?.email}</p>

      <div className="w-full mt-6 flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium">
          <Settings size={16} /> Edit
        </button>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}
