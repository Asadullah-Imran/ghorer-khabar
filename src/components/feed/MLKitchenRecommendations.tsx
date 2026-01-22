'use client';

import KitchenCard from '@/components/shared/KitchenCard';
import { useEffect, useState } from 'react';

interface RecommendedKitchen {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  image: string;
  specialty: string;
  isOpen: boolean;
  distance?: number;
  mlReason?: string;
  mlScore?: number;
}

interface MLKitchenRecommendationsProps {
  userId: string | null;
  favoriteKitchenIds: Set<string>;
  userLat?: number;
  userLng?: number;
}

export default function MLKitchenRecommendations({
  userId,
  favoriteKitchenIds,
  userLat,
  userLng
}: MLKitchenRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedKitchen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!userId) {
        console.log('👤 No user ID, skipping kitchen ML recommendations');
        setLoading(false);
        return;
      }

      try {
        console.log('🏠 Fetching ML kitchen recommendations for user:', userId);
        
        let url = `/api/recommendations/kitchens/${userId}?limit=8`;
        if (userLat && userLng) {
          url += `&userLat=${userLat}&userLng=${userLng}`;
          console.log('📍 User location:', { lat: userLat, lng: userLng });
        }
        
        console.log('📡 Kitchen API URL:', url);
        
        const response = await fetch(url, { cache: 'no-store' });
        console.log('📬 Kitchen response status:', response.status);

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Kitchen recommendations received:', {
          count: data.recommendations.length,
          algorithm: data.metadata?.algorithm,
        });

        const mapped: RecommendedKitchen[] = data.recommendations.map((rec: any) => ({
          id: rec.item_id,
          name: rec.kitchen_name,
          rating: rec.rating || 0,
          reviews: rec.review_count || 0,
          image: rec.cover_image || '/placeholder-kitchen.jpg',
          specialty: rec.specialty || 'Home Kitchen',
          isOpen: rec.is_open,
          distance: rec.distance_km,
          mlReason: rec.reason,
          mlScore: rec.score,
        }));

        console.log('🏠 Mapped kitchen recommendations:', mapped.length);
        setRecommendations(mapped);
      } catch (err) {
        console.error('❌ Error fetching kitchen recommendations:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [userId, userLat, userLng]);

  if (loading) {
    return (
      <div className="flex overflow-x-auto gap-4 px-4 md:px-0 pb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="min-w-[280px] animate-pulse">
            <div className="bg-gray-200 h-40 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No kitchen recommendations yet</p>
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto gap-4 px-4 md:px-0 pb-4 scrollbar-hide snap-x">
      {recommendations.map((kitchen) => (
        <div key={kitchen.id} className="snap-center">
          <KitchenCard 
            data={kitchen} 
            isFavorite={favoriteKitchenIds.has(kitchen.id)} 
          />
          {kitchen.mlReason && (
            <p className="text-xs text-gray-500 mt-2 max-w-[280px]">
              💡 {kitchen.mlReason}
              {kitchen.distance && ` (${kitchen.distance.toFixed(1)}km away)`}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
