"use client";

import { ArrowRight, ChefHat, Sparkles, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ExploreHeroProps {
  userName: string;
}

export default function ExploreHero({ userName }: ExploreHeroProps) {
  const [greeting, setGreeting] = useState("Good Day");
  const [subtitle, setSubtitle] = useState("Ready to taste something homemade today?");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 5) {
      setGreeting("Good Late Night");
      setSubtitle("Craving a late night snack?");
    } else if (hour < 12) {
      setGreeting("Good Morning");
      setSubtitle("Start your day with a healthy breakfast!");
    } else if (hour < 17) {
      setGreeting("Good Afternoon");
      setSubtitle("Recharge with a delicious homemade lunch.");
    } else {
      setGreeting("Good Evening");
      setSubtitle("Relax and enjoy a comforting dinner.");
    }
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 p-8 md:p-12 shadow-2xl">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            {greeting}, <span className="text-yellow-300">{userName}!</span> 👋
          </h1>
          <p className="text-teal-100 text-lg md:text-xl font-medium">
            {subtitle}
          </p>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link
            href="/explore?tab=dishes"
            className="group inline-flex items-center gap-3 bg-white text-teal-700 font-bold px-8 py-4 rounded-full hover:bg-yellow-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <UtensilsCrossed size={24} className="text-teal-600" />
            <span className="text-lg">Explore All Dishes</span>
            <ArrowRight 
              size={20} 
              className="text-teal-600 group-hover:translate-x-1 transition-transform" 
            />
          </Link>
          
          {/* Stats or Features */}
          <div className="flex items-center gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <ChefHat size={20} className="text-yellow-300" />
              <span className="text-sm font-semibold">Home Chefs</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-yellow-300" />
              <span className="text-sm font-semibold">Fresh & Homemade</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Icons */}
      <div className="absolute top-8 right-8 opacity-10">
        <UtensilsCrossed size={120} className="text-white" />
      </div>
    </div>
  );
}
