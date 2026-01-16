import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "./FavoriteButton";

interface KitchenProps {
  data: {
    id: string;
    name: string;
    rating: number;
    reviews: number;
    image: string;
    specialty: string;
  };
  isFavorite?: boolean; // NEW: Pass from parent
}

export default function KitchenCard({ data, isFavorite }: KitchenProps) {
  return (
    <Link
      href={`/explore/kitchen/${data.id}`}
      className="block min-w-[200px] md:min-w-[240px]"
    >
      <div className="relative bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition">
        <div className="relative h-32 w-full">
          <Image
            src={data.image}
            alt={data.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton itemId={data.id} itemType="kitchen" initialIsFavorite={isFavorite} />
          </div>
          <div className="absolute bottom-2 left-2 text-white">
            <p className="text-xs font-medium bg-yellow-500 text-black px-1.5 py-0.5 rounded-sm inline-block mb-1">
              {data.specialty}
            </p>
          </div>
        </div>

        <div className="p-3">
          <h3 className="font-bold text-gray-800 text-sm truncate">
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
