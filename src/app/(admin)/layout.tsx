"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If no user is logged in, redirect to admin login
      if (!user) {
        router.push("/admin-login");
        return;
      }

      // If user is logged in but not an admin, redirect to home
      if (role !== "ADMIN") {
        router.push("/");
        return;
      }
    }
  }, [user, loading, role, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-muted">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show loading state if user is not authenticated or not admin
  if (!user || role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-muted">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Render with unified layout: Sidebar + Children
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white">
      <AdminSidebar />
      {children}
    </div>
  );
}
