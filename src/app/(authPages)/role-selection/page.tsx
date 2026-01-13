"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Utensils, Store, ArrowRight, Info } from "lucide-react";

export default function RoleSelectionPage() {
  const router = useRouter();

  const selectRole = async (roleName: "BUYER" | "SELLER") => {
    try {
      const response = await fetch("/api/user/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleName }),
      });

      if (response.ok) {
        // Redirect based on the chosen path
        if (roleName === "BUYER") {
          router.push("/");
        } else {
          // SELLER: redirect to chef onboarding
          router.push("/chef-onboarding");
        }
      } else {
        const err = await response.json();
        alert(err.error || "Failed to set role");
      }
    } catch (error) {
      console.error("Role selection error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f6] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-[#1b0e0e]">
            How will you use <span className="text-[#ea2a33]">Ghorer Khabar</span>?
          </h1>
          <p className="text-[#994d51] text-lg">Pick your path to get started.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Buyer Option */}
          <div 
            onClick={() => selectRole("BUYER")}
            className="group bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-[#ea2a33] transition-all cursor-pointer hover:shadow-xl"
          >
            <div className="bg-[#ea2a33]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#ea2a33] transition-colors">
              <Utensils className="text-[#ea2a33] group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">I want to Buy</h3>
            <p className="text-sm text-gray-500 mb-6">Discover healthy, home-cooked meals from neighbors.</p>
            <div className="flex items-center justify-center gap-2 font-bold text-[#ea2a33]">
              Select <ArrowRight size={16} />
            </div>
          </div>

          {/* Seller Option */}
          <div 
            onClick={() => selectRole("SELLER")}
            className="group bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-[#ea2a33] transition-all cursor-pointer hover:shadow-xl"
          >
            <div className="bg-[#ea2a33]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#ea2a33] transition-colors">
              <Store className="text-[#ea2a33] group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">I want to Sell</h3>
            <p className="text-sm text-gray-500 mb-6">Share your recipes and start earning from home.</p>
            <div className="flex items-center justify-center gap-2 font-bold text-[#ea2a33]">
              Select <ArrowRight size={16} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-[#994d51] bg-[#ea2a33]/5 py-3 rounded-xl border border-[#ea2a33]/10">
          <Info size={16} />
          <p>Don't worry, you can switch or add roles later in settings.</p>
        </div>
      </div>
    </div>
  );
}