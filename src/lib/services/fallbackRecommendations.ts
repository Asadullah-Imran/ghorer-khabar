/**
 * Fallback recommendation service
 * Returns popular items from database when ML service is unavailable
 */
import { prisma } from '@/lib/prisma/prisma';

export interface FallbackDishRecommendation {
  item_id: string;
  dish_name: string;
  price: number;
  rating: number;
  kitchen_name: string;
  image_url: string;
  reason: string;
  score: number;
}

export interface FallbackKitchenRecommendation {
  item_id: string;
  kitchen_name: string;
  rating: number;
  review_count: number;
  cover_image: string;
  specialty: string;
  is_open: boolean;
  distance_km: number | null;
  reason: string;
  score: number;
}

export interface FallbackSubscriptionRecommendation {
  item_id: string;
  plan_name: string;
  description: string | null;
  price: number;
  meals_per_day: number;
  servings_per_meal: number;
  rating: number;
  image_url: string;
  kitchen_name: string;
  reason: string;
  score: number;
}

/**
 * Get popular dishes as fallback recommendations
 */
export async function getFallbackDishRecommendations(
  limit: number = 12,
  excludeIds: string[] = []
): Promise<FallbackDishRecommendation[]> {
  try {
    const dishes = await prisma.menu_items.findMany({
      where: {
        isAvailable: true,
        id: excludeIds.length > 0 ? { notIn: excludeIds } : undefined,
        users: {
          kitchens: {
            some: {
              isActive: true,
              isOpen: true,
              isVerified: true,
            },
          },
        },
      },
      include: {
        menu_item_images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        users: {
          include: {
            kitchens: {
              where: {
                isActive: true,
                isOpen: true,
                isVerified: true,
              },
              take: 1,
            },
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return dishes.map((dish) => {
      const kitchen = dish.users.kitchens[0];
      const score = (dish.rating || 0) / 5.0 || 0.5;
      
      return {
        item_id: dish.id,
        dish_name: dish.name,
        price: Number(dish.price),
        rating: dish.rating || 0,
        kitchen_name: kitchen?.name || 'Unknown Kitchen',
        image_url: dish.menu_item_images[0]?.imageUrl || '/placeholder-dish.jpg',
        reason: 'Popular choice - Top rated dish',
        score: score,
      };
    });
  } catch (error) {
    console.error('Error fetching fallback dish recommendations:', error);
    return [];
  }
}

/**
 * Get popular kitchens as fallback recommendations
 */
export async function getFallbackKitchenRecommendations(
  limit: number = 8
): Promise<FallbackKitchenRecommendation[]> {
  try {
    const kitchens = await prisma.kitchen.findMany({
      where: {
        isActive: true,
        isVerified: true,
      },
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' },
        { totalOrders: 'desc' },
      ],
      take: limit,
    });

    return kitchens.map((kitchen) => {
      const ratingValue = kitchen.rating ? Number(kitchen.rating) : 0;
      const score = ratingValue / 5.0 || 0.5;
      const adjustedScore = score * (kitchen.isOpen ? 1.2 : 0.8);
      
      return {
        item_id: kitchen.id,
        kitchen_name: kitchen.name,
        rating: ratingValue,
        review_count: kitchen.reviewCount || 0,
        cover_image: kitchen.coverImage || '/placeholder-kitchen.jpg',
        specialty: kitchen.type || 'Home Kitchen',
        is_open: kitchen.isOpen || false,
        distance_km: null,
        reason: kitchen.isOpen 
          ? 'Top-rated kitchen in your area' 
          : 'Currently closed - Recommended for later',
        score: adjustedScore,
      };
    });
  } catch (error) {
    console.error('Error fetching fallback kitchen recommendations:', error);
    return [];
  }
}

/**
 * Get popular subscription plans as fallback recommendations
 */
export async function getFallbackSubscriptionRecommendations(
  limit: number = 6
): Promise<FallbackSubscriptionRecommendation[]> {
  try {
    const plans = await prisma.subscription_plans.findMany({
      where: {
        is_active: true,
        kitchen: {
          isActive: true,
          isOpen: true,
          isVerified: true,
        },
      },
      include: {
        kitchen: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { subscriber_count: 'desc' },
        { rating: 'desc' },
        { monthly_revenue: 'desc' },
      ],
      take: limit,
    });

    return plans.map((plan) => {
      const ratingValue = plan.rating ? Number(plan.rating) : 0;
      const score = ratingValue / 5.0 || 0.5;
      
      return {
        item_id: plan.id,
        plan_name: plan.name,
        description: plan.description,
        price: Number(plan.price),
        meals_per_day: plan.meals_per_day || 1,
        servings_per_meal: plan.servings_per_meal || 1,
        rating: ratingValue,
        image_url: plan.cover_image || '/placeholder-plan.jpg',
        kitchen_name: plan.kitchen?.name || 'Unknown Kitchen',
        reason: 'Popular subscription plan',
        score: score,
      };
    });
  } catch (error) {
    console.error('Error fetching fallback subscription recommendations:', error);
    return [];
  }
}
