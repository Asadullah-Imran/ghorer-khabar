"use client";

import { useState } from "react";
import KitchenGallery from "@/components/kitchen/KitchenGallery";
import MenuSection from "@/components/kitchen/MenuSection";
import { Edit2, X } from "lucide-react";
import Image from "next/image";
import ChefProfileEditModal from "./ChefProfileEditModal";

interface Kitchen {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  area: string;
  distance: number;
  image: string;
  profileImage?: string;
  rating: number;
  reviewCount: number;
  kriScore: number;
  stats: {
    orders: string;
    satisfaction: string;
  };
  gallery: string[];
  menu: any[];
  featuredItems: any[];
  seller: {
    id: string;
    name?: string;
    email: string;
  };
}

export default function ChefProfileView({ kitchen }: { kitchen: Kitchen }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("menu");
  const [kitchenData, setKitchenData] = useState(kitchen);

  const handleProfileUpdate = (updatedData: Partial<Kitchen>) => {
    setKitchenData((prev) => ({
      ...prev,
      ...updatedData,
    }));
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header Section with Edit Button */}
      <div className="relative h-64 bg-gray-300 overflow-hidden group">
        <Image
          src={kitchenData.image}
          alt={kitchenData.name}
          fill
          className="object-cover"
        />
        
        {/* Edit Button on Cover */}
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="absolute top-4 right-4 bg-white rounded-full p-2.5 shadow-lg hover:bg-gray-100 transition z-10 flex items-center gap-2 px-4"
        >
          <Edit2 size={18} className="text-teal-600" />
          <span className="text-sm font-medium text-gray-900">Edit</span>
        </button>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Kitchen Info Section */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="relative -mt-24 mb-8 flex flex-col md:flex-row md:items-end gap-6">
          {/* Profile Image */}
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gray-200 flex-shrink-0">
            <Image
              src={kitchenData.profileImage || "/placeholder-kitchen.jpg"}
              alt={kitchenData.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 pb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {kitchenData.name}
            </h1>
            <p className="text-gray-600 mb-4">{kitchenData.type}</p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-orange-500">
                  {kitchenData.rating.toFixed(1)}
                </span>
                <span className="text-gray-500">({kitchenData.reviewCount} reviews)</span>
              </div>
              <div className="text-sm text-gray-600">
                {kitchenData.location} • {kitchenData.area}
              </div>
            </div>
          </div>
        </div>

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
            onClick={() => setActiveTab("gallery")}
            className={`flex items-center gap-2 px-1 py-4 border-b-2 font-bold transition-all whitespace-nowrap ${
              activeTab === "gallery"
                ? "border-teal-700 text-teal-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Gallery
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {activeTab === "menu" && <MenuSection data={kitchenData} isOwnProfile={true} />}

            {activeTab === "about" && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-6">About {kitchenData.name}</h2>
                <p className="text-gray-700 leading-relaxed mb-8">
                  {kitchenData.description}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">
                      {kitchenData.stats.orders}
                    </p>
                    <p className="text-sm text-gray-600">Total Orders</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">
                      {kitchenData.stats.satisfaction}
                    </p>
                    <p className="text-sm text-gray-600">Satisfaction Rate</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "gallery" && kitchenData.gallery.length > 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-6">Kitchen Gallery</h2>
                <div className="grid grid-cols-2 gap-4">
                  {kitchenData.gallery.map((image, idx) => (
                    <div
                      key={idx}
                      className="relative h-48 rounded-lg overflow-hidden bg-gray-200"
                    >
                      <Image
                        src={image}
                        alt={`Gallery ${idx}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Performance Stats */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-4">
                Performance
              </h3>

              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full border-4 border-teal-100 flex items-center justify-center bg-teal-50 text-teal-700 font-black text-xl">
                  {kitchenData.kriScore}
                </div>
                <div>
                  <p className="font-bold text-gray-900">KRI Score</p>
                  <p className="text-xs text-gray-500">
                    Key Reliability Index based on quality & hygiene.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xl font-bold text-gray-900">
                    {kitchenData.stats.orders}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                    Orders
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xl font-bold text-green-600">
                    {kitchenData.stats.satisfaction}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                    Satisfaction
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <ChefProfileEditModal
          kitchen={kitchenData}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </main>
  );
}
