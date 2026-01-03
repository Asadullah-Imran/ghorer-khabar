import { Check, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PlanProps {
  data: {
    id: string;
    name: string;
    kitchen: string;
    price: number;
    type: string;
    mealsPerMonth: number;
    rating: number;
    image: string;
  };
}

export default function PlanCard({ data }: PlanProps) {
  return (
    <Link href={`/feed/plans/${data.id}`} className="block group h-full">
      <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all h-full flex flex-col hover:border-teal-200">
        {/* Image Header */}
        <div className="relative h-40 bg-gray-100">
          <Image
            src={data.image}
            alt={data.name}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-teal-800 uppercase tracking-wider">
            {data.type}
          </div>
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded flex items-center gap-1 text-xs font-bold text-orange-600">
            <Star size={10} fill="currentColor" /> {data.rating}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-teal-700 transition-colors">
            {data.name}
          </h3>
          <p className="text-xs text-gray-500 mb-3">by {data.kitchen}</p>

          <div className="mt-auto">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded-lg">
              <Check size={12} className="text-teal-600" />
              <span>{data.mealsPerMonth} meals / month</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-gray-900">
                ৳{data.price}
              </span>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition-colors">
                View Plan
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
