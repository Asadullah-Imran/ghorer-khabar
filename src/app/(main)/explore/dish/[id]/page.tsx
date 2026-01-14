import DishActions from "@/components/dish/DishActions";
import DishGallery from "@/components/dish/DishGallery";
import IngredientTransparency from "@/components/dish/IngredientTransparency";
import { prisma } from "@/lib/prisma/prisma";
import {
    AlertTriangle,
    ChevronRight,
    Clock,
    Flame,
    ShieldCheck,
    Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SingleDishPage({ params }: PageProps) {
  // Await the params first (Next.js 15 pattern)
  const { id } = await params;

  // Fetch data
  const dishData = await prisma.menu_items.findUnique({
    where: { id },
    include: {
      menu_item_images: true,
      ingredients: true,
      users: {
        include: {
          kitchens: true,
        },
      },
    },
  });

  if (!dishData) return <div>Dish not found</div>;

  // Map database data to UI format
  const dish = {
    id: dishData.id,
    name: dishData.name,
    description: dishData.description,
    price: dishData.price,
    rating: dishData.rating || 0,
    reviewsCount: dishData.reviewCount || 0,
    prepTime: dishData.prepTime ? `${dishData.prepTime} min` : "N/A",
    calories: dishData.calories ? `${dishData.calories} kcal` : "N/A",
    images: dishData.menu_item_images.map((img) => img.imageUrl),
    chef: {
        name: dishData.users.kitchens[0]?.name || dishData.users.name || "Unknown Chef",
        image: dishData.users.kitchens[0]?.profileImage || dishData.users.avatar || "https://ui-avatars.com/api/?name=Chef",
        location: dishData.users.kitchens[0]?.location || "Dhaka",
        kri: dishData.users.kitchens[0]?.kriScore || 85,
        badge: "Verified Chef"
    },
    ingredients: dishData.ingredients.map(ing => ({
        name: ing.name,
        icon: "wheat", // Default icon
        detail: `${ing.quantity} ${ing.unit}` // Showing quantity as detail
    })),
    // No reviews table yet, providing empty array
    reviews: [] as any[]
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center flex-wrap gap-2 text-sm text-gray-500 mb-6">
          <Link href="/feed" className="hover:text-teal-700">
            Home
          </Link>
          <ChevronRight size={14} />
          <Link href="/explore" className="hover:text-teal-700">
            Explore
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-900">{dish.name}</span>
        </div>

        {/* 2. Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* --- LEFT COLUMN (Visuals & Reviews) --- */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Gallery (Client) */}
            <DishGallery images={dish.images} />

            {/* Reviews Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-gray-900">
                  What Foodies Say
                </h3>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star size={20} fill="currentColor" />
                  <span className="font-bold text-gray-900 text-lg">
                    {dish.rating}
                  </span>
                  <span className="text-gray-400 text-sm">
                    ({dish.reviewsCount} Reviews)
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {dish.reviews.length > 0 ? (
                    dish.reviews.map((review) => (
                    <div
                        key={review.id}
                        className="border-b border-gray-50 pb-6 last:border-0 last:pb-0"
                    >
                        <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                            <Image
                                src={review.avatar}
                                alt={review.user}
                                fill
                                className="object-cover"
                            />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                            {review.user}
                            </span>
                        </div>
                        <span className="text-xs text-gray-400">
                            {review.date}
                        </span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                        "{review.text}"
                        </p>
                    </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm italic">No reviews yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN (Details & Actions) --- */}
          <div className="lg:col-span-5 flex flex-col gap-6 relative">
            {/* Chef Card */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-teal-600 relative">
                  <Image
                    src={dish.chef.image}
                    alt={dish.chef.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div
                  className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white"
                  title={dish.chef.badge}
                >
                  <ShieldCheck size={12} fill="currentColor" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {dish.chef.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Home Chef • {dish.chef.location}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-teal-700 font-bold bg-teal-50 px-2 py-1 rounded text-xs">
                      <ShieldCheck size={14} />
                      <span>KRI {dish.chef.kri}/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dish Details */}
            <div>
              <h1 className="text-3xl font-black text-gray-900 leading-tight mb-3">
                {dish.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl font-bold text-teal-700">
                  ৳{dish.price}
                </span>
                <span className="w-px h-5 bg-gray-300"></span>
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock size={18} />
                  <span className="text-sm">{dish.prepTime}</span>
                </div>
                <span className="w-px h-5 bg-gray-300"></span>
                <div className="flex items-center gap-1 text-gray-500">
                  <Flame size={18} />
                  <span className="text-sm">{dish.calories}</span>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">
                {dish.description}
              </p>

              {/* Allergen Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3 mb-6">
                <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-wide">
                    Allergen Information
                  </h4>
                  <p className="text-sm text-yellow-900 mt-1">
                    Contains:{" "}
                    <span className="font-bold">Fish, Mustard Seeds</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Ingredient Transparency (Client) */}
            <IngredientTransparency ingredients={dish.ingredients} />

            {/* Sticky Action Bar (Client) */}
            <DishActions
              id={dish.id}
              name={dish.name}
              image={dish.images[0]}
              price={dish.price}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
