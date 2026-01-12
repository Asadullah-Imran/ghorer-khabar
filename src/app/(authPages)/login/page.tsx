"use client";

import { useAuth } from "@/contexts/AuthContext";
import logo from "@/lib/image/logo.png";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (!authLoading && user) {
      const redirect = searchParams.get("redirect") || "/feed";
      router.push(redirect);
    }
  }, [user, authLoading, router, searchParams]);

  /**
   * HANDLE GOOGLE LOGIN
   * This triggers the Supabase OAuth flow
   */
  const handleGoogleLogin = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // origin helps it work on both localhost and production
        redirectTo: `${origin}/api/auth/callback?role=buyer`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      alert("Error logging in with Google: " + error.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        console.log("Login successful");

        // Wait a bit for the Supabase session to be established
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Refresh the page to let AuthContext pick up the new session
        window.location.href = "/feed";
      } else {
        const error = await res.json();
        alert(error.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fefdfa] flex items-center justify-center p-4 font-body">
      {/* Background Decorative Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#fbb03b] rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-100">
        {/* LEFT SIDE: LOGIN FORM */}
        <div className="w-full md:w-1/2 p-10 md:p-16">
          <div className="text-center mb-10">
            {/* Logo Icon */}
            <Link href="/" aria-label="Home">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-[#3d7068] text-[#3d7068] mb-4">
                <Image
                  src={logo}
                  alt="Logo"
                  width={56}
                  height={56}
                  className="object-cover rounded-full"
                />
              </div>
            </Link>
            <h1 className="font-display text-3xl font-bold text-[#3d7068] tracking-tight">
              Ghorer Khabar
            </h1>
            <p className="text-[#fbb03b] text-xs font-bold uppercase tracking-widest mt-1">
              Savor the Taste of Home
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email or Username
              </label>
              <div className="relative">
                {/* Field background set to brand teal (#3d7068) */}
                <input
                  type="text"
                  placeholder="foodie@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-6 pr-4 py-3 bg-[#3d7068] border-none text-white placeholder-white/60 rounded-xl focus:ring-2 focus:ring-[#fbb03b] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <Link
                  href="/forgotpassword"
                  className="text-xs font-bold text-[#3d7068] hover:text-[#fbb03b]"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                {/* Field background set to brand teal (#3d7068) */}
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-6 pr-4 py-3 bg-[#3d7068] border-none text-white placeholder-white/60 rounded-xl focus:ring-2 focus:ring-[#fbb03b] outline-none transition-all"
                />
              </div>
            </div>

            {/* Login button with white text and teal background */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#3d7068] hover:bg-[#2d5650] text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 mt-4 disabled:opacity-70"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
            <div className="my-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400">Or </span>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleGoogleLogin} // This triggers the function
                type="button"
                className="w-full inline-flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 hover:shadow transition-colors active:scale-95"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M44.5 20H24v8.5h11.9C34.6 32.6 30.1 36 24 36c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.4 0 6.4 1.3 8.7 3.4l6.1-6.1C34.6 3.6 29.6 1.5 24 1.5 11.9 1.5 2.5 10.9 2.5 23S11.9 44.5 24 44.5c11.2 0 20.4-8 20.4-21.5 0-1.5-.2-2.6-.4-3z"
                    fill="#4285F4"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-[#3d7068] font-bold hover:underline"
            >
              Create one now
            </Link>
          </p>
        </div>

        {/* RIGHT SIDE: BRAND PANEL */}
        <div className="hidden md:flex w-1/2 bg-[#3d7068] relative items-center justify-center p-12 overflow-hidden">
          <div className="relative z-10 text-center text-white">
            <div className="relative w-64 h-64 mx-auto mb-8">
              <div className="absolute inset-0 bg-black/20 rounded-full blur-2xl transform translate-y-4"></div>
              <div className="relative w-full h-full rounded-full border-4 border-white/20 overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd"
                  alt="Healthy Food"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <h2 className="text-3xl font-display font-bold mb-4 leading-tight">
              Fresh from the kitchen to your table.
            </h2>
            <p className="text-white/80 text-lg leading-relaxed max-w-xs mx-auto">
              Experience the warmth of home-cooked meals delivered with love.
            </p>

            <p className="mt-12 text-[10px] uppercase tracking-[0.2em] font-bold opacity-40">
              Presented by Megamind
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fefdfa] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
