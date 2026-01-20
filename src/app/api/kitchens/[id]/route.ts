import { getAuthUserId } from '@/lib/auth/getAuthUser';
import { getKitchenWithDistance } from '@/lib/services/distance-service';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/kitchens/[id]
 * Get kitchen details with distance from user's default address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kitchenId } = await params;

    // Get user ID (null if not logged in)
    const userId = await getAuthUserId();

    // Fetch kitchen with distance calculation
    const result = await getKitchenWithDistance(kitchenId, userId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching kitchen:', error);

    if (error.message === 'Kitchen not found') {
      return NextResponse.json(
        { error: 'Kitchen not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch kitchen' },
      { status: 500 }
    );
  }
}
