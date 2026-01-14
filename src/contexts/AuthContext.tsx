"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

// Supabase user with role field
interface SupabaseUserWithRole extends User {
  role?: string;
}

// Extended user type that can handle both Supabase and JWT users
interface ExtendedUser extends Partial<User> {
  id: string;
  email?: string;
  role?: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
    picture?: string;
    kitchen?: {
      id: string;
      onboardingCompleted: boolean;
      isVerified: boolean;
    };
  };
  kitchen?: {
    id: string;
    onboardingCompleted: boolean;
    isVerified: boolean;
  };
}

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  role: string | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const refreshUser = async () => {
    try {
      // Fetch fresh session data from our API (which merges DB data)
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const { user } = await response.json();
        if (user) {
          setUser(user);
          if (user.role) setRole(user.role);
        }
      } else {
        // Fallback to Supabase client if API fails
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      // Don't clear user on refresh failure to prevent random logouts
      // only clear if we are sure the session is gone
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        // First check Supabase session via server (for OAuth users)
        const sessionResponse = await fetch("/api/auth/session", {
          credentials: "include",
        });
        if (!mounted) return;

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          if (sessionData.user && mounted) {
            console.log("Found Supabase session:", sessionData.user.email);
            setUser(sessionData.user);
            setRole(sessionData.user.role || null);
            setLoading(false);
            return;
          }
        }

        // Check for JWT cookie (for email/password users)
        const jwtResponse = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (!mounted) return;

        if (jwtResponse.ok) {
          const data = await jwtResponse.json();
          if (mounted) {
            console.log("Found JWT session:", data.user.email);
            // Create a user-like object for consistency
            setUser({
              id: data.user.id,
              email: data.user.email,
              role: data.user.role,
              user_metadata: {
                name: data.user.name,
                full_name: data.user.name,
                kitchen: data.user.kitchen,
              },
              kitchen: data.user.kitchen,
            });
            setRole(data.user.role || null);
            setLoading(false);
            return;
          }
        }

        // No session found
        if (mounted) {
          console.log("No session found");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error getting user:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Listen for auth changes (this fires immediately with INITIAL_SESSION)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state changed:", event, session?.user?.email);

      if (event === "INITIAL_SESSION") {
        // Handle initial session load
        if (session?.user) {
          console.log("Initial session user:", session.user.email);
          setUser(session.user);
          setRole((session.user as SupabaseUserWithRole).role || null);
        }
        // Only set loading to false after we've checked our API endpoints
        // Don't set it here to avoid race conditions
      } else if (event === "SIGNED_IN" && session?.user) {
        console.log("User signed in:", session.user.email);
        setUser(session.user);
        setRole((session.user as SupabaseUserWithRole).role || null);
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out");
        setUser(null);
        setRole(null);
        setLoading(false);
        router.push("/login");
      } else if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed:", session?.user?.email);
        setUser(session?.user || null);
        setRole(
          (session?.user as SupabaseUserWithRole | undefined)?.role || null
        );
      }
    });

    // Initialize auth after setting up listener
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signOut = async () => {
    try {
      console.log("Signing out user:", user?.email);

      // Set loading state during logout
      setLoading(true);

      // Call logout API - this handles both Supabase and JWT cookie clearing
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Logout API failed:", response.status);
      }

      // Clear local state immediately
      setUser(null);
      setRole(null);
      setLoading(false);

      // Clear all localStorage (Supabase stores session here)
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        console.log("Cleared localStorage and sessionStorage");
      }

      console.log("User signed out successfully - redirecting to login");

      // Use window.location for a hard refresh to clear all state
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
      // Even if there's an error, clear local state and redirect
      setUser(null);
      setRole(null);
      setLoading(false);

      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, role, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
