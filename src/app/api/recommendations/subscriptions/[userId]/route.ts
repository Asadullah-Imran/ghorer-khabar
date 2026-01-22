/**
 * Proxy API route for subscription recommendations
 * Falls back to popular subscriptions if ML service is unavailable
 */
import { NextRequest, NextResponse } from 'next/server';
import { getFallbackSubscriptionRecommendations } from '@/lib/services/fallbackRecommendations';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_SERVICE_API_KEY = process.env.ML_SERVICE_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Extract userId outside try block so it's available in catch block
  const { userId } = await params;
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Build query string
    const queryParams = new URLSearchParams();
    const limit = searchParams.get('limit');
    const maxPrice = searchParams.get('maxPrice');
    const mealsPerDay = searchParams.get('mealsPerDay');
    
    if (limit) queryParams.append('limit', limit);
    if (maxPrice) queryParams.append('max_price', maxPrice);
    if (mealsPerDay) queryParams.append('meals_per_day', mealsPerDay);
    
    // Check if ML service is configured
    if (!ML_SERVICE_URL || !ML_SERVICE_API_KEY) {
      console.warn('ML Service not configured. Using fallback recommendations.');
      const fallbackRecs = await getFallbackSubscriptionRecommendations(
        parseInt(limit || '6')
      );
      
      return NextResponse.json({
        user_id: userId,
        recommendations: fallbackRecs,
        metadata: {
          algorithm: 'fallback_popular',
          cold_start: true,
          generated_at: new Date().toISOString(),
          total_candidates: fallbackRecs.length,
          note: 'ML Service not configured - showing popular subscriptions'
        }
      });
    }

    // Call ML service
    let response;
    try {
      response = await fetch(
        `${ML_SERVICE_URL}/api/v1/recommendations/subscriptions/${userId}?${queryParams.toString()}`,
        {
          headers: {
            'X-API-Key': ML_SERVICE_API_KEY as string,
          },
          cache: 'no-store',
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      );
    } catch (fetchError: any) {
      console.error('Error connecting to ML service:', fetchError);
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('ECONNREFUSED')) {
        console.warn('ML service unavailable, using fallback recommendations');
        const fallbackRecs = await getFallbackSubscriptionRecommendations(
          parseInt(limit || '6')
        );
        
        return NextResponse.json({
          user_id: userId,
          recommendations: fallbackRecs,
          metadata: {
            algorithm: 'fallback_popular',
            cold_start: true,
            generated_at: new Date().toISOString(),
            total_candidates: fallbackRecs.length,
            note: 'ML service unavailable - showing popular subscriptions'
          }
        });
      }
      throw fetchError;
    }
    
    if (!response.ok) {
      console.error(`ML Service error ${response.status}`);
      const fallbackRecs = await getFallbackSubscriptionRecommendations(
        parseInt(limit || '6')
      );
      
      return NextResponse.json({
        user_id: userId,
        recommendations: fallbackRecs,
        metadata: {
          algorithm: 'fallback_popular',
          cold_start: true,
          generated_at: new Date().toISOString(),
          total_candidates: fallbackRecs.length,
          note: `ML service error ${response.status} - showing popular subscriptions`
        }
      });
    }
    
    const data = await response.json();
    
    // If ML service returns empty recommendations, use fallback
    if (!data.recommendations || data.recommendations.length === 0) {
      console.warn('ML service returned empty recommendations, using fallback');
      const fallbackRecs = await getFallbackSubscriptionRecommendations(
        parseInt(limit || '6')
      );
      
      return NextResponse.json({
        user_id: userId,
        recommendations: fallbackRecs,
        metadata: {
          algorithm: 'fallback_popular',
          cold_start: true,
          generated_at: new Date().toISOString(),
          total_candidates: fallbackRecs.length,
          note: 'ML service returned empty results - showing popular subscriptions'
        }
      });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching subscription recommendations:', error);
    
    // Use fallback recommendations on any error
    try {
      const { searchParams } = new URL(request.url);
      const limit = searchParams.get('limit');
      
      const fallbackRecs = await getFallbackSubscriptionRecommendations(
        parseInt(limit || '6')
      );
      
      return NextResponse.json({
        user_id: userId || 'unknown',
        recommendations: fallbackRecs,
        metadata: {
          algorithm: 'fallback_popular',
          cold_start: true,
          generated_at: new Date().toISOString(),
          total_candidates: fallbackRecs.length,
          note: 'Error occurred - showing popular subscriptions'
        }
      });
    } catch (fallbackError) {
      return NextResponse.json({
        user_id: userId || 'unknown',
        recommendations: [],
        metadata: {
          algorithm: 'fallback',
          cold_start: true,
          generated_at: new Date().toISOString(),
          total_candidates: 0
        }
      });
    }
  }
}
