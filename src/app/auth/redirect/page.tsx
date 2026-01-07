"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthRedirectPage() {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
        return;
      }

      if (role === "SELLER") {
        router.push("/chef/dashboard");
      } else {
        router.push("/feed");
      }
    }
  }, [user, loading, role, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fefdfa]">
      <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
    </div>
  );
}
