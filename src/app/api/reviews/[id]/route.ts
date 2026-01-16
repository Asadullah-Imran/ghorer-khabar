import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * PUT /api/reviews/[id]
 * Update an existing review
 * Body: { rating, comment? }
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { rating, comment } = body;

    // Validate required fields
    if (!rating) {
      return NextResponse.json(
        { error: "Rating is required" },
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

    // Find the review
    const review = await prisma.review.findUnique({
      where: { id },
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

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    // Verify the review belongs to the user
    if (review.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized - You can only update your own reviews" },
        { status: 403 }
      );
    }

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating,
        comment: comment !== undefined ? (comment.trim() || null) : undefined,
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
      where: { menuItemId: review.menuItemId },
      select: { rating: true },
    });

    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.menu_items.update({
      where: { id: review.menuItemId },
      data: {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: allReviews.length,
      },
    });

    const transformedReview = {
      id: updatedReview.id,
      userId: updatedReview.userId,
      userName: updatedReview.user.name || "Anonymous",
      userAvatar: updatedReview.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedReview.user.name || "User")}`,
      rating: updatedReview.rating,
      comment: updatedReview.comment,
      createdAt: updatedReview.createdAt,
    };

    return NextResponse.json({ success: true, data: transformedReview });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[id]
 * Delete a review
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the review to verify ownership
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    if (review.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized - You can only delete your own reviews" },
        { status: 403 }
      );
    }

    const menuItemId = review.menuItemId;

    // Delete the review
    await prisma.review.delete({
      where: { id },
    });

    // Recalculate menu item rating and review count
    const allReviews = await prisma.review.findMany({
      where: { menuItemId },
      select: { rating: true },
    });

    if (allReviews.length > 0) {
      const averageRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await prisma.menu_items.update({
        where: { id: menuItemId },
        data: {
          rating: Math.round(averageRating * 10) / 10,
          reviewCount: allReviews.length,
        },
      });
    } else {
      // Reset rating if no reviews left
      await prisma.menu_items.update({
        where: { id: menuItemId },
        data: {
          rating: 0,
          reviewCount: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
