"use client";

import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/components/ui/Loading";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChefGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      console.log("ChefGuard Check:", {
        userEmail: user?.email,
        role,
        hasKitchen: !!user?.kitchen,
        onboardingCompleted: user?.kitchen?.onboardingCompleted,
        pathname,
      });

      if (!user) {
        // Redirect to login if not authenticated
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (role !== "SELLER") {
        // Redirect buyers to feed page
        console.log("Access denied: User is not a seller");
        router.push("/feed");
      } else if (pathname === "/chef-onboarding") {
        // If on onboarding page but already completed
        if (user.kitchen?.onboardingCompleted) {
          // If verified, go to dashboard; otherwise, go to waiting page
          if (user.kitchen?.isVerified) {
            router.push("/chef/dashboard");
          } else {
            router.push("/chef/waiting-approval");
          }
        }
      } else if (pathname === "/chef/waiting-approval") {
        // If on waiting page but verified, redirect to dashboard
        if (user.kitchen?.isVerified) {
          router.push("/chef/dashboard");
        }
        // If onboarding not completed, redirect to onboarding
        if (!user.kitchen?.onboardingCompleted) {
          router.push("/chef-onboarding");
        }
      } else {
        // If accessing OTHER chef pages
        if (!user.kitchen?.onboardingCompleted) {
          // Not completed onboarding, redirect to onboarding
          router.push("/chef-onboarding");
        } else if (!user.kitchen?.isVerified) {
          // Completed onboarding but not verified, redirect to waiting page
          router.push("/chef/waiting-approval");
        }
        // If both completed and verified, allow access to chef routes
      }
    }
  }, [user, loading, role, router, pathname]);

  // Show loading spinner while checking auth
  if (loading) {
    return <Loading variant="full" />;
  }

  // Show nothing while redirecting
  if (!user || role !== "SELLER") {
    return null;
  }

  // User is authenticated as a seller, show content
  return <>{children}</>;
}
