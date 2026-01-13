"use client";

import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

export function ProfileHeader() {
  const { user } = useAuth();

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
      <p className="text-sm text-teal-600 font-medium">{user?.email}</p>
    </div>
  );
}
