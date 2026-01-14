"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import logo from "@/lib/image/logo.png";
import { useRouter } from "next/navigation";



export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to verification page with email in query
        router.push(`/verification?email=${encodeURIComponent(email)}&type=recovery`);
      } else {
        setErrorMsg(data.error || "Failed to send reset code");
      }
    } catch (error) {
      console.error("Failed to send code", error);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-[#FDFBF7] font-sans text-gray-800 transition-colors duration-300 min-h-screen flex flex-col relative overflow-hidden">
      {/* Decorative Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl transform -rotate-12 animate-bounce">🍅</div>
        <div className="absolute top-1/4 right-20 text-5xl transform rotate-45">🍤</div>
        <div className="absolute bottom-20 left-1/4 text-6xl transform rotate-12">🍚</div>
        <div className="absolute bottom-10 right-10 text-7xl transform rotate-12">🥘</div>
      </div>

      <div className="flex-grow flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 p-8 md:p-10">
          <div className="text-center mb-8">
            <Link href="/" aria-label="Home">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#306B62]/10 text-[#306B62] mb-4">
                <Image src={logo} alt="Logo" width={56} height={56} className="object-cover rounded-full" />
              </div>
            </Link>
            <h1 className="text-4xl text-[#306B62] font-semibold mb-1 tracking-wide">Ghorer Khabar</h1>
            <p className="text-[#F59E0B] text-xs font-bold tracking-[0.2em] uppercase">Savor the taste of home</p>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Don't worry, we'll help you get back to your delicious meals. Enter your email to reset your password.
            </p>
          </div>

          <form onSubmit={handleSendResetCode} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email Address</label>
              <div className="relative group">
                
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg("");
                  }}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#306B62] outline-none transition-all"
                />
              </div>
              {errorMsg && <p className="text-red-500 text-xs mt-2 ml-1 font-medium">{errorMsg}</p>}
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3.5 px-4 bg-[#306B62] hover:bg-opacity-90 text-white font-semibold rounded-xl shadow-lg shadow-[#306B62]/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">or</span></div>
          </div>

          <div className="text-center">
            <Link 
            href="/login" 
            className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-[#306B62] transition-colors group"> 
              Back to Login
            </Link>
          </div>
        </div>
      </div>
      <footer className="py-6 text-center z-10">
        <p className="text-xs text-gray-400 font-medium">© 2023 Ghorer Khabar. All rights reserved.</p>
      </footer>
    </div>
  );
}