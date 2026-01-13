"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

// Extended user type that can handle both Supabase and JWT users
interface ExtendedUser extends Partial<User> {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
    picture?: string;
  };
}

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const refreshUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        // First check Supabase session via server (for OAuth users)
        const sessionResponse = await fetch("/api/auth/session");
        if (!mounted) return;

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          if (sessionData.user && mounted) {
            console.log("Found Supabase session:", sessionData.user.email);
            setUser(sessionData.user);
            setLoading(false);
            return;
          }
        }

        // Check for JWT cookie (for email/password users)
        const jwtResponse = await fetch("/api/auth/me");
        if (!mounted) return;

        if (jwtResponse.ok) {
          const data = await jwtResponse.json();
          if (mounted) {
            console.log("Found JWT session:", data.user.email);
            // Create a user-like object for consistency
            setUser({
              id: data.user.id,
              email: data.user.email,
              user_metadata: {
                name: data.user.name,
                full_name: data.user.name,
              },
            });
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
        }
        // Only set loading to false after we've checked our API endpoints
        // Don't set it here to avoid race conditions
      } else if (event === "SIGNED_IN" && session?.user) {
        console.log("User signed in:", session.user.email);
        setUser(session.user);
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out");
        setUser(null);
        setLoading(false);
        router.push("/login");
      } else if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed:", session?.user?.email);
        setUser(session?.user || null);
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
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        console.error("Logout API failed:", response.status);
      }

      // Clear local state immediately
      setUser(null);
      setLoading(false);

      // Redirect to login page
      router.push("/login");

      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      // Even if there's an error, clear local state and redirect
      setUser(null);
      setLoading(false);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
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
