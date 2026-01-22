import NutritionInfo from "@/components/plan-details/NutritionInfo";
import PlanHero from "@/components/plan-details/PlanHero";
import PlanStats from "@/components/plan-details/PlanStats";
import SubscriptionSidebar from "@/components/plan-details/SubscriptionSidebar";
import WeeklySchedule from "@/components/plan-details/WeeklySchedule";
import { prisma } from "@/lib/prisma/prisma";
import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Type definitions for schedule data
interface MealData {
  dishIds?: string[];
  time?: string;
}

interface DayMeals {
  breakfast?: MealData;
  lunch?: MealData;
  dinner?: MealData;
  snacks?: MealData;
  [mealType: string]: MealData | undefined;
}

interface WeeklyScheduleData {
  [day: string]: DayMeals;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  menu_item_images: { imageUrl: string }[];
}

interface TransformedMeal {
  time: string;
  dish: string;
  desc: string;
  image: string;
}

interface TransformedSchedule {
  [day: string]: {
    [mealType: string]: TransformedMeal;
  };
}

// Default fallback image for meals
const DEFAULT_MEAL_IMAGE = "/placeholder-meal.jpg";

// Helper function to extract all dish IDs from schedule
function extractDishIds(schedule: WeeklyScheduleData | null | undefined): string[] {
  const dishIds: string[] = [];
  if (!schedule || typeof schedule !== 'object') return dishIds;
  
  for (const dayMeals of Object.values(schedule)) {
    if (dayMeals && typeof dayMeals === 'object') {
      for (const meal of Object.values(dayMeals)) {
        if (meal && typeof meal === 'object' && 'dishIds' in meal) {
          const mealData = meal as MealData;
          if (Array.isArray(mealData.dishIds)) {
            dishIds.push(...mealData.dishIds);
          }
        }
      }
    }
  }
  return [...new Set(dishIds)]; // Remove duplicates
}

// Helper function to capitalize first letter (SATURDAY -> Saturday)
function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Transform schedule from database format to UI format
function transformSchedule(rawSchedule: WeeklyScheduleData | null | undefined, menuItems: MenuItem[]): TransformedSchedule {
  if (!rawSchedule || typeof rawSchedule !== 'object') return {};
  
  const menuMap = new Map(menuItems.map(item => [item.id, item]));
  const transformed: TransformedSchedule = {};
  
  for (const [dayUpper, meals] of Object.entries(rawSchedule)) {
    const dayTitle = capitalizeFirst(dayUpper); // SATURDAY -> Saturday
    transformed[dayTitle] = {};
    
    if (meals && typeof meals === 'object') {
      for (const [mealType, mealData] of Object.entries(meals)) {
        if (!mealData) continue;
        
        const dishId = mealData.dishIds?.[0];
        const menuItem = dishId ? menuMap.get(dishId) : null;
        
        transformed[dayTitle][mealType] = {
          time: mealData.time || "12:00",
          dish: menuItem?.name || "Chef's Special",
          desc: menuItem?.description || "A delicious meal prepared by our chef",
          image: menuItem?.menu_item_images?.[0]?.imageUrl || DEFAULT_MEAL_IMAGE
        };
      }
    }
  }
  
  return transformed;
}

export default async function PlanDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentUserId = await getAuthUserId();
  
  // Fetch subscription plan from database
  const planData = await prisma.subscription_plans.findUnique({
    where: { id },
    include: {
      kitchen: {
        select: {
          id: true,
          name: true,
          rating: true,
          location: true,
          area: true,
          reviewCount: true,
          coverImage: true,
          sellerId: true,
          seller: {
            select: {
              name: true,
            }
          }
        },
      },
    },
  });

  if (!planData) {
    notFound();
  }

  // Parse the weekly schedule
  const rawSchedule = typeof planData.weekly_schedule === 'string' 
    ? JSON.parse(planData.weekly_schedule) 
    : planData.weekly_schedule || {};

  // Extract all dish IDs from the schedule
  const dishIds = extractDishIds(rawSchedule);

  // Fetch all referenced menu items with their images
  const menuItems = dishIds.length > 0 ? await prisma.menu_items.findMany({
    where: { id: { in: dishIds } },
    include: { 
      menu_item_images: { 
        orderBy: { order: 'asc' }, 
        take: 1 
      } 
    }
  }) : [];

  // Transform schedule data to match component expectations
  const transformedSchedule = transformSchedule(rawSchedule, menuItems);

  // Transform database data to match component expectations
  const plan = {
    id: planData.id,
    name: planData.name,
    description: planData.description || "",
    mealsPerDay: planData.meals_per_day,
    servingsPerMeal: planData.servings_per_meal,
    price: planData.price,
    isActive: planData.is_active,
    subscriberCount: planData.subscriber_count,
    rating: Number(planData.rating) || 0,
    image: planData.cover_image || "/placeholder-plan.jpg",
    chef: {
      name: planData.kitchen?.seller?.name || "Chef",
      experience: "Experienced Chef",
      image: planData.kitchen?.coverImage || "/placeholder-chef.jpg",
      quote: planData.chef_quote || "Crafting delicious meals with love",
    },
    nutrition: {
      calories: planData.calories || 0,
      protein: planData.protein || "0g",
      carbs: planData.carbs || "0g",
      fats: planData.fats || "0g",
    },
    schedule: transformedSchedule,
    kitchen: planData.kitchen ? {
      id: planData.kitchen.id,
      name: planData.kitchen.name,
      rating: Number(planData.kitchen.rating) || 0,
      location: planData.kitchen.location,
      area: planData.kitchen.area,
      reviewCount: planData.kitchen.reviewCount,
    } : undefined,
  };

  if (!plan) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-sm font-medium text-gray-500">
          <Link href="/feed" className="hover:text-teal-700">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link
            href="/explore?tab=subscriptions"
            className="hover:text-teal-700"
          >
            Subscription Plans
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-semibold">{plan.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column: Content */}
          <div className="flex-1 space-y-10">
            <PlanHero plan={plan} />
            <PlanStats plan={plan} />
            <WeeklySchedule schedule={plan.schedule || {}} />
            <NutritionInfo nutrition={plan.nutrition} />
          </div>

          {/* Right Column: Sticky Sidebar */}
          <SubscriptionSidebar plan={plan} kitchenSellerId={planData.kitchen?.sellerId} currentUserId={currentUserId} />
        </div>
      </div>
    </main>
  );
}
