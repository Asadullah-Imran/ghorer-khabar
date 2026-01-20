import { prisma } from "@/lib/prisma/prisma";

/**
 * Revenue Calculation Service
 * 
 * Revenue Model (per REVENUE_CALCULATION_GUIDE.md):
 * - Order Total = Items Total + Delivery Fee + Platform Fee - Discount
 * - Chef Revenue = Items Total + Delivery Fee - Discount (for subscriptions)
 * - Platform Revenue = Platform Fee + Commission (optional)
 * 
 * Note: Delivery Fee goes to the chef; Platform revenue is platform fee + optional commission.
 * 
 * This service calculates revenue on-the-fly from order data.
 * No database fields needed - we calculate from existing order.items and order.total
 */

// Platform fee per order (fixed) — set to 0 when using percentage commission only
export const PLATFORM_FEE_PER_ORDER = 0;

// Platform commission percentage (0% = no commission, only platform fee)
// Can be changed to a percentage (e.g., 0.05 for 5%)
// If using commission, chef revenue = itemsTotal - (itemsTotal * commission)
// If not using commission, chef revenue = itemsTotal - platformFee
export const PLATFORM_COMMISSION_PERCENT = 0.05; // 5% commission per completed sale

export interface OrderRevenueBreakdown {
  itemsTotal: number;
  deliveryFee: number;
  platformFee: number;
  commission: number;
  chefRevenue: number;
  platformRevenue: number;
  orderTotal: number;
  discount?: number; // For subscription orders
}

/**
 * Calculate revenue breakdown for an order
 * 
 * @param itemsTotal - Sum of (menu item price × quantity)
 * @param deliveryFee - Delivery charge
 * @param discount - Optional discount (for subscriptions)
 */
export function calculateOrderRevenue(
  itemsTotal: number,
  deliveryFee: number,
  discount: number = 0
): OrderRevenueBreakdown {
  const platformFee = PLATFORM_FEE_PER_ORDER;
  const commission = itemsTotal * PLATFORM_COMMISSION_PERCENT;

  // Chef receives items + delivery - discount
  const chefRevenue = Math.max(0, itemsTotal + deliveryFee - discount);

  // Platform receives platform fee + commission
  const platformRevenue = platformFee + commission;

  // Order total
  const orderTotal = itemsTotal + deliveryFee + platformFee - discount;

  return {
    itemsTotal,
    deliveryFee,
    platformFee,
    commission,
    chefRevenue,
    platformRevenue,
    orderTotal,
    discount,
  };
}

/**
 * Calculate chef revenue from completed orders (on-the-fly calculation)
 * 
 * Revenue Model:
 * - Chef Revenue = Items Total - Platform Fee (৳10)
 * - Delivery Fee goes to platform (operational cost)
 * 
 * @param kitchenId - Kitchen ID to calculate revenue for
 * @param startDate - Start date for calculation (optional)
 * @param endDate - End date for calculation (optional)
 * @returns Total chef revenue
 */
export async function calculateChefRevenue(
  kitchenId: string,
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  const where: any = {
    kitchenId,
    status: "COMPLETED",
  };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  // Get all completed orders with items
  const orders = await prisma.order.findMany({
    where,
    include: {
      items: true,
    },
  });

  let totalChefRevenue = 0;

  for (const order of orders) {
    // Chef revenue = order total - platform fee
    const chefRevenue = order.total - PLATFORM_FEE_PER_ORDER;
    totalChefRevenue += Math.max(0, chefRevenue);
  }

  return totalChefRevenue;
}

/**
 * Calculate platform revenue from completed orders (on-the-fly calculation)
 * 
 * Revenue Model:
 * - Platform Revenue = Delivery Fee + Platform Fee (৳10) + Commission (if any)
 * - Delivery Fee is operational cost and goes to platform
 * 
 * @param startDate - Start date for calculation (optional)
 * @param endDate - End date for calculation (optional)
 * @returns Total platform revenue
 */
export async function calculatePlatformRevenue(
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  const where: any = {
    status: "COMPLETED",
  };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  // Get all completed orders with items
  const orders = await prisma.order.findMany({
    where,
    include: {
      items: true,
    },
  });

  let totalPlatformRevenue = 0;

  for (const order of orders) {
    // Items total for commission calculation
    const itemsTotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const platformFee = PLATFORM_FEE_PER_ORDER;
    const commission = itemsTotal * PLATFORM_COMMISSION_PERCENT;
    const platformRevenue = platformFee + commission;
    totalPlatformRevenue += Math.max(0, platformRevenue);
  }

  return totalPlatformRevenue;
}

/**
 * Calculate chef revenue for a specific order (on-the-fly)
 * 
 * Revenue Model:
 * - Chef Revenue = Items Total - Platform Fee (৳10)
 * - Delivery Fee does NOT go to chef (operational cost)
 * 
 * @param orderId - Order ID
 * @returns Chef revenue for this order
 */
export async function calculateChefRevenueForOrder(orderId: string): Promise<number> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Chef revenue = order total - platform fee
  const chefRevenue = order.total - PLATFORM_FEE_PER_ORDER;
  return Math.max(0, chefRevenue);
}

/**
 * Calculate platform revenue for a specific order (on-the-fly)
 * 
 * Revenue Model:
 * - Platform Revenue = Delivery Fee + Platform Fee (৳10) + Commission (if any)
 * 
 * @param orderId - Order ID
 * @returns Platform revenue for this order
 */
export async function calculatePlatformRevenueForOrder(orderId: string): Promise<number> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Items total for commission
  const itemsTotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const platformFee = PLATFORM_FEE_PER_ORDER;
  const commission = itemsTotal * PLATFORM_COMMISSION_PERCENT;
  const platformRevenue = platformFee + commission;
  return Math.max(0, platformRevenue);
}

/**
 * Get revenue breakdown for a specific order
 * 
 * @param orderId - Order ID
 * @returns Complete revenue breakdown
 */
export async function getOrderRevenueBreakdown(orderId: string): Promise<OrderRevenueBreakdown> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Calculate items total
  const itemsTotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Calculate delivery fee (order.total - itemsTotal - platformFee)
  const platformFee = PLATFORM_FEE_PER_ORDER;
  const deliveryFee = order.total - itemsTotal - platformFee;

  // Calculate revenue breakdown
  return calculateOrderRevenue(itemsTotal, deliveryFee, 0);
}
