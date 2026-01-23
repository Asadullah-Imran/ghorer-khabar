"use client";

import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { useMemo } from "react";

export function ProfileHeader() {
  const { user } = useAuth();

  // Get avatar URL - useMemo to prevent unnecessary recalculations
  const userAvatar = useMemo(() => {
    return (
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.picture ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user?.email || "User"
      )}&background=0D8ABC&color=fff`
    );
  }, [user?.user_metadata?.avatar_url, user?.user_metadata?.picture, user?.email]);

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header Section with Brand Colors */}
      <div className="h-24 bg-gradient-to-r from-[#477e77] to-[#5a9a92] relative">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#feb728] opacity-20 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#feb728] opacity-10 rounded-full translate-y-8 -translate-x-4"></div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="relative px-6 pb-6">
        {/* Avatar - overlapping the gradient */}
        <div className="flex flex-col items-center -mt-14">
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white ring-4 ring-[#feb728]/30">
            <Image
              key={userAvatar} // Force re-render when avatar URL changes
              src={userAvatar}
              alt="Profile"
              fill
              className="object-cover"
              unoptimized // Disable Next.js image optimization to avoid caching
              priority // Load immediately
            />
          </div>

          {/* User Info */}
          <div className="mt-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900">{userName}</h1>
            <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
