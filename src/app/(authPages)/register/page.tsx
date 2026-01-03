"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import logo from "@/lib/image/logo.png";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
    role: "BUYER" as "BUYER" | "SELLER",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Preselect role if coming from seller-focused CTA
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam && ["seller", "SELLER"].includes(roleParam)) {
      setFormData((prev) => ({ ...prev, role: "SELLER" }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * HANDLE GOOGLE LOGIN
   * This triggers the Supabase OAuth flow
   */
  const handleGoogleLogin = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const roleQuery = formData.role.toLowerCase();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // origin helps it work on both localhost and production
        redirectTo: `${origin}/api/auth/callback?role=${roleQuery}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      alert("Error logging in with Google: " + error.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    setLoading(true);
    try {
      // 1. Call the API to initiate OTP via Supabase
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password, // We pass this to store later after verification
          role: formData.role,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Verification code sent to your email!");
        
        // 2. Redirect to verification page with data in query params
        // Use URLSearchParams to safely encode the data
        const params = new URLSearchParams({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          role: formData.role,
        });
        
        router.push(`/verification?${params.toString()}&type=signup`);
      } else {
        alert(result.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FDFBF7] text-gray-800 font-sans min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none z-0"></div>
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#F2A93B] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <div className="container mx-auto px-4 z-10 flex flex-col lg:flex-row items-center justify-center max-w-6xl gap-12 lg:gap-24">
        {/* LEFT SIDE: BRAND INFO */}
        <div className="hidden lg:flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-1/2 space-y-6">
          <Link href="/" aria-label="Home">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-[#3d7068] text-[#3d7068] mb-4">
                <Image src={logo} alt="Logo" width={56} height={56} className="object-cover rounded-full" />
              </div>
            </Link>
          <h1 className="text-5xl lg:text-6xl font-bold text-[#3A6B63] leading-tight">Ghorer Khabar</h1>
          <h2 className="text-2xl font-medium text-[#F2A93B] tracking-widest uppercase">Savor the Taste of Home</h2>
          <p className="text-lg text-gray-600 max-w-md leading-relaxed">
            Join our community of food lovers. Experience the warmth of home-cooked meals delivered right to your doorstep.
          </p>
        </div>

        {/* RIGHT SIDE: REGISTRATION FORM */}
        <div className="w-full max-w-md lg:w-1/2">
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h3>
            <p className="text-gray-500 mb-8 text-sm">Start your culinary journey with us today.</p>

            {/* Role toggle so users can pick buyer or seller */}
            <div className="mb-6 flex gap-3">
              {[
                { label: "I'm buying", value: "BUYER" },
                { label: "I'm selling", value: "SELLER" },
              ].map((option) => {
                const isActive = formData.role === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: option.value as "BUYER" | "SELLER" }))}
                    className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-[#3A6B63] text-white border-[#3A6B63] shadow-lg"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:border-[#3A6B63]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Full Name</label>
                <input type="text" name="name" required placeholder="John Doe" value={formData.name} onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#3A6B63] outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Email Address</label>
                <input type="email" name="email" required placeholder="john@example.com" value={formData.email} onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#3A6B63] outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Password</label>
                <input type="password" name="password" required placeholder="••••••••" value={formData.password} onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#3A6B63] outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Confirm Password</label>
                <input type="password" name="confirmPassword" required placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#3A6B63] outline-none" />
              </div>

              <div className="flex items-center ml-1">
                <input type="checkbox" name="terms" required checked={formData.terms} onChange={handleChange}
                  className="h-4 w-4 text-[#3A6B63] focus:ring-[#3A6B63] border-gray-300 rounded" />
                <label className="ml-2 block text-sm text-gray-600">
                  I agree to the <Link href="#" className="text-[#3A6B63] font-medium hover:underline">Terms of Service</Link>
                </label>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-[#3A6B63] hover:bg-[#2d524c] transition-all transform hover:-translate-y-1 disabled:opacity-50">
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            <div className="my-6 relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">Or continue with</span></div>
            </div>

            <div className="flex gap-3 justify-center">
              <button 
                onClick={handleGoogleLogin}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 hover:shadow-md transition-all active:scale-95"
              >
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M44.5 20H24v8.5h11.9C34.6 32.6 30.1 36 24 36c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.4 0 6.4 1.3 8.7 3.4l6.1-6.1C34.6 3.6 29.6 1.5 24 1.5 11.9 1.5 2.5 10.9 2.5 23S11.9 44.5 24 44.5c11.2 0 20.4-8 20.4-21.5 0-1.5-.2-2.6-.4-3z" fill="#4285F4"/>
                </svg>
                Google
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account? <Link href="/login" className="font-medium text-[#3A6B63] hover:underline">Sign in</Link>
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest">Presented by: MEGAMIND</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}