"use client";

import { useCart } from "@/components/cart/CartProvider";
import { useToast } from "@/contexts/ToastContext";
import {
  ArrowRight,
  Edit2,
  Flame,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function MenuSection({ data, isOwnProfile = false }: { data: any; isOwnProfile?: boolean }) {
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const toast = useToast();
  const { addItem } = useCart();
  
  // Check if user owns this kitchen (cannot order from own kitchen)
  const isOwner = data?.isOwner || false;

  const handleAddClick = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOwner) {
      toast.error(
        "Cannot Add Dish",
        "You cannot add your own dishes to cart"
      );
      return;
    }

    const kitchenId = data?.id || item.kitchenId;
    const kitchenName = data?.name || item.kitchenName || "Kitchen";

    const result = addItem(
      {
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        kitchenId,
        kitchenName,
      },
      1
    );

    if (result.success) {
      toast.success("Added to Cart", `${item.name} added to cart`);
    } else {
      toast.error("Failed to Add", result.message || "Could not add item to cart");
    }
  };

  const categories = ["All Items", "Meals", "Snacks", "Desserts"];

  // Filter Logic
  const filteredMenu = (data?.menu || []).filter((item: any) => {
    const matchesCategory =
      activeCategory === "All Items" || item.category === activeCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* 0. User Profile Card */}
      {data?.seller && (
        <section className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-3xl p-6 border border-teal-100">
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-3 border-white shadow-md flex-shrink-0 bg-gray-200">
              <Image
                src={data.seller.avatar || "/placeholder-avatar.jpg"}
                alt={data.seller.name || "Chef"}
                fill
                className="object-cover"
              />
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">
                {data.seller.name || "Chef"}
              </h3>
              <p className="text-sm text-gray-600">{data.seller.email}</p>
              <p className="text-xs text-gray-500 mt-1">Kitchen Chef</p>
            </div>

            {/* Follow/Message Button */}
            <button className="px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-700 transition-colors flex-shrink-0">
              Follow
            </button>
          </div>
        </section>
      )}

      {/* 1. Featured Scroll */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="text-orange-500 fill-current" size={20} />
            <h3 className="text-xl font-bold text-gray-900">
              Featured & Popular
            </h3>
          </div>
          {isOwnProfile && (
            <button className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg hover:bg-teal-700 hover:text-white transition-colors">
              <Edit2 size={14} />
              Edit
            </button>
          )}
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {(data?.featuredItems || []).map((item: any) => (
            <div
              key={item.id}
              className="min-w-[260px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group"
            >
              <div className="relative h-36">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 left-2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded">
                  Chef's Special
                </span>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-gray-900 truncate pr-2">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                    {item.rating} <Star size={8} fill="currentColor" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {item.desc}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-700">৳{item.price}</span>
                  <button 
                    onClick={(e) => handleAddClick(e, item)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors ${
                      isOwner 
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                        : "bg-teal-50 text-teal-700 hover:bg-teal-700 hover:text-white"
                    }`}
                    title={isOwner ? "You cannot order from your own kitchen" : "Add to cart"}
                  >
                    ADD <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Subscription Plans Banner */}
      <section className="bg-teal-50 rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Weekly Meal Plans
            </h3>
            <p className="text-sm text-gray-500">
              Save up to 15% with subscription
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isOwnProfile && (
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white text-teal-700 text-xs font-bold rounded-lg hover:bg-teal-700 hover:text-white transition-colors">
                <Edit2 size={14} />
                Edit
              </button>
            )}
            <button className="text-teal-700 text-sm font-bold hover:underline">
              View All
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data?.plans || []).map((plan: any, i: number) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl flex items-center justify-between border border-teal-100 cursor-pointer hover:border-teal-300 transition-all group"
            >
              <div>
                <h4 className="font-bold text-gray-900">{plan.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{plan.desc}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-teal-700 font-bold">৳{plan.price}</span>
                  <span className="text-xs text-gray-400 line-through">
                    ৳{plan.originalPrice}
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-colors">
                <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Search & Filters Bar (NEW ADDITION) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-[72px] z-20 bg-white/95 backdrop-blur py-2 -mx-2 px-2 md:static md:bg-transparent md:p-0">
        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-teal-700 focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? "bg-black text-white border-black"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold whitespace-nowrap hover:bg-gray-50 transition-colors flex items-center gap-1">
            Sort <SlidersHorizontal size={12} />
          </button>
        </div>
      </div>

      {/* 4. Menu List (Filtered) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {activeCategory === "All Items" ? "Full Menu" : activeCategory}
          </h3>
          {isOwnProfile && (
            <button className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg hover:bg-teal-700 hover:text-white transition-colors">
              <Edit2 size={14} />
              Edit
            </button>
          )}
        </div>

        {filteredMenu.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenu.map((item: any, i: number) => (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="relative h-40 rounded-lg overflow-hidden mb-3 bg-gray-200">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-gray-900 line-clamp-2">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-700 px-1.5 py-0.5 rounded flex-shrink-0">
                      {item.rating} <Star size={8} fill="currentColor" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {item.category}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="font-bold text-teal-700">৳{item.price}</span>
                    <button 
                      onClick={(e) => handleAddClick(e, item)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors ${
                        isOwner 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-teal-50 text-teal-700 hover:bg-teal-700 hover:text-white"
                      }`}
                      title={isOwner ? "You cannot order from your own kitchen" : "Add to cart"}
                    >
                      ADD <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl text-center border border-gray-100">
            <p className="text-gray-500 font-medium">No items found</p>
          </div>
        )}
      </section>
    </div>
  );
}
