/**
 * Kitchen Reliability Index (KRI) Calculation Service
 * 
 * KRI is a composite score (0-100) that measures kitchen reliability based on:
 * - Customer ratings and reviews (Rating Score: 0-30 points)
 * - Order fulfillment and completion rates (Fulfillment Score: 0-25 points)
 * - On-time delivery performance for FIXED TIME DELIVERY (Delivery Score: 0-20 points)
 * - Response time to orders (Response Score: 0-15 points)
 * - Customer satisfaction from positive reviews (Satisfaction Score: 0-10 points)
 * 
 * Note: 
 * - Delivery Score uses fixed time delivery logic (orders must be completed on delivery_date)
 * - Satisfaction Score is calculated from review ratings (4-5 stars = positive), not a stored field
 */

import { prisma } from "@/lib/prisma/prisma";

export interface KRICalculationResult {
  kriScore: number; // Final KRI score (0-100)
  breakdown: {
    ratingScore: number; // 0-30 points
    fulfillmentScore: number; // 0-25 points
    deliveryScore: number; // 0-20 points
    responseScore: number; // 0-15 points
    satisfactionScore: number; // 0-10 points (calculated from review ratings)
  };
  metrics: {
    averageRating: number;
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    completionRate: number; // %
    onTimeDeliveryRate: number; // %
    averageResponseTime: number; // minutes
    satisfactionRate: number; // % (derived from positive reviews)
    reviewCount: number;
    positiveReviewRate: number; // % of 4-5 star reviews
  };
  isNewChef?: boolean; // True if chef has < 5 orders or < 3 reviews
}

/**
 * Calculate KRI score for a kitchen
 * @param kitchenId - The kitchen ID
 * @returns KRI calculation result with score and breakdown
 */
