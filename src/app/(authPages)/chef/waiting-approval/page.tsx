"use client";

import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/components/ui/Loading";
import { Clock, Home, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WaitingApprovalPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [kitchenName, setKitchenName] = useState<string | null>(null);

  // Fetch kitchen name
  useEffect(() => {
    const fetchKitchenName = async () => {
      try {
        const response = await fetch("/api/chef/onboarding");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.kitchen?.name) {
            setKitchenName(data.data.kitchen.name);
          }
        }
      } catch (error) {
        console.error("Error fetching kitchen name:", error);
      }
    };

    if (user?.kitchen?.id) {
      fetchKitchenName();
    }
  }, [user]);

  // Check if user is verified (poll every 30 seconds)
  useEffect(() => {
    if (!user || !user.kitchen) return;

    // If verified, redirect to dashboard
    if (user.kitchen.isVerified) {
      router.push("/chef/dashboard");
      return;
    }

    // Poll for status updates every 30 seconds
    const interval = setInterval(async () => {
      setCheckingStatus(true);
      await refreshUser();
      setCheckingStatus(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [user, router, refreshUser]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setCheckingStatus(true);
    await refreshUser();
    setCheckingStatus(false);
    
    // Check if verified after refresh
    if (user?.kitchen?.isVerified) {
      router.push("/chef/dashboard");
    }
  };

  if (loading) {
    return <Loading variant="full" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-12 h-12 text-yellow-600" />
              </div>
              {checkingStatus && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            Waiting for Admin Approval
          </h1>

          {/* Message */}
          <p className="text-lg text-gray-600 mb-8">
            Thank you for completing your kitchen onboarding! Your application is now under review by our admin team.
          </p>

          {/* Status Card */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-yellow-700 flex-shrink-0 mt-1" />
              <div className="text-left flex-1">
                <h3 className="font-bold text-gray-900 mb-2">What happens next?</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-700 mt-1">•</span>
                    <span>Our admin team will review your kitchen information and documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-700 mt-1">•</span>
                    <span>You'll receive an email notification once your kitchen is approved</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-700 mt-1">•</span>
                    <span>This process typically takes 24-48 hours</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Kitchen Info */}
          {kitchenName && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Kitchen Name</p>
              <p className="font-semibold text-gray-900">{kitchenName}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={checkingStatus}
              className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkingStatus ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Checking Status...
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  Check Approval Status
                </>
              )}
            </button>

            {/* Browse as Buyer */}
            <Link
              href="/feed"
              className="block w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Browse Dishes as Buyer
            </Link>

            {/* Contact Support */}
            <Link
              href="/support"
              className="block w-full px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Mail size={18} />
              Contact Support
            </Link>
          </div>

          {/* Auto-check notice */}
          <p className="text-xs text-gray-500 mt-6">
            Status is automatically checked every 30 seconds. You can also browse dishes while waiting!
          </p>
        </div>
      </div>
    </div>
  );
}
