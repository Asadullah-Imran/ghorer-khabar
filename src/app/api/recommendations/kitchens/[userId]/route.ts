/**
 * Proxy API route for kitchen recommendations
 * Falls back to popular kitchens if ML service is unavailable
 */
import { NextRequest, NextResponse } from 'next/server';
import { getFallbackKitchenRecommendations } from '@/lib/services/fallbackRecommendations';

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
    const userLat = searchParams.get('userLat');
    const userLng = searchParams.get('userLng');
    const maxDistance = searchParams.get('maxDistanceKm');
    
    if (limit) queryParams.append('limit', limit);
    if (userLat) queryParams.append('user_lat', userLat);
    if (userLng) queryParams.append('user_lng', userLng);
    if (maxDistance) queryParams.append('max_distance_km', maxDistance);
    
    // Check if ML service is configured
    if (!ML_SERVICE_URL || !ML_SERVICE_API_KEY) {
      console.warn('ML Service not configured. Using fallback recommendations.');
      const fallbackRecs = await getFallbackKitchenRecommendations(
        parseInt(limit || '8')
      );
      
      return NextResponse.json({
        user_id: userId,
        recommendations: fallbackRecs,
        metadata: {
          algorithm: 'fallback_popular',
          cold_start: true,
          generated_at: new Date().toISOString(),
          total_candidates: fallbackRecs.length,
          note: 'ML Service not configured - showing popular kitchens'
        }
      });
    }

    // Call ML service
    let response;
    try {
      response = await fetch(
        `${ML_SERVICE_URL}/api/v1/recommendations/kitchens/${userId}?${queryParams.toString()}`,
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
        const fallbackRecs = await getFallbackKitchenRecommendations(
          parseInt(limit || '8')
        );
        
        return NextResponse.json({
          user_id: userId,
          recommendations: fallbackRecs,
          metadata: {
            algorithm: 'fallback_popular',
            cold_start: true,
            generated_at: new Date().toISOString(),
            total_candidates: fallbackRecs.length,
            note: 'ML service unavailable - showing popular kitchens'
          }
        });
      }
      throw fetchError;
    }
    
    if (!response.ok) {
      console.error(`ML Service error ${response.status}`);
      const fallbackRecs = await getFallbackKitchenRecommendations(
        parseInt(limit || '8')
      );
      
      return NextResponse.json({
        user_id: userId,
        recommendations: fallbackRecs,
        metadata: {
          algorithm: 'fallback_popular',
          cold_start: true,
          generated_at: new Date().toISOString(),
          total_candidates: fallbackRecs.length,
          note: `ML service error ${response.status} - showing popular kitchens`
        }
      });
    }
    
    const data = await response.json();
    
    // If ML service returns empty recommendations, use fallback
    if (!data.recommendations || data.recommendations.length === 0) {
      console.warn('ML service returned empty recommendations, using fallback');
      const fallbackRecs = await getFallbackKitchenRecommendations(
        parseInt(limit || '8')
      );
      
      return NextResponse.json({
        user_id: userId,
        recommendations: fallbackRecs,
        metadata: {
          algorithm: 'fallback_popular',
          cold_start: true,
          generated_at: new Date().toISOString(),
          total_candidates: fallbackRecs.length,
          note: 'ML service returned empty results - showing popular kitchens'
        }
      });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching kitchen recommendations:', error);
    
    // Use fallback recommendations on any error
    try {
      const { searchParams } = new URL(request.url);
      const limit = searchParams.get('limit');
      
      const fallbackRecs = await getFallbackKitchenRecommendations(
        parseInt(limit || '8')
      );
      
      return NextResponse.json({
        user_id: userId || 'unknown',
        recommendations: fallbackRecs,
        metadata: {
          algorithm: 'fallback_popular',
          cold_start: true,
          generated_at: new Date().toISOString(),
          total_candidates: fallbackRecs.length,
          note: 'Error occurred - showing popular kitchens'
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
