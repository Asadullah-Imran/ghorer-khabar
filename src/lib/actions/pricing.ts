"use server";

interface MLPricingSuggestion {
  success: boolean;
  suggested_price: number;
  price_range: {
    min: number;
    max: number;
    optimal: number;
  };
  market_insights: {
    category_avg_price: number;
    total_dishes: number;
    price_std_dev: number;
    demand_factor: number;
  };
  cost_analysis: {
    ingredient_cost: number;
    suggested_margin_percent: number;
    profit_per_unit: number;
  };
  competitive_position: string;
  recommendations: string[];
}

export async function getMLPricingSuggestion(
  category: string,
  ingredientCost: number,
  chefId?: string
): Promise<MLPricingSuggestion> {
  try {
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const ML_API_KEY = process.env.ML_API_KEY || 'dev-api-key-12345';

    const response = await fetch(`${ML_SERVICE_URL}/api/v1/pricing/suggest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ML_API_KEY,
      },
      body: JSON.stringify({
        category,
        ingredient_cost: ingredientCost,
        chef_id: chefId,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`ML Service error: ${response.statusText}`);
    }

    const data: MLPricingSuggestion = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching ML pricing suggestion:', error);
    
    // Fallback to simple cost-plus pricing
    const fallbackPrice = Math.ceil(ingredientCost / 0.65); // 35% margin
    return {
      success: true,
      suggested_price: fallbackPrice,
      price_range: {
        min: Math.ceil(ingredientCost / 0.75),
        max: Math.ceil(ingredientCost / 0.60),
        optimal: fallbackPrice,
      },
      market_insights: {
        category_avg_price: 0,
        total_dishes: 0,
        price_std_dev: 0,
        demand_factor: 1.0,
      },
      cost_analysis: {
        ingredient_cost: ingredientCost,
        suggested_margin_percent: 35,
        profit_per_unit: fallbackPrice - ingredientCost,
      },
      competitive_position: 'UNKNOWN',
      recommendations: [
        '⚠️ ML Service unavailable. Using standard 35% margin.',
        '💡 Check ML service connection for advanced insights.',
      ],
    };
  }
}
