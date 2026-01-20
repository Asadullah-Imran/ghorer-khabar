import { getAuthUserId } from '@/lib/auth/getAuthUser';
import { getKitchensWithDistances, getNearbyKitchens } from '@/lib/services/distance-service';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/kitchens
 * Get list of kitchens with distances
 * 
 * Query params:
 * - maxDistance: maximum distance in km (e.g., ?maxDistance=10)
 * - zone: filter by zone (e.g., ?zone=Mirpur)
 * - isOpen: filter by open status (e.g., ?isOpen=true)
 * - nearby: get nearby kitchens within radius (e.g., ?nearby=10)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get user ID (null if not logged in)
    const userId = await getAuthUserId();

    // Parse query parameters
    const maxDistance = searchParams.get('maxDistance')
      ? parseFloat(searchParams.get('maxDistance')!)
      : undefined;
    const zone = searchParams.get('zone') || undefined;
    const isOpen = searchParams.get('isOpen')
      ? searchParams.get('isOpen') === 'true'
      : undefined;
    const nearby = searchParams.get('nearby')
      ? parseFloat(searchParams.get('nearby')!)
      : undefined;

    // If nearby parameter is provided, use specialized function
    if (nearby && userId) {
      const results = await getNearbyKitchens(userId, nearby);
      return NextResponse.json({
        kitchens: results,
        count: results.length,
      });
    }

    // Otherwise use general function
    const results = await getKitchensWithDistances(userId, {
      maxDistance,
      zone,
      isOpen,
      isVerified: true, // Only show verified kitchens
    });

    return NextResponse.json({
      kitchens: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error fetching kitchens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kitchens' },
      { status: 500 }
    );
  }
}
