"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import logo from "@/lib/image/logo.png";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Route Info
  const email = searchParams.get("email") || "";
  const name = searchParams.get("name") || "";
  const type = searchParams.get("type"); // 'recovery' or 'signup'

  // State Management
  const [step, setStep] = useState<"otp" | "password">("otp");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  /**
   * HANDLE RESEND OTP
   */
  const handleResendOTP = async () => {
    setResending(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const isRecovery = type === "recovery";
      
      if (isRecovery) {
        // Resend forgot password OTP
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (res.ok) {
          setSuccessMsg("New code sent to your email!");
          setTimeout(() => setSuccessMsg(""), 5000);
        } else {
          setErrorMsg(data.error || "Failed to resend code");
        }
      } else {
        // Resend registration OTP
        const desiredRole = (searchParams.get("role") || "BUYER").toUpperCase();
        const password = searchParams.get("password");

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email, 
            password, 
            name,
            role: desiredRole 
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setSuccessMsg("New code sent to your email!");
          setTimeout(() => setSuccessMsg(""), 5000);
        } else {
          setErrorMsg(data.error || "Failed to resend code");
        }
      }
    } catch (err) {
      setErrorMsg("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  /**
   * HANDLE STEP 1: VERIFY OTP
   */
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setErrorMsg("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const isRecovery = type === "recovery";
      
      const desiredRole = (searchParams.get("role") || "BUYER").toUpperCase();

      const payload = {
        email,
        otp: code,
        type: type || "email",
        // Only send name/password during initial registration
        ...(isRecovery ? {} : { name, password: searchParams.get("password"), role: desiredRole }),
      };

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (isRecovery) {
          setSuccessMsg("Code verified! Please enter your new password.");
          setStep("password"); // Switch to Password Step for recovery
        } else {
          setSuccessMsg("Account verified! Redirecting to feed...");
          setTimeout(() => router.push("/feed"), 1500); // Complete registration and go to feed
        }
      } else {
        setErrorMsg(data.error || "Invalid verification code.");
      }
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * HANDLE STEP 2: SET NEW PASSWORD (Recovery only)
   */
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: code,
          password: newPassword,
          type: "recovery",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Password changed successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setErrorMsg(data.error || "Failed to update password.");
      }
    } catch (err) {
      setErrorMsg("Error updating password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FDFBF7] font-sans text-gray-800 min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl transform animate-float">🍅</div>
        <div className="absolute bottom-10 right-10 text-7xl transform animate-float-delayed">🥘</div>
      </div>

      <div className="flex-grow flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 p-8 md:p-10 transition-all">
          <div className="text-center mb-8">
            <Link href="/" aria-label="Home">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-[#306B62] text-[#306B62] mb-4 overflow-hidden">
                <Image src={logo} alt="Logo" width={64} height={64} className="object-cover rounded-full" />
              </div>
            </Link>
            <h1 className="text-4xl text-[#306B62] font-semibold mb-1 tracking-wide">Ghorer Khabar</h1>
            <p className="text-[#F59E0B] text-xs font-bold tracking-[0.2em] uppercase">Savor the taste of home</p>
          </div>

          {step === "otp" ? (
            /* --- OTP VERIFICATION STEP --- */
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
                <p className="text-gray-500 text-sm">We've sent a 6-digit code to <strong>{email}</strong></p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 text-center uppercase">Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, ""));
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-2xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-[#306B62] outline-none transition-all"
                    required
                  />
                  {errorMsg && <p className="text-red-500 text-xs mt-2 text-center font-medium">{errorMsg}</p>}
                  {successMsg && <p className="text-green-600 text-xs mt-2 text-center font-medium">{successMsg}</p>}
                </div>

                <button 
                  type="submit" 
                  disabled={loading || code.length !== 6} 
                  className="w-full py-3.5 bg-[#306B62] text-white font-semibold rounded-xl shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">Didn't receive code?</span></div>
              </div>

              <button
                onClick={handleResendOTP}
                disabled={resending}
                className="w-full py-3 bg-gray-100 text-[#306B62] font-semibold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? "Sending..." : "Resend Code"}
              </button>
            </>
          ) : (
            /* --- NEW PASSWORD STEP (FOR RECOVERY) --- */
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h2>
                <p className="text-gray-500 text-sm">Please enter your new secure password.</p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 ml-1 uppercase">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#306B62] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 ml-1 uppercase">Confirm Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#306B62] outline-none"
                  />
                </div>
                {errorMsg && <p className="text-red-500 text-xs text-center font-medium">{errorMsg}</p>}
                {successMsg && <p className="text-green-600 text-xs text-center font-medium">{successMsg}</p>}
                
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-3.5 bg-[#306B62] text-white font-semibold rounded-xl shadow-lg transition-all hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </>
          )}

          <div className="text-center mt-8">
            <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-[#306B62]">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyCode() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyCodeContent />
    </Suspense>
  );
}