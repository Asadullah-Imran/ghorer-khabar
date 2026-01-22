/**
 * Proxy API route for dish recommendations
 * Calls the ML service and returns recommendations
 * Falls back to popular dishes if ML service is unavailable
 */
import { NextRequest, NextResponse } from 'next/server';
import { getFallbackDishRecommendations } from '@/lib/services/fallbackRecommendations';

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
    const excludeIds = searchParams.get('excludeIds');
    const category = searchParams.get('category');
    const maxPrice = searchParams.get('maxPrice');
    
    if (limit) queryParams.append('limit', limit);
    if (excludeIds) queryParams.append('exclude_ids', excludeIds);
    if (category) queryParams.append('category', category);
    if (maxPrice) queryParams.append('max_price', maxPrice);
    
    // Check if ML service is configured
    if (!ML_SERVICE_URL || !ML_SERVICE_API_KEY) {
      console.warn('ML Service not configured. Using fallback recommendations.');
      const fallbackRecs = await getFallbackDishRecommendations(
        parseInt(limit || '12'),
        excludeIds ? excludeIds.split(',') : []
      );
      
      return NextResponse.json({
        user_id: userId,
        recommendations: fallbackRecs,
        metadata: {
          algorithm: 'fallback_popular',
          cold_start: true,
          generated_at: new Date().toISOString(),
          total_candidates: fallbackRecs.length,
          note: 'ML Service not configured - showing popular dishes'
        }
      });
    }

    // Call ML service
    const mlServiceUrl = `${ML_SERVICE_URL}/api/v1/recommendations/dishes/${userId}?${queryParams.toString()}`;
    console.log('Calling ML service:', mlServiceUrl);
    
    let response;
    try {
      response = await fetch(mlServiceUrl, {
        headers: {
          'X-API-Key': ML_SERVICE_API_KEY as string,
        },
        cache: 'no-store', // Disable caching for personalized recommendations
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
    } catch (fetchError: any) {
      console.error('Error connecting to ML service:', fetchError);
      
      // If ML service is not available, use fallback recommendations
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('ECONNREFUSED')) {
        console.warn('ML service unavailable, using fallback recommendations');
        const fallbackRecs = await getFallbackDishRecommendations(
          parseInt(limit || '12'),
          excludeIds ? excludeIds.split(',') : []
        );
        
        return NextResponse.json({
          user_id: userId,
          recommendations: fallbackRecs,
          metadata: {
            algorithm: 'fallback_popular',
            cold_start: true,
            generated_at: new Date().toISOString(),
            total_candidates: fallbackRecs.length,
            note: 'ML service unavailable - showing popular dishes'
          }
        });
      }
      
      throw fetchError;
    }
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`ML Service error ${response.status}:`, errorText);
      
      // Use fallback recommendations when ML service returns error
      const fallbackRecs = await getFallbackDishRecommendations(
        parseInt(limit || '12'),
        excludeIds ? excludeIds.split(',') : []
      );
      
      return NextResponse.json({
        user_id: userId,
        recommendations: fallbackRecs,
        metadata: {
          algorithm: 'fallback_popular',
          cold_start: true,
          generated_at: new Date().toISOString(),
          total_candidates: fallbackRecs.length,
          note: `ML service error ${response.status} - showing popular dishes`
        }
      });
    }
    
    const data = await response.json();
    
    // If ML service returns empty recommendations, use fallback
    if (!data.recommendations || data.recommendations.length === 0) {
      console.warn('ML service returned empty recommendations, using fallback');
      const fallbackRecs = await getFallbackDishRecommendations(
        parseInt(limit || '12'),
        excludeIds ? excludeIds.split(',') : []
      );
      
      return NextResponse.json({
        user_id: userId,
        recommendations: fallbackRecs,
        metadata: {
          algorithm: 'fallback_popular',
          cold_start: true,
          generated_at: new Date().toISOString(),
          total_candidates: fallbackRecs.length,
          note: 'ML service returned empty results - showing popular dishes'
        }
      });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching dish recommendations:', error);
    
    // Use fallback recommendations on any error
    try {
      const { searchParams } = new URL(request.url);
      const limit = searchParams.get('limit');
      const excludeIds = searchParams.get('excludeIds');
      
      const fallbackRecs = await getFallbackDishRecommendations(
        parseInt(limit || '12'),
        excludeIds ? excludeIds.split(',') : []
      );
      
      return NextResponse.json({
        user_id: userId || 'unknown',
        recommendations: fallbackRecs,
        metadata: {
          algorithm: 'fallback_popular',
          cold_start: true,
          generated_at: new Date().toISOString(),
          total_candidates: fallbackRecs.length,
          note: 'Error occurred - showing popular dishes'
        }
      });
    } catch (fallbackError) {
      // If fallback also fails, return empty array
      return NextResponse.json({
        user_id: userId || 'unknown',
        recommendations: [],
        metadata: {
          algorithm: 'fallback',
          cold_start: true,
          generated_at: new Date().toISOString(),
          total_candidates: 0,
          error: error.message || 'Unknown error'
        }
      });
    }
  }
}
