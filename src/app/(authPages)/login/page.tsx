"use client";

import { useToast } from "@/contexts/ToastContext";
import logo from "@/lib/image/logo.png";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2, Lock, Mail, User, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"BUYER" | "SELLER">("BUYER");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const toast = useToast();
  // const { user, loading: authLoading } = useAuth(); // Removed as handled by middleware

  // Redirect logic moved to middleware for better performance

  /**
   * HANDLE GOOGLE LOGIN
   * This triggers the Supabase OAuth flow
   */
  const handleGoogleLogin = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const roleQuery = role.toLowerCase();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // origin helps it work on both localhost and production
        redirectTo: `${origin}/api/auth/callback?role=${roleQuery}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      toast.error("Google Login Failed", error.message);
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
        credentials: "include", // Ensure cookies are sent/received
      });

      if (res.ok) {
        console.log("Login successful - response OK");
        const data = await res.json();
        console.log("Login response data:", data);

        // Wait a bit longer for cookie to be properly set
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Force a hard reload to ensure cookie is picked up
        if (data.user?.role === "SELLER") {
          console.log("Redirecting to /chef/dashboard...");
          window.location.href = "/chef/dashboard";
        } else {
          console.log("Redirecting to /feed...");
          window.location.href = "/feed";
        }
      } else {
        const error = await res.json();
        console.error("Login failed:", error);
        toast.error("Login Failed", error.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login Error", "An error occurred. Please try again.");
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

          {/* Social Login - Google First */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path
                d="M44.5 20H24v8.5h11.9C34.6 32.6 30.1 36 24 36c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.4 0 6.4 1.3 8.7 3.4l6.1-6.1C34.6 3.6 29.6 1.5 24 1.5 11.9 1.5 2.5 10.9 2.5 23S11.9 44.5 24 44.5c11.2 0 20.4-8 20.4-21.5 0-1.5-.2-2.6-.4-3z"
                fill="#4285F4"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-400">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Role Switcher */}
            <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-xl mb-6">
                <button
                    type="button"
                    onClick={() => setRole("BUYER")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        role === "BUYER"
                        ? "bg-white text-[#3d7068] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <User size={16} /> Foodie
                </button>
                <button
                    type="button"
                    onClick={() => setRole("SELLER")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        role === "SELLER"
                        ? "bg-white text-[#3d7068] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <UtensilsCrossed size={16} /> Home Chef
                </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  href="/forgotpassword"
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {loading ? "Signing In..." : "Sign In"}
            </button>
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

import Loading from "@/components/ui/Loading";

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading variant="full" />}>
      <LoginForm />
    </Suspense>
  );
}