export async function calculateKRI(kitchenId: string): Promise<KRICalculationResult> {
  // Get kitchen with current metrics and sellerId
  const kitchen = await prisma.kitchen.findUnique({
    where: { id: kitchenId },
    select: {
      id: true,
      sellerId: true,
      rating: true,
      reviewCount: true,
      totalOrders: true,
      responseTime: true,
      deliveryRate: true,
    },
  });

  if (!kitchen) {
    throw new Error(`Kitchen with ID ${kitchenId} not found`);
  }

  // Get order statistics
  const orders = await prisma.order.findMany({
    where: { kitchenId },
    select: {
      id: true,
      status: true,
      createdAt: true,
      delivery_date: true,
      updatedAt: true,
    },
  });

  // Calculate order metrics
  const totalOrders = orders.length || 0;
  const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED").length;
  const completionRate =
    totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

  // Calculate on-time delivery rate for FIXED TIME DELIVERY
  // On-time = completed on or before the scheduled delivery_date
  // For fixed time delivery, we allow a small buffer (2 hours) for delivery completion
  // but orders should be completed on the delivery date, not days later
  const deliveredOrders = orders.filter((o) => o.status === "COMPLETED");
  let onTimeCount = 0;
  
  for (const order of deliveredOrders) {
    const deliveryDate = new Date(order.delivery_date);
    const completedAt = order.updatedAt;
    
    // For fixed time delivery: order must be completed on the same day as delivery_date
    // Allow up to 2 hours buffer after delivery_date time (for actual delivery completion)
    const deliveryDateStart = new Date(deliveryDate);
    deliveryDateStart.setHours(0, 0, 0, 0); // Start of delivery day
    
    const deliveryDateEnd = new Date(deliveryDate);
    deliveryDateEnd.setHours(23, 59, 59, 999); // End of delivery day
    deliveryDateEnd.setTime(deliveryDateEnd.getTime() + (2 * 60 * 60 * 1000)); // +2 hours buffer
    
    // Order is on-time if completed on the delivery date (with 2-hour buffer)
    if (completedAt >= deliveryDateStart && completedAt <= deliveryDateEnd) {
      onTimeCount++;
    }
  }

  const onTimeDeliveryRate =
    deliveredOrders.length > 0
      ? (onTimeCount / deliveredOrders.length) * 100
      : 0;

  // Get average response time (time from order creation to CONFIRMED status)
  // For now, use the stored responseTime, but we can calculate it if needed
  const averageResponseTime = kitchen.responseTime || 0;

  // Get average rating from reviews
  // Reviews are linked via menuItem.chef_id (which is the sellerId/User.id)
  const reviews = await prisma.review.findMany({
    where: {
      menuItem: {
        chef_id: kitchen.sellerId,
      },
    },
    select: {
      rating: true,
    },
  });

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : Number(kitchen.rating) || 0;

  const reviewCount = kitchen.reviewCount || reviews.length;
  
  // Calculate satisfaction rate from review ratings
  // Satisfaction = % of positive reviews (4-5 stars)
  // This replaces the satisfactionRate field which isn't being populated
  const positiveReviews = reviews.filter((r) => r.rating >= 4).length;
  const satisfactionRate =
    reviews.length > 0 ? (positiveReviews / reviews.length) * 100 : 0;
  
  const storedDeliveryRate = Number(kitchen.deliveryRate) || 0;

  // Use calculated onTimeDeliveryRate if available, otherwise use stored
  const finalDeliveryRate =
    deliveredOrders.length > 0 ? onTimeDeliveryRate : storedDeliveryRate;

  // ============================================
  // KRI SCORE CALCULATION (Total: 100 points)
  // ============================================

  // 1. Rating Score (0-30 points)
  // Based on average rating (1-5 scale)
  // Formula: (rating / 5) * 30
  const ratingScore = Math.min((averageRating / 5) * 30, 30);

  // 2. Fulfillment Score (0-25 points)
  // Based on order completion rate
  // Formula: (completionRate / 100) * 25
  // Penalty for high cancellation rate
  const cancellationRate =
    totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;
  const fulfillmentScore = Math.max(
    0,
    (completionRate / 100) * 25 - (cancellationRate / 100) * 5
  );

  // 3. Delivery Score (0-20 points)
  // Based on on-time delivery rate
  // Formula: (onTimeDeliveryRate / 100) * 20
  const deliveryScore = (finalDeliveryRate / 100) * 20;

  // 4. Response Score (0-15 points)
  // Based on average response time (faster = better)
  // Formula: Max(0, 15 - (responseTime / 60) * 2)
  // Assumes 60 minutes = 0 points, 0 minutes = 15 points
  const responseScore = Math.max(0, 15 - (averageResponseTime / 60) * 2);

  // 5. Satisfaction Score (0-10 points)
  // Based on positive review rate (4-5 star reviews)
  // Formula: (positiveReviewRate / 100) * 10
  // This is calculated from actual review data, not a stored field
  const satisfactionScore = (satisfactionRate / 100) * 10;

  // Calculate total KRI score
  const kriScore = Math.round(
    ratingScore +
      fulfillmentScore +
      deliveryScore +
      responseScore +
      satisfactionScore
  );

  // ============================================
  // NEW CHEF HANDLING
  // ============================================
  // For new chefs with insufficient data, provide a base score
  // This gives them a fair starting point until they have enough orders/reviews
  const isNewChef = totalOrders < 5 || reviewCount < 3;
  const NEW_CHEF_BASE_SCORE = 50; // Base score for new chefs (neutral starting point)
  
  let finalKriScore: number;
  
  if (isNewChef) {
    // For new chefs, use a combination of:
    // 1. Base score (50 points) - neutral starting point
    // 2. Any actual data they have (partial credit)
    // 3. Response score (if they respond quickly, they get credit)
    
    // Calculate partial score from actual data
    const actualScore = kriScore;
    
    // If they have some data, blend base score with actual score
    // More data = more weight on actual score
    const dataWeight = Math.min(
      (totalOrders / 5) * 0.5 + (reviewCount / 3) * 0.5, // Max 1.0 when they have 5 orders AND 3 reviews
      1.0
    );
    
    // Blend: base score + (actual score * data weight)
    // This ensures new chefs start at 50, but get credit for early good performance
    finalKriScore = Math.round(
      NEW_CHEF_BASE_SCORE * (1 - dataWeight) + actualScore * dataWeight
    );
    
    // Ensure minimum of 50 for new chefs (they shouldn't start below neutral)
    finalKriScore = Math.max(NEW_CHEF_BASE_SCORE, finalKriScore);
  } else {
    // Established chefs: use actual calculated score
    finalKriScore = kriScore;
  }

  // Ensure score is between 0-100
  finalKriScore = Math.max(0, Math.min(100, finalKriScore));

  return {
    kriScore: finalKriScore,
    breakdown: {
      ratingScore: Math.round(ratingScore * 100) / 100,
      fulfillmentScore: Math.round(fulfillmentScore * 100) / 100,
      deliveryScore: Math.round(deliveryScore * 100) / 100,
      responseScore: Math.round(responseScore * 100) / 100,
      satisfactionScore: Math.round(satisfactionScore * 100) / 100,
    },
    metrics: {
      averageRating: Math.round(averageRating * 100) / 100,
      totalOrders,
      completedOrders,
      cancelledOrders,
      completionRate: Math.round(completionRate * 100) / 100,
      onTimeDeliveryRate: Math.round(finalDeliveryRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      satisfactionRate: Math.round(satisfactionRate * 100) / 100,
      reviewCount,
      positiveReviewRate: Math.round(satisfactionRate * 100) / 100, // Same as satisfactionRate
    },
    isNewChef, // Flag to indicate if this is a new chef
  };
}

/**
 * Update KRI score in the database for a kitchen
 * @param kitchenId - The kitchen ID
 * @returns Updated KRI score
 */
export async function updateKRIScore(kitchenId: string): Promise<number> {
  const kriResult = await calculateKRI(kitchenId);

  // Update kitchen with new KRI score
  await prisma.kitchen.update({
    where: { id: kitchenId },
    data: {
      kriScore: kriResult.kriScore,
    },
  });

  return kriResult.kriScore;
}

/**
 * Batch update KRI scores for all kitchens
 * Useful for cron jobs or admin tasks
 */
export async function updateAllKRIScores(): Promise<void> {
  const kitchens = await prisma.kitchen.findMany({
    select: { id: true },
  });

  for (const kitchen of kitchens) {
    try {
      await updateKRIScore(kitchen.id);
      console.log(`Updated KRI for kitchen ${kitchen.id}`);
    } catch (error) {
      console.error(
        `Error updating KRI for kitchen ${kitchen.id}:`,
        error
      );
    }
  }
}
