import KitchenHeader from "@/components/kitchen/KitchenHeader";
import KitchenGallery from "@/components/kitchen/KitchenGallery";
import MenuSection from "@/components/kitchen/MenuSection";
import { KITCHEN_DETAILS } from "@/lib/dummy-data/kitchen-details";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";

export default function KitchenProfilePage() {
  const data = KITCHEN_DETAILS;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. Header Section */}
      <KitchenHeader kitchen={data} />

      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-8 border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
          <button className="flex items-center gap-2 px-1 py-4 border-b-2 border-teal-700 text-teal-700 font-bold transition-all whitespace-nowrap">
            Menu
          </button>
          <button className="flex items-center gap-2 px-1 py-4 border-b-2 border-transparent text-gray-500 font-bold hover:text-gray-700 transition-all whitespace-nowrap">
            About Kitchen
          </button>
          <button className="flex items-center gap-2 px-1 py-4 border-b-2 border-transparent text-gray-500 font-bold hover:text-gray-700 transition-all whitespace-nowrap">
            Reviews
          </button>
        </div>

        {/* 2. Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-8">
            <MenuSection data={data} />
          </div>

          {/* Sidebar (Right) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* NEW: Kitchen Gallery */}
            <KitchenGallery images={data.gallery} />

            {/* Performance Stats (Simplified to KRI mainly) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-4">
                Performance
              </h3>
              
              {/* KRI Score Highlight */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                 <div className="w-16 h-16 rounded-full border-4 border-teal-100 flex items-center justify-center bg-teal-50 text-teal-700 font-black text-xl">
                    {data.kriScore}
                 </div>
                 <div>
                    <p className="font-bold text-gray-900">KRI Score</p>
                    <p className="text-xs text-gray-500">Key Reliability Index based on quality & hygiene.</p>
                 </div>
              </div>

              {/* Simple Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-xl font-bold text-gray-900">{data.stats.orders}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Orders</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-xl font-bold text-green-600">{data.stats.satisfaction}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Similar Kitchens</h3>
                <div className="flex gap-1">
                    <button className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft size={16}/></button>
                    <button className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight size={16}/></button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 relative overflow-hidden">
                        <Image src="https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=100" alt="k" fill className="object-cover"/>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-teal-700 transition-colors">Aunty's Kitchen</h4>
                        <p className="text-[10px] text-gray-500">Bengali • 1.2km</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold bg-gray-50 px-1.5 py-0.5 rounded">
                        4.9 <Star size={8} className="text-orange-400 fill-current" />
                    </div>
                </div>
                
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 relative overflow-hidden">
                        <Image src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=100" alt="k" fill className="object-cover"/>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-teal-700 transition-colors">Spice Garden</h4>
                        <p className="text-[10px] text-gray-500">Indian • 3.5km</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold bg-gray-50 px-1.5 py-0.5 rounded">
                        4.7 <Star size={8} className="text-orange-400 fill-current" />
                    </div>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </main>
  );
}