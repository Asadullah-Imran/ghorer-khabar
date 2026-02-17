import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "./FavoriteButton";

import { MapPin } from "lucide-react";

interface KitchenProps {
  data: {
    id: string;
    name: string;
    rating: number;
    reviews: number;
    image: string;
    specialty: string;
    isOpen?: boolean;
    distanceStr?: string; // Optional distance string
  };
  isFavorite?: boolean; // NEW: Pass from parent
}

export default function KitchenCard({ data, isFavorite }: KitchenProps) {
  return (
    <Link
      href={`/explore/kitchen/${data.id}`}
      className="block min-w-[200px] md:min-w-[240px]"
    >
      <div className="relative bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition group h-full">
        <div className="relative h-32 w-full">
          <Image
            src={data.image}
            alt={data.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton itemId={data.id} itemType="kitchen" initialIsFavorite={isFavorite} />
          </div>
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
             <div className="flex gap-1 flex-wrap">
                <span className="text-[10px] font-medium bg-white/90 backdrop-blur-sm text-gray-800 px-1.5 py-0.5 rounded-sm">
                  {data.specialty}
                </span>
                {data.isOpen === false && (
                  <span className="text-[10px] font-medium bg-red-500 text-white px-1.5 py-0.5 rounded-sm">
                    Closed
                  </span>
                )}
             </div>
             
             {data.distanceStr && (
               <span className="flex items-center gap-0.5 text-[10px] font-medium bg-black/60 text-white px-1.5 py-0.5 rounded-sm backdrop-blur-md">
                 <MapPin size={10} />
                 {data.distanceStr}
               </span>
             )}
          </div>
        </div>

        <div className="p-3">
          <h3 className="font-bold text-gray-800 text-sm truncate" title={data.name}>
            {data.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1 text-orange-500 font-medium">
              <Star size={12} fill="currentColor" /> {data.rating}
            </span>
            <span>({data.reviews})</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
