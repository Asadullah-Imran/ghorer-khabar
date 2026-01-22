/**
 * Delivery charge calculation service
 * Calculates distance-based delivery charges and validates delivery distance
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate delivery charge based on distance
 * 
 * Rules:
 * - Minimum: 10-15 taka (depending on distance)
 * - Maximum: 60 taka
 * - If distance > 7 km: unavailable (return null)
 * 
 * @param distanceKm Distance in kilometers
 * @returns Delivery charge in taka, or null if distance is too far
 */
export function calculateDeliveryCharge(distanceKm: number): number | null {
  // If distance is greater than 7 km, delivery is unavailable
  if (distanceKm > 7) {
    return null;
  }

  // Minimum charge for very short distances (0-1 km)
  if (distanceKm <= 1) {
    return 10;
  }

  // For distances between 1-2 km
  if (distanceKm <= 2) {
    return 15;
  }

  // For distances between 2-4 km: 15 + (distance - 2) * 10
  // This gives: 2km = 15, 3km = 25, 4km = 35
  if (distanceKm <= 4) {
    return Math.round(15 + (distanceKm - 2) * 10);
  }

  // For distances between 4-7 km: 35 + (distance - 4) * 8.33
  // This gives: 4km = 35, 5km = 43, 6km = 52, 7km = 60
  if (distanceKm <= 7) {
    return Math.round(35 + (distanceKm - 4) * 8.33);
  }

  // Should not reach here, but return max if it does
  return 60;
}

/**
 * Check if delivery is available based on distance
 * @param distanceKm Distance in kilometers
 * @returns true if delivery is available (distance <= 7 km), false otherwise
 */
export function isDeliveryAvailable(distanceKm: number): boolean {
  return distanceKm <= 7;
}

/**
 * Get delivery charge with validation
 * @param buyerLat Buyer address latitude
 * @param buyerLng Buyer address longitude
 * @param kitchenLat Kitchen latitude
 * @param kitchenLng Kitchen longitude
 * @returns Object with distance, charge, and availability
 */
export function getDeliveryInfo(
  buyerLat: number | null | undefined,
  buyerLng: number | null | undefined,
  kitchenLat: number | null | undefined,
  kitchenLng: number | null | undefined
): {
  distance: number | null;
  charge: number | null;
  available: boolean;
  error?: string;
} {
  // Check if coordinates are available
  if (
    buyerLat === null ||
    buyerLat === undefined ||
    buyerLng === null ||
    buyerLng === undefined ||
    kitchenLat === null ||
    kitchenLat === undefined ||
    kitchenLng === null ||
    kitchenLng === undefined
  ) {
    return {
      distance: null,
      charge: null,
      available: false,
      error: "Address coordinates are missing. Please update your address with location.",
    };
  }

  // Calculate distance
  const distance = calculateDistance(buyerLat, buyerLng, kitchenLat, kitchenLng);

  // Check availability
  const available = isDeliveryAvailable(distance);

  // Calculate charge
  const charge = available ? calculateDeliveryCharge(distance) : null;

  return {
    distance,
    charge,
    available,
    error: available
      ? undefined
      : `Delivery is not available for distances greater than 7 km. Your distance is ${distance.toFixed(2)} km.`,
  };
}
