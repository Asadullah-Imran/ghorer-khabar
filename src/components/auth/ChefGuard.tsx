"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChefGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (role !== "SELLER") {
        // Redirect buyers to feed page
        console.log("Access denied: User is not a seller");
        router.push("/feed");
      }
    }
  }, [user, loading, role, router, pathname]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user || role !== "SELLER") {
    return null;
  }

  // User is authenticated as a seller, show content
  return <>{children}</>;
}
