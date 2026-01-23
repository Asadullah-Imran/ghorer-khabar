"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChefHat, ShoppingBag, UtensilsCrossed, User } from "lucide-react";

interface RoleTransitionProps {
  isVisible: boolean;
  fromRole: "BUYER" | "SELLER";
  toRole: "BUYER" | "SELLER";
  onComplete?: () => void;
}

export default function RoleTransition({
  isVisible,
  fromRole,
  toRole,
  onComplete,
}: RoleTransitionProps) {
  const [phase, setPhase] = useState<"fade-out" | "transition" | "fade-in" | "complete">("fade-out");
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setPhase("fade-out");
      setShowLogo(false);
      return;
    }

    // Start transition sequence
    setPhase("fade-out");
    setShowLogo(false);

    // Phase 1: Fade out current view (300ms)
    const fadeOutTimer = setTimeout(() => {
      setPhase("transition");
      setShowLogo(true);
    }, 300);

    // Phase 2: Show transition with logo (800ms)
    const transitionTimer = setTimeout(() => {
      setPhase("fade-in");
    }, 1100);

    // Don't auto-complete - let parent component control when to hide
    // The transition will stay visible until isVisible becomes false

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(transitionTimer);
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  const isTransitioning = phase === "transition" || phase === "fade-in" || isVisible;
  const fromIcon = fromRole === "BUYER" ? User : ChefHat;
  const toIcon = toRole === "BUYER" ? User : ChefHat;
  const FromIcon = fromIcon;
  const ToIcon = toIcon;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        isTransitioning ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        background: `linear-gradient(135deg, #f8f7f5 0%, #ffffff 30%, #f8f7f5 70%, #ffffff 100%)`,
      }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/food.png')] animate-pulse-slow"></div>
      </div>

      {/* Decorative Gradient Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#feb728]/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#477e77]/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#feb728]/5 rounded-full blur-3xl animate-pulse-slow delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
        {/* Logo with Animation */}
        <div
          className={`transition-all duration-500 ${
            showLogo
              ? "scale-100 opacity-100 rotate-0"
              : "scale-50 opacity-0 rotate-180"
          }`}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-[#feb728] rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative bg-white p-6 rounded-full border-4 border-[#477e77]/20 shadow-2xl">
              <Image
                src="/ghorer-khabar-logo.png"
                alt="Ghorer Khabar"
                width={120}
                height={120}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Role Icons Transition */}
        {showLogo && (
          <div className="flex items-center gap-8">
            {/* From Role */}
            <div
              className={`flex flex-col items-center gap-3 transition-all duration-500 ${
                phase === "transition"
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-75"
              }`}
            >
              <div className="bg-white p-4 rounded-full border-2 border-[#477e77]/30 shadow-lg">
                <FromIcon size={32} className="text-[#477e77]" />
              </div>
              <p className="text-[#131615] text-sm font-semibold uppercase tracking-wider">
                {fromRole === "BUYER" ? "Foodie" : "Chef"}
              </p>
            </div>

            {/* Arrow Animation */}
            <div
              className={`transition-all duration-500 ${
                phase === "transition"
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-8"
              }`}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#feb728] rounded-full blur-lg opacity-40 animate-ping"></div>
                <div className="relative bg-[#feb728] p-3 rounded-full shadow-lg">
                  <UtensilsCrossed
                    size={24}
                    className="text-white animate-spin-slow"
                  />
                </div>
              </div>
            </div>

            {/* To Role */}
            <div
              className={`flex flex-col items-center gap-3 transition-all duration-500 delay-200 ${
                phase === "fade-in"
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-75"
              }`}
            >
              <div className="bg-[#feb728] p-4 rounded-full border-2 border-[#feb728] shadow-lg">
                <ToIcon size={32} className="text-white" />
              </div>
              <p className="text-[#131615] font-bold text-base uppercase tracking-wider">
                {toRole === "BUYER" ? "Foodie" : "Chef"}
              </p>
            </div>
          </div>
        )}

        {/* Loading Text */}
        {showLogo && phase === "transition" && (
          <div className="mt-4">
            <p className="text-[#477e77] text-lg font-semibold animate-pulse">
              Switching to {toRole === "BUYER" ? "Foodie" : "Chef"} Mode...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
