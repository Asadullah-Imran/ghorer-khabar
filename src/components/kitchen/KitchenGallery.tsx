"use client";

import { ImageIcon } from "lucide-react";
import Image from "next/image";

export default function KitchenGallery({ images }: { images: string[] }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center gap-2 mb-4 text-gray-400 font-bold text-xs uppercase tracking-widest">
        <ImageIcon size={16} />
        Inside The Kitchen
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer">
            <Image 
                src={img} 
                alt={`Kitchen ${idx}`} 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-500" 
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-2 text-xs font-bold text-teal-700 hover:bg-teal-50 rounded-lg transition-colors">
        View All Photos
      </button>
    </div>
  );
}