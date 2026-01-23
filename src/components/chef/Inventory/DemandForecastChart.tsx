"use client";

import { AlertTriangle, Calendar, Loader2, Minus, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface DailyForecast {
  date: string;
  day_name: string;
  predicted_orders: number;
  predicted_items: number;
  predicted_revenue: number;
  confidence: number;
}

interface IngredientForecast {
  ingredient_name: string;
  unit: string;
  predicted_demand: number;
  estimated_cost: number;
  forecast_period_days: number;
}

interface ForecastSummary {
  forecast_days: number;
  model_used: string;
  history_days_used: number;
  avg_daily_orders?: number;
  trend?: string;
}

interface ForecastResponse {
  chef_id: string;
  forecast: {
    daily: DailyForecast[];
    ingredients: IngredientForecast[];
  };
  summary: ForecastSummary;
  metadata: {
    generated_at: string;
    confidence: string;
  };
}

export default function DemandForecastChart() {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<"moving_average" | "exponential_smoothing">("moving_average");

  const fetchForecast = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`/api/chef/forecast?days=7&model=${model}`);
      
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }
      
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching forecast:", err);
      setError("Failed to load forecast. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [model]);

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="text-green-600" size={20} />;
      case "decreasing":
        return <TrendingDown className="text-red-600" size={20} />;
      default:
        return <Minus className="text-gray-600" size={20} />;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case "increasing":
        return "text-green-700 bg-green-50";
      case "decreasing":
        return "text-red-700 bg-red-50";
      default:
        return "text-gray-700 bg-gray-50";
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "text-green-700 bg-green-100";
      case "medium":
        return "text-yellow-700 bg-yellow-100";
      default:
        return "text-orange-700 bg-orange-100";
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={40} />
        <p className="text-gray-600">Analyzing order history and generating forecast...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <AlertTriangle className="text-red-500 mx-auto mb-4" size={40} />
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchForecast}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data || data.forecast.daily.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <Calendar className="text-yellow-600 mx-auto mb-4" size={40} />
        <h3 className="text-xl font-bold text-yellow-900 mb-2">Insufficient Data</h3>
        <p className="text-yellow-700">Need more order history to generate accurate forecasts.</p>
      </div>
    );
  }

  // Calculate max for bar scaling (using items, not revenue)
  const maxItems = Math.max(...data.forecast.daily.map(d => d.predicted_items));

  return (
    <div className="space-y-6">
      {/* Header with Model Selection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-900">7-Day Demand Forecast</h3>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${getConfidenceColor(data.metadata.confidence)}`}>
            {data.metadata.confidence} confidence
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="moving_average">Moving Average</option>
            <option value="exponential_smoothing">Exponential Smoothing</option>
          </select>
          <button
            onClick={fetchForecast}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-600 mb-1">Avg Daily Orders</p>
          <p className="text-2xl font-bold text-purple-700">{data.summary.avg_daily_orders?.toFixed(1) || "N/A"}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600 mb-1">History Used</p>
          <p className="text-2xl font-bold text-blue-700">{data.summary.history_days_used} days</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Model</p>
          <p className="text-lg font-bold text-gray-700 capitalize">{data.summary.model_used.replace("_", " ")}</p>
        </div>
        <div className={`border rounded-lg p-4 ${getTrendColor(data.summary.trend)}`}>
          <p className="text-sm mb-1">Trend</p>
          <div className="flex items-center gap-2">
            {getTrendIcon(data.summary.trend)}
            <p className="text-lg font-bold capitalize">{data.summary.trend || "Stable"}</p>
          </div>
        </div>
      </div>

      {/* Daily Forecast Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Daily Predictions</h4>
        <div className="space-y-4">
          {data.forecast.daily.map((day) => {
            const maxItems = Math.max(...data.forecast.daily.map(d => d.predicted_items));
            return (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-24 flex-shrink-0">
                  <p className="font-semibold text-gray-900">{day.day_name}</p>
                  <p className="text-xs text-gray-500">{day.date}</p>
                </div>
                
                {/* Items Bar (Primary) */}
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">{day.predicted_orders.toFixed(1)} orders</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-purple-700">{day.predicted_items.toFixed(1)} items</span>
                      <span className="text-gray-500 text-xs">৳{day.predicted_revenue.toFixed(0)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all"
                      style={{ width: `${(day.predicted_items / maxItems) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* Confidence */}
                <div className="w-16 text-right flex-shrink-0">
                  <span className="text-xs text-gray-500">{(day.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Ingredients Forecast */}
      {data.forecast.ingredients.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Ingredient Demand Forecast (7 days)</h4>
          <p className="text-xs text-gray-500 mb-4 italic">
            Note: Forecast units are from menu items. Values will be converted to match your inventory units when synced.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.forecast.ingredients.slice(0, 8).map((ing) => (
              <div
                key={ing.ingredient_name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <p className="font-medium text-gray-900">{ing.ingredient_name}</p>
                  <p className="text-xs text-gray-500">Forecast unit: {ing.unit}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-700 text-lg">
                    {ing.predicted_demand.toFixed(1)} {ing.unit}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Est. cost: ৳{ing.estimated_cost.toFixed(0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
