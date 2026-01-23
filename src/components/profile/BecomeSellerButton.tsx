"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ChefHat, Loader2, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import RoleTransition from "@/components/common/RoleTransition";

export default function BecomeSellerButton() {
  const { refreshUser } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRoleTransition, setShowRoleTransition] = useState(false);

  const handleUpgradeToSeller = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/upgrade-to-seller", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upgrade to seller");
      }

      // Refresh user data to update role in context
      await refreshUser();

      // Show transition
      setShowRoleTransition(true);
      
      // Redirect to chef onboarding after transition
      setTimeout(() => {
        router.push("/chef-onboarding");
      }, 1400);
    } catch (err: any) {
      console.error("Error upgrading to seller:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Role Transition Overlay */}
      <RoleTransition
        isVisible={showRoleTransition}
        fromRole="BUYER"
        toRole="SELLER"
        onComplete={() => setShowRoleTransition(false)}
      />

      {/* Become a Seller Card */}
      <div className="mb-6 bg-gradient-to-r from-teal-50 via-emerald-50 to-yellow-50 rounded-2xl border-2 border-[#477e77] p-6 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-start gap-4">
          <div className="bg-[#477e77] p-3 rounded-xl shadow-lg">
            <ChefHat className="text-white" size={28} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              Become a Seller
              <Sparkles className="text-[#feb728]" size={20} />
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Start your culinary journey! Share your delicious home-cooked
              meals with your community and earn income doing what you love.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto bg-[#feb728] hover:bg-[#e5a520] text-[#1b0e0e] px-6 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <ChefHat size={18} />
              Start Selling Today
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="bg-[#477e77] p-6 rounded-t-2xl relative">
              <button
                onClick={() => !isLoading && setShowModal(false)}
                disabled={isLoading}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
              >
                <X className="text-white" size={20} />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2.5 rounded-lg">
                  <ChefHat className="text-white" size={28} />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Become a Seller
                </h2>
              </div>
              <p className="text-white/90 text-sm">
                Start your journey as a chef on Ghorer Khabar
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 rounded-lg border border-[#477e77]/30">
                <h3 className="font-bold text-gray-900 mb-2 text-sm">
                  What happens next?
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#477e77] mt-0.5">✓</span>
                    <span>
                      Your account will be upgraded to a seller account
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#477e77] mt-0.5">✓</span>
                    <span>
                      You'll complete a quick onboarding process (kitchen setup,
                      verification, etc.)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#477e77] mt-0.5">✓</span>
                    <span>
                      You can still use all buyer features (ordering, favorites,
                      etc.)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#477e77] mt-0.5">✓</span>
                    <span>
                      After onboarding, you can start creating dishes and
                      subscription plans
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#feb728]/10 p-4 rounded-lg border border-[#feb728]/30">
                <h3 className="font-bold text-gray-900 mb-2 text-sm flex items-center gap-2">
                  <Sparkles className="text-[#feb728]" size={16} />
                  Benefits of Selling
                </h3>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#feb728]">•</span>
                    <span>Earn income from your home cooking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#feb728]">•</span>
                    <span>Flexible schedule - cook on your own time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#feb728]">•</span>
                    <span>Build your own customer base</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#feb728]">•</span>
                    <span>Share your culinary passion with others</span>
                  </li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Maybe Later
              </button>
              <button
                onClick={handleUpgradeToSeller}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-[#feb728] hover:bg-[#e5a520] text-[#1b0e0e] rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Processing...
                  </>
                ) : (
                  <>
                    <ChefHat size={18} />
                    Yes, Let's Start!
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
