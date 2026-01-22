'use client';

import PlanCard from '@/components/shared/PlanCard';
import { useEffect, useState } from 'react';

interface RecommendedPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  mealsPerDay: number;
  servingsPerMeal: number;
  mealsPerMonth: number;
  rating: number;
  image: string;
  kitchen: string;
  type: string;
  mlReason?: string;
  mlScore?: number;
}

interface MLSubscriptionRecommendationsProps {
  userId: string | null;
  favoritePlanIds: Set<string>;
}

export default function MLSubscriptionRecommendations({
  userId,
  favoritePlanIds
}: MLSubscriptionRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!userId) {
        console.log('👤 No user ID, skipping subscription ML recommendations');
        setLoading(false);
        return;
      }

      try {
        console.log('📅 Fetching ML subscription recommendations for user:', userId);
        
        const url = `/api/recommendations/subscriptions/${userId}?limit=6`;
        console.log('📡 Subscription API URL:', url);
        
        const response = await fetch(url, { cache: 'no-store' });
        console.log('📬 Subscription response status:', response.status);

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Subscription recommendations received:', {
          count: data.recommendations.length,
          algorithm: data.metadata?.algorithm,
        });

        const mapped: RecommendedPlan[] = data.recommendations.map((rec: any) => ({
          id: rec.item_id,
          name: rec.plan_name,
          description: rec.description || null,
          price: rec.price,
          mealsPerDay: rec.meals_per_day || 1,
          servingsPerMeal: rec.servings_per_meal || 1,
          mealsPerMonth: (rec.meals_per_day || 1) * 30,
          rating: rec.rating || 0,
          image: rec.image_url || '/placeholder-plan.jpg',
          kitchen: rec.kitchen_name,
          type: (rec.meals_per_day || 1) >= 3 ? 'Full Day' : (rec.meals_per_day || 1) >= 2 ? 'Daily Plan' : 'Single Meal',
          mlReason: rec.reason,
          mlScore: rec.score,
        }));

        console.log('📅 Mapped subscription recommendations:', mapped.length);
        setRecommendations(mapped);
      } catch (err) {
        console.error('❌ Error fetching subscription recommendations:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex overflow-x-auto gap-4 px-4 md:px-0 pb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="min-w-[280px] animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No subscription recommendations yet</p>
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto gap-4 px-4 md:px-0 pb-4 scrollbar-hide snap-x">
      {recommendations.map((plan) => (
        <div key={plan.id} className="snap-center min-w-[280px]">
          <PlanCard 
            data={plan} 
            isFavorite={favoritePlanIds.has(plan.id)} 
          />
          {plan.mlReason && (
            <p className="text-xs text-gray-500 mt-2 max-w-[280px]">
              💡 {plan.mlReason}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
