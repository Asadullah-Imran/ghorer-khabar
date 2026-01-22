/**
 * Proxy API route for kitchen recommendations
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
    const userLat = searchParams.get('userLat');
    const userLng = searchParams.get('userLng');
    const maxDistance = searchParams.get('maxDistanceKm');
    
    if (limit) queryParams.append('limit', limit);
    if (userLat) queryParams.append('user_lat', userLat);
    if (userLng) queryParams.append('user_lng', userLng);
    if (maxDistance) queryParams.append('max_distance_km', maxDistance);
    
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
          total_candidates: 0
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
        return NextResponse.json({
          user_id: userId,
          recommendations: [],
          metadata: {
            algorithm: 'fallback',
            cold_start: true,
            generated_at: new Date().toISOString(),
            total_candidates: 0
          }
        });
      }
      throw fetchError;
    }
    
    if (!response.ok) {
      console.error(`ML Service error ${response.status}`);
      return NextResponse.json({
        user_id: userId,
        recommendations: [],
        metadata: {
          algorithm: 'fallback',
          cold_start: true,
          generated_at: new Date().toISOString(),
          total_candidates: 0
        }
      });
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching kitchen recommendations:', error);
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
