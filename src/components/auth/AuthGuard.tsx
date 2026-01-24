"use client";

import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/components/ui/Loading";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  // Show loading spinner while checking auth
  if (loading) {
    return <Loading variant="full" />;
  }

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  // User is authenticated, show content
  return <>{children}</>;
}
