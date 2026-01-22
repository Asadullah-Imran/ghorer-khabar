/**
 * Proxy API route for dish recommendations
 * Calls the ML service and returns recommendations
 */
import { NextRequest, NextResponse } from 'next/server';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_SERVICE_API_KEY = process.env.ML_SERVICE_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
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
      console.error('ML Service not configured. ML_SERVICE_URL or ML_SERVICE_API_KEY missing.');
      return NextResponse.json({
        user_id: userId,
        recommendations: [],
        metadata: {
          algorithm: 'fallback',
          cold_start: true,
          generated_at: new Date().toISOString(),
          total_candidates: 0,
          error: 'ML Service not configured'
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
      
      // If ML service is not available, return empty recommendations instead of error
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('ECONNREFUSED')) {
        console.warn('ML service unavailable, returning empty recommendations');
        return NextResponse.json({
          user_id: userId,
          recommendations: [],
          metadata: {
            algorithm: 'fallback',
            cold_start: true,
            generated_at: new Date().toISOString(),
            total_candidates: 0,
            error: 'ML service unavailable'
          }
        });
      }
      
      throw fetchError;
    }
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`ML Service error ${response.status}:`, errorText);
      
      // Return empty recommendations instead of error
      return NextResponse.json({
        user_id: userId,
        recommendations: [],
        metadata: {
          algorithm: 'fallback',
          cold_start: true,
          generated_at: new Date().toISOString(),
          total_candidates: 0,
          error: `ML service returned ${response.status}`
        }
      });
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching dish recommendations:', error);
    
    // Return empty recommendations instead of error to prevent UI breakage
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
