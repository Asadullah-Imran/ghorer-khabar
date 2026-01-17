import { Clock, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AddToCartBtn } from "../feed/DishInteractions";
import FavoriteButton from "./FavoriteButton";

interface DishProps {
  data: {
    id: string;
    name: string;
    price: number;
    rating: number;
    image: string;
    kitchen: string; // Display name
    kitchenId: string; // ID for cart
    kitchenName: string; // Name for cart (usually same as kitchen)
    kitchenLocation?: string;
    kitchenRating?: number;
    kitchenReviewCount?: number;
    deliveryTime: string;
    chefId?: string; // Chef/creator ID
  };
  featured?: boolean;
  isFavorite?: boolean; // NEW: Pass from parent
  currentUserId?: string | null; // Current logged-in user ID
  userRole?: string | null; // User's role (BUYER, SELLER, ADMIN)
}

export default function DishCard({ data, featured, isFavorite, currentUserId, userRole }: DishProps) {
  // Check if user is both SELLER and BUYER and is the creator of this dish
  const isOwnDish = !!(currentUserId && data.chefId && currentUserId === data.chefId && userRole?.includes('SELLER'));
  const isBuyerOnly = userRole === 'BUYER';
  const canAddToCart = isBuyerOnly || !isOwnDish;
  return (
    <Link href={`/explore/dish/${data.id}`} className="group block h-full">
      <div
        className={`relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition h-full flex flex-col ${
          featured ? "min-w-[280px]" : "w-full"
        }`}
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] w-full bg-gray-100">
          <Image
            src={data.image}
            alt={data.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton itemId={data.id} itemType="dish" initialIsFavorite={isFavorite} />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-teal-700 transition line-clamp-1">
                {data.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{data.kitchen}</p>
            </div>
            <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded text-green-700 text-xs font-bold">
              <Star size={10} fill="currentColor" />
              {data.rating}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
            <Clock size={14} />
            <span>{data.deliveryTime}</span>
          </div>

          <div className="mt-auto pt-4 flex items-center justify-between">
            <span className="font-bold text-lg text-gray-900">
              ৳{data.price}
            </span>
            <AddToCartBtn
              minimal={!featured}
              item={{
                id: data.id,
                name: data.name,
                price: data.price,
                image: data.image,
                kitchenId: data.kitchenId,
                kitchenName: data.kitchenName,
                kitchenLocation: data.kitchenLocation,
                kitchenRating: data.kitchenRating,
                kitchenReviewCount: data.kitchenReviewCount,
              }}
              disabled={!canAddToCart}
              isOwnDish={isOwnDish}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
