"use client";

import { Bell, Heart, MapPin, Navigation, Phone, Share2, Star } from "lucide-react";
import Image from "next/image";

export default function KitchenHeader({ kitchen }: { kitchen: any }) {
  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-64 w-full relative">
        <Image 
          src={kitchen.image || "/placeholder-kitchen.jpg"} 
          alt="Cover" 
          fill 
          className="object-cover" 
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      {/* Main Info Card */}
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 -mt-24 relative z-10 mb-8">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          
          {/* Profile Picture */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0">
            <div className="w-full h-full rounded-full border-4 border-white overflow-hidden shadow-md relative">
               <Image 
                 src={kitchen.profileImage || kitchen.image || "/placeholder-kitchen.jpg"} 
                 alt={kitchen.name} 
                 fill 
                 className="object-cover" 
               />
            </div>
            {/* KRI Badge (New Requirement) */}
            <div className="absolute -bottom-2 -right-2 bg-teal-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white flex flex-col items-center leading-tight">
               <span>KRI</span>
               <span className="text-lg">{kitchen.kriScore}</span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{kitchen.name}</h1>
              <span className="px-3 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-600 rounded-full uppercase tracking-wider self-center">
                {kitchen.type}
              </span>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm font-medium text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-400 fill-current" />
                <span className="text-gray-900 font-bold">{kitchen.rating}</span>
                <span className="text-xs">({kitchen.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>{kitchen.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Navigation size={16} />
                <span>{kitchen.distance}</span>
              </div>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto md:mx-0">
              {kitchen.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {[Heart, Bell, Phone, Share2].map((Icon, i) => (
              <button 
                key={i} 
                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-teal-50 hover:text-teal-700 flex items-center justify-center transition-colors border border-gray-200"
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}