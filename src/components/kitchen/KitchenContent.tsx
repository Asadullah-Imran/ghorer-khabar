"use client";

import { useState } from "react";
import AboutSection from "./AboutSection";
import MenuSection from "./MenuSection";
import ReviewsSection from "./ReviewsSection";

interface KitchenContentProps {
  kitchenData: any;
  reviews: any[];
}

type Tab = "menu" | "about" | "reviews";

export default function KitchenContent({ kitchenData, reviews }: KitchenContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>("menu");

  return (
    <>
      {/* Navigation Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab("menu")}
          className={`flex items-center gap-2 px-1 py-4 border-b-2 font-bold transition-all whitespace-nowrap ${
            activeTab === "menu"
              ? "border-teal-700 text-teal-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Menu
        </button>
        <button
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2 px-1 py-4 border-b-2 font-bold transition-all whitespace-nowrap ${
            activeTab === "about"
              ? "border-teal-700 text-teal-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          About Kitchen
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 px-1 py-4 border-b-2 font-bold transition-all whitespace-nowrap ${
            activeTab === "reviews"
              ? "border-teal-700 text-teal-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Reviews
        </button>
      </div>

      {/* Content Rendering */}
      <div>
        {activeTab === "menu" && <MenuSection data={kitchenData} />}
        {activeTab === "about" && <AboutSection data={kitchenData} />}
        {activeTab === "reviews" && (
          <ReviewsSection
            reviews={reviews}
            rating={kitchenData.rating}
            reviewCount={kitchenData.reviewCount}
          />
        )}
      </div>
    </>
  );
}
