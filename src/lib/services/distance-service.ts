import { prisma } from '@/lib/prisma/prisma';
import { calculateDistance, formatDistance, isValidCoordinates } from '@/lib/utils/distance';

/**
 * Get a single kitchen with calculated distance from user's default address
 */
export async function getKitchenWithDistance(
  kitchenId: string,
  userId: string | null
): Promise<{
  kitchen: any;
  distance: number | null;
  distanceFormatted: string | null;
}> {
  // Fetch kitchen with address
  const kitchen = await prisma.kitchen.findUnique({
    where: { id: kitchenId },
    include: {
      address: true, // Kitchen location
      seller: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      gallery: true,
      subscription_plans: {
        where: { is_active: true },
      },
    },
  });

  if (!kitchen) {
    throw new Error('Kitchen not found');
  }

  let distance: number | null = null;
  let distanceFormatted: string | null = null;

  // Only calculate distance if user is logged in
  if (userId) {
    // Get user's default address
    const userAddress = await prisma.address.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });

    // Calculate distance if both have valid coordinates
    if (
      kitchen.address &&
      userAddress &&
      isValidCoordinates(kitchen.address.latitude, kitchen.address.longitude) &&
      isValidCoordinates(userAddress.latitude, userAddress.longitude)
    ) {
      distance = calculateDistance(
        userAddress.latitude!,
        userAddress.longitude!,
        kitchen.address.latitude!,
        kitchen.address.longitude!
      );
      distanceFormatted = formatDistance(distance);
    }
  }

  return {
    kitchen,
    distance,
    distanceFormatted,
  };
}

/**
 * Get multiple kitchens with calculated distances from user's default address
 * Optionally filter by maximum distance and sort by distance
 */
export async function getKitchensWithDistances(
  userId: string | null,
  filters?: {
    maxDistance?: number; // in km
    zone?: string;
    isOpen?: boolean;
    isVerified?: boolean;
  }
): Promise<
  Array<{
    kitchen: any;
    distance: number | null;
    distanceFormatted: string | null;
  }>
> {
  let userAddress = null;

  // Get user's default address if logged in
  if (userId) {
    userAddress = await prisma.address.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });
  }

  // Build where clause for kitchen query
  const whereClause: any = {
    isActive: true,
  };

  if (filters?.isOpen !== undefined) {
    whereClause.isOpen = filters.isOpen;
  }

  if (filters?.isVerified !== undefined) {
    whereClause.isVerified = filters.isVerified;
  }

  // Fetch all kitchens
  const kitchens = await prisma.kitchen.findMany({
    where: whereClause,
    include: {
      address: true,
      seller: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  // Calculate distances for each kitchen
  const kitchensWithDistance = kitchens.map((kitchen) => {
    let distance: number | null = null;
    let distanceFormatted: string | null = null;

    if (
      kitchen.address &&
      userAddress &&
      isValidCoordinates(kitchen.address.latitude, kitchen.address.longitude) &&
      isValidCoordinates(userAddress.latitude, userAddress.longitude)
    ) {
      distance = calculateDistance(
        userAddress.latitude!,
        userAddress.longitude!,
        kitchen.address.latitude!,
        kitchen.address.longitude!
      );
      distanceFormatted = formatDistance(distance);
    }

    return {
      kitchen,
      distance,
      distanceFormatted,
    };
  });

  // Filter by max distance if specified and user has address
  let filtered = kitchensWithDistance;
  if (filters?.maxDistance !== undefined && userAddress) {
    filtered = filtered.filter(
      (k) => k.distance !== null && k.distance <= filters.maxDistance!
    );
  }

  // Filter by zone if specified
  if (filters?.zone) {
    filtered = filtered.filter(
      (k) => k.kitchen.address?.zone === filters.zone
    );
  }

  // Sort by distance (nulls last)
  filtered.sort((a, b) => {
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });

  return filtered;
}

/**
 * Get nearby kitchens within a certain radius
 */
export async function getNearbyKitchens(
  userId: string,
  radiusKm: number = 10
): Promise<
  Array<{
    kitchen: any;
    distance: number;
    distanceFormatted: string;
  }>
> {
  const results = await getKitchensWithDistances(userId, {
    maxDistance: radiusKm,
    isOpen: true,
    isVerified: true,
  });

  // Filter out null distances and sort
  return results
    .filter((r): r is { kitchen: any; distance: number; distanceFormatted: string } => 
      r.distance !== null
    )
    .sort((a, b) => a.distance - b.distance);
}
