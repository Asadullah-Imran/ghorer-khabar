import KitchenGallery from "@/components/kitchen/KitchenGallery";
import KitchenHeader from "@/components/kitchen/KitchenHeader";
import MenuSection from "@/components/kitchen/MenuSection";
import { prisma } from "@/lib/prisma/prisma";
import { Star } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function KitchenProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch kitchen data from database
  const kitchen = await prisma.kitchen.findUnique({
    where: { id },
    include: {
      gallery: {
        orderBy: { order: 'asc' }
      },
      seller: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  });

  if (!kitchen) {
    notFound();
  }

  // Fetch menu items for this kitchen
  const menuItems = await prisma.menu_items.findMany({
    where: {
      chef_id: kitchen.sellerId,
      isAvailable: true
    },
    include: {
      menu_item_images: {
        orderBy: { order: 'asc' },
        take: 1
      }
    },
    orderBy: { category: 'asc' }
  });

  // Fetch similar kitchens
  const similarKitchens = await prisma.kitchen.findMany({
    where: {
      id: { not: id },
      isActive: true,
      isVerified: true,
      OR: [
        { type: kitchen.type },
        { area: kitchen.area }
      ]
    },
    orderBy: { rating: 'desc' },
    take: 3
  });

  // Transform data to match component expectations
  const transformedMenu = menuItems.map(item => ({
    id: item.id,
    name: item.name,
    desc: item.description || "",
    description: item.description || "",
    price: item.price,
    category: item.category,
    image: item.menu_item_images[0]?.imageUrl || "/placeholder-dish.jpg",
    rating: item.rating || 0,
    isVegetarian: item.isVegetarian,
    spiciness: item.spiciness,
    prepTime: item.prepTime,
    time: item.prepTime ? `${item.prepTime} min` : "30 min"
  }));

  const data = {
    id: kitchen.id,
    name: kitchen.name,
    type: kitchen.type || "Home Kitchen",
    description: kitchen.description || "A wonderful kitchen serving delicious food",
    location: kitchen.location || "Dhaka",
    area: kitchen.area || "Unknown Area",
    distance: kitchen.distance || 0,
    image: kitchen.coverImage || "/placeholder-kitchen.jpg",
    profileImage: kitchen.profileImage,
    rating: Number(kitchen.rating) || 0,
    reviewCount: kitchen.reviewCount,
    kriScore: kitchen.kriScore,
    stats: {
      orders: kitchen.totalOrders.toString(),
      satisfaction: `${Number(kitchen.satisfactionRate) || 90}%`
    },
    gallery: kitchen.gallery?.map(img => img.imageUrl) || [],
    menu: transformedMenu,
    // Featured items - top rated menu items
    featuredItems: transformedMenu
      .filter(item => item.rating >= 4)
      .slice(0, 5)
      .length > 0 
        ? transformedMenu.filter(item => item.rating >= 4).slice(0, 5)
        : transformedMenu.slice(0, 5),
    // Placeholder for plans - would need to fetch from subscription_plans table
    plans: []
  };

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
            
            {/* Kitchen Gallery */}
            {data.gallery.length > 0 && (
              <KitchenGallery images={data.gallery} />
            )}

            {/* Performance Stats */}
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

            {/* Similar Kitchens */}
            {similarKitchens.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Similar Kitchens</h3>
                </div>
                
                <div className="space-y-4">
                  {similarKitchens.map((k) => (
                    <a
                      key={k.id}
                      href={`/explore/kitchen/${k.id}`}
                      className="flex items-center gap-3 group cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-200 relative overflow-hidden">
                        <Image 
                          src={k.coverImage || "/placeholder-kitchen.jpg"} 
                          alt={k.name} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                          {k.name}
                        </h4>
                        <p className="text-[10px] text-gray-500">
                          {k.type || "Kitchen"} • {k.area || k.location || "Dhaka"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold bg-gray-50 px-1.5 py-0.5 rounded">
                        {Number(k.rating).toFixed(1)} <Star size={8} className="text-orange-400 fill-current" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

          </aside>
        </div>
      </div>
    </main>
  );
}