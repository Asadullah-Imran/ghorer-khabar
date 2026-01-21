'use client';

import { useState } from 'react';
import MLKitchenRecommendations from './MLKitchenRecommendations';
import MLRecommendationsSection from './MLRecommendationsSection';
import MLSubscriptionRecommendations from './MLSubscriptionRecommendations';

interface TabbedRecommendationsProps {
  userId: string | null;
  userRole: string | null;
  favoriteDishIds: Set<string>;
  favoriteKitchenIds: Set<string>;
  favoritePlanIds: Set<string>;
  excludeDishIds: string[];
}

type TabType = 'dishes' | 'kitchens' | 'subscriptions';

export default function TabbedRecommendations({
  userId,
  userRole,
  favoriteDishIds,
  favoriteKitchenIds,
  favoritePlanIds,
  excludeDishIds
}: TabbedRecommendationsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dishes');

  const tabs = [
    { id: 'dishes' as TabType, label: '🍽️ Dishes', emoji: '🍽️' },
    { id: 'kitchens' as TabType, label: '🏠 Kitchens', emoji: '🏠' },
    { id: 'subscriptions' as TabType, label: '📅 Meal Plans', emoji: '📅' },
  ];

  console.log('📑 Tabbed Recommendations - Active Tab:', activeTab);

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              console.log('🔄 Switching to tab:', tab.id);
              setActiveTab(tab.id);
            }}
            className={`
              px-6 py-3 font-medium text-sm transition-all
              ${activeTab === tab.id
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            <span className="mr-2">{tab.emoji}</span>
            {tab.label.replace(tab.emoji + ' ', '')}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'dishes' && (
          <div>
            <MLRecommendationsSection
              userId={userId}
              userRole={userRole}
              favoriteDishIds={favoriteDishIds}
              excludeIds={excludeDishIds}
            />
          </div>
        )}

        {activeTab === 'kitchens' && (
          <div>
            <MLKitchenRecommendations
              userId={userId}
              favoriteKitchenIds={favoriteKitchenIds}
            />
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div>
            <MLSubscriptionRecommendations
              userId={userId}
              favoritePlanIds={favoritePlanIds}
            />
          </div>
        )}
      </div>
    </div>
  );
}
