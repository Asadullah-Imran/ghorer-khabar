import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/reviews?menuItemId=xxx
 * Get reviews for a menu item
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const menuItemId = searchParams.get("menuItemId");

    if (!menuItemId) {
      return NextResponse.json(
        { error: "menuItemId is required" },
        { status: 400 }
      );
    }

    // Get current user ID if authenticated (optional)
    const currentUserId = await getAuthUserId();

    const reviews = await prisma.review.findMany({
      where: { menuItemId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const transformedReviews = reviews.map((review) => ({
      id: review.id,
      userId: review.userId,
      userName: review.user.name || "Anonymous",
      userAvatar: review.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user.name || "User")}`,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    }));

    return NextResponse.json({ 
      success: true, 
      data: transformedReviews,
      currentUserId: currentUserId || null,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 * Create a new review
 * Body: { menuItemId, orderId, rating, comment? }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { menuItemId, orderId, rating, comment } = body;

    // Validate required fields
    if (!menuItemId || !orderId || !rating) {
      return NextResponse.json(
        { error: "menuItemId, orderId, and rating are required" },
        { status: 400 }
      );
    }

    // Validate rating (1-5)
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          where: { menuItemId },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized - Order does not belong to you" },
        { status: 403 }
      );
    }

    // Verify order is completed
    if (order.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "You can only review items from completed orders" },
        { status: 400 }
      );
    }

    // Verify menu item was in the order
    if (order.items.length === 0) {
      return NextResponse.json(
        { error: "This menu item was not in the order" },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_menuItemId_orderId: {
          userId,
          menuItemId,
          orderId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this item from this order" },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        menuItemId,
        orderId,
        rating,
        comment: comment || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update menu item rating and review count
    const allReviews = await prisma.review.findMany({
      where: { menuItemId },
      select: { rating: true },
    });

    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.menu_items.update({
      where: { id: menuItemId },
      data: {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: allReviews.length,
      },
    });

    // Update KRI score for the kitchen (async, don't wait)
    // Reviews affect rating and satisfaction scores in KRI
    const menuItem = await prisma.menu_items.findUnique({
      where: { id: menuItemId },
      select: { chef_id: true },
    });

    if (menuItem?.chef_id) {
      const kitchen = await prisma.kitchen.findFirst({
        where: { sellerId: menuItem.chef_id },
        select: { id: true },
      });

      if (kitchen) {
        import("@/lib/services/kriCalculation")
          .then(({ updateKRIScore }) => updateKRIScore(kitchen.id))
          .catch((error) => {
            console.error("Error updating KRI after review creation:", error);
            // Don't fail the review creation if KRI update fails
          });
      }
    }

    const transformedReview = {
      id: review.id,
      userId: review.userId,
      userName: review.user.name || "Anonymous",
      userAvatar: review.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user.name || "User")}`,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    };

    return NextResponse.json({ success: true, data: transformedReview });
  } catch (error: any) {
    console.error("Error creating review:", error);
    
    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "You have already reviewed this item from this order" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
