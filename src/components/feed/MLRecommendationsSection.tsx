'use client';

import DishCard from '@/components/shared/DishCard';
import { useEffect, useState } from 'react';

interface RecommendedDish {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  kitchen: string;
  kitchenId: string;
  kitchenName: string;
  mlReason?: string;
  mlScore?: number;
}

interface MLRecommendationsProps {
  userId: string | null;
  userRole: string | null;
  favoriteDishIds: Set<string>;
  excludeIds: string[];
}

export default function MLRecommendationsSection({
  userId,
  userRole,
  favoriteDishIds,
  excludeIds
}: MLRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!userId) {
        console.log('👤 No user ID, skipping ML recommendations');
        setLoading(false);
        return;
      }

      try {
        console.log('🤖 Fetching ML recommendations for user:', userId);
        console.log('📝 Excluding dish IDs:', excludeIds);
        
        const url = `/api/recommendations/dishes/${userId}?limit=12&excludeIds=${excludeIds.join(',')}`;
        console.log('📡 API URL:', url);
        
        const response = await fetch(url, {
          cache: 'no-store',
        });

        console.log('📬 Response status:', response.status);

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ ML Recommendations received:', {
          count: data.recommendations.length,
          algorithm: data.metadata?.algorithm,
          coldStart: data.metadata?.cold_start,
        });
        console.log('📊 Full response:', data);

        const mappedRecs: RecommendedDish[] = data.recommendations.map((rec: any) => ({
          id: rec.item_id,
          name: rec.dish_name,
          price: rec.price,
          rating: rec.rating || 0,
          image: rec.image_url || '/placeholder-dish.jpg',
          kitchen: rec.kitchen_name,
          kitchenId: rec.item_id,
          kitchenName: rec.kitchen_name,
          mlReason: rec.reason,
          mlScore: rec.score,
        }));

        console.log('🎯 Mapped recommendations:', mappedRecs);
        setRecommendations(mappedRecs);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching ML recommendations:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [userId, excludeIds]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.warn('⚠️  Showing error state:', error);
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load recommendations</p>
        <p className="text-sm text-gray-400 mt-2">{error}</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    console.log('📭 No recommendations returned');
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No recommendations available yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Start ordering to get personalized recommendations!
        </p>
      </div>
    );
  }

  console.log('🎨 Rendering', recommendations.length, 'recommendations');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {recommendations.map((dish) => {
        const isFavorite = favoriteDishIds.has(dish.id);
        console.log(`💝 Dish ${dish.name} - Favorite: ${isFavorite}`);
        
        return (
          <div key={dish.id}>
            <DishCard
              data={{
                ...dish,
                kitchenLocation: undefined,
                kitchenRating: 0,
                kitchenReviewCount: 0,
                deliveryTime: '30-45 min',
                chefId: '',
              }}
              isFavorite={isFavorite}
              currentUserId={userId}
              userRole={userRole}
            />
            {dish.mlReason && (
              <p className="text-xs text-gray-500 mt-2 px-2">
                💡 {dish.mlReason} (Score: {dish.mlScore?.toFixed(2)})
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
