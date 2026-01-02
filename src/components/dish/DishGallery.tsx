"use client";

import Image from "next/image";
import { useState } from "react";

export default function DishGallery({ images }: { images: string[] }) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex flex-col gap-4">
      {/* Main Large Image */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 group border border-gray-100">
        <Image
          src={selectedImage}
          alt="Dish view"
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-teal-700 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md z-10">
          Fresh Today
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(img)}
            className={`relative w-24 aspect-square rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
              selectedImage === img
                ? "border-teal-600 ring-2 ring-teal-600/20"
                : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <Image
              src={img}
              alt={`Thumb ${idx}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
