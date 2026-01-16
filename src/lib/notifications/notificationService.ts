import { prisma } from "@/lib/prisma/prisma";

export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export interface CreateNotificationInput {
  userId?: string;
  kitchenId?: string;
  type: NotificationType;
  title: string;
  message: string;
}

/**
 * Create a notification for a user or kitchen
 */
export async function createNotification(input: CreateNotificationInput) {
  try {
    if (!input.userId && !input.kitchenId) {
      throw new Error("Either userId or kitchenId must be provided");
    }

    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        kitchenId: input.kitchenId,
        type: input.type,
        title: input.title,
        message: input.message,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

/**
 * Create notification for new order
 */
export async function notifyNewOrder(
  kitchenId: string,
  orderNumber: string,
  customerName: string,
  total: number
) {
  return createNotification({
    kitchenId,
    type: "INFO",
    title: "New Order Received",
    message: `New order ${orderNumber} from ${customerName} for ৳${total.toLocaleString()}`,
  });
}

/**
 * Create notification for order status change
 */
export async function notifyOrderStatusChange(
  kitchenId: string,
  orderNumber: string,
  status: string
) {
  let type: NotificationType = "INFO";
  let title = "";
  let message = "";

  switch (status) {
    case "CONFIRMED":
      type = "SUCCESS";
      title = "Order Confirmed";
      message = `Order ${orderNumber} has been confirmed`;
      break;
    case "PREPARING":
      type = "INFO";
      title = "Order Preparing";
      message = `Started preparing order ${orderNumber}`;
      break;
    case "DELIVERING":
      type = "INFO";
      title = "Order Delivering";
      message = `Order ${orderNumber} is out for delivery`;
      break;
    case "COMPLETED":
      type = "SUCCESS";
      title = "Order Completed";
      message = `Order ${orderNumber} has been successfully delivered`;
      break;
    case "CANCELLED":
      type = "WARNING";
      title = "Order Cancelled";
      message = `Order ${orderNumber} was cancelled`;
      break;
    default:
      return null;
  }

  return createNotification({
    kitchenId,
    type,
    title,
    message,
  });
}

/**
 * Create notification for low inventory
 */
export async function notifyLowInventory(
  kitchenId: string,
  itemName: string,
  currentStock: number,
  unit: string
) {
  return createNotification({
    kitchenId,
    type: "WARNING",
    title: "Low Inventory",
    message: `${itemName} stock is running low (${currentStock}${unit})`,
  });
}

/**
 * Create notification for payment received
 */
export async function notifyPaymentReceived(
  kitchenId: string,
  amount: number
) {
  return createNotification({
    kitchenId,
    type: "SUCCESS",
    title: "Payment Received",
    message: `৳${amount.toLocaleString()} credited to your account`,
  });
}

/**
 * Mark all notifications as read for a user or kitchen
 */
export async function markAllAsRead(userId?: string, kitchenId?: string) {
  const where: any = { read: false };
  if (userId) where.userId = userId;
  if (kitchenId) where.kitchenId = kitchenId;

  return prisma.notification.updateMany({
    where,
    data: {
      read: true,
    },
  });
}

/**
 * Delete old read notifications (older than 30 days)
 */
export async function cleanupOldNotifications(userId?: string, kitchenId?: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const where: any = {
    read: true,
    createdAt: {
      lt: thirtyDaysAgo,
    },
  };
  if (userId) where.userId = userId;
  if (kitchenId) where.kitchenId = kitchenId;

  return prisma.notification.deleteMany({
    where,
  });
}

/**
 * Create notification for a user (buyer)
 */
export async function notifyUser(
  userId: string,
  type: NotificationType,
  title: string,
  message: string
) {
  return createNotification({
    userId,
    type,
    title,
    message,
  });
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 10,
  offset: number = 0,
  unreadOnly: boolean = false
) {
  const where: any = { userId };
  if (unreadOnly) where.read = false;

  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}
