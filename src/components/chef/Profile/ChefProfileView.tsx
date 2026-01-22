"use client";

import { useState } from "react";
import KitchenGallery from "@/components/kitchen/KitchenGallery";
import KitchenHeader from "@/components/kitchen/KitchenHeader";
import MenuSection from "@/components/kitchen/MenuSection";
import { Edit2 } from "lucide-react";
import Image from "next/image";
import ChefProfileEditModal from "./ChefProfileEditModal";

interface Kitchen {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  area: string;
  distance?: string;
  image: string;
  profileImage?: string;
  rating: number;
  reviewCount: number;
  kriScore: number;
  isOpen?: boolean;
  isActive?: boolean;
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
      {kitchenData.isOpen === false && (
        <div className="bg-red-500 text-white py-3 px-4 text-center">
          <p className="font-semibold">🔒 This kitchen is currently closed</p>
        </div>
      )}

      <div className="relative">
        <KitchenHeader kitchen={kitchenData} />
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="absolute top-6 right-6 bg-white rounded-full px-4 py-2.5 shadow-lg hover:bg-gray-100 transition z-20 flex items-center gap-2"
        >
          <Edit2 size={18} className="text-teal-600" />
          <span className="text-sm font-medium text-gray-900">Edit Profile</span>
        </button>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-8 border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
          {["menu", "about", "gallery"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-1 py-4 border-b-2 font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "border-teal-700 text-teal-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "menu" ? "Menu" : tab === "about" ? "About Kitchen" : "Gallery"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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

          <aside className="lg:col-span-4 space-y-6">
            {kitchenData.gallery.length > 0 && (
              <KitchenGallery images={kitchenData.gallery} />
            )}

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
