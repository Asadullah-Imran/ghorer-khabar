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
    
    // Call ML service
    const response = await fetch(
      `${ML_SERVICE_URL}/api/v1/recommendations/kitchens/${userId}?${queryParams.toString()}`,
      {
        headers: {
          'X-API-Key': ML_SERVICE_API_KEY as string,
        },
        cache: 'no-store',
      }
    );
    
    if (!response.ok) {
      throw new Error(`ML Service error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching kitchen recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
