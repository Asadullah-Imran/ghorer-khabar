"use client";

import { Star, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import ReviewForm from "@/components/dish/ReviewForm";

interface OrderItemReviewButtonProps {
  menuItemId: string;
  menuItemName: string;
  orderId: string;
  orderDate: Date;
  hasReviewed: boolean;
  reviewId?: string;
  reviewRating?: number;
  reviewComment?: string | null;
}

export default function OrderItemReviewButton({
  menuItemId,
  menuItemName,
  orderId,
  orderDate,
  hasReviewed,
  reviewId,
  reviewRating,
  reviewComment,
}: OrderItemReviewButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(hasReviewed);
  const [isEditing, setIsEditing] = useState(false);

  const handleReviewSubmitted = () => {
    setShowForm(false);
    setReviewSubmitted(true);
    setIsEditing(false);
    // Optionally refresh the page or show success message
    window.location.reload();
  };

  if (reviewSubmitted && !showForm) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Star size={16} className="fill-green-600" />
          <span>Reviewed</span>
        </div>
        {reviewId && (
          <button
            onClick={() => {
              setIsEditing(true);
              setShowForm(true);
            }}
            className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded transition"
            title="Edit your review"
          >
            <Edit2 size={14} />
          </button>
        )}
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <ReviewForm
          menuItemId={menuItemId}
          eligibleOrders={[
            {
              orderId,
              orderDate,
              hasReviewed: false,
              canReview: true,
            },
          ]}
          onSubmitted={handleReviewSubmitted}
          onCancel={() => {
            setShowForm(false);
            setIsEditing(false);
          }}
          existingReview={
            isEditing && reviewId && reviewRating
              ? {
                  id: reviewId,
                  rating: reviewRating,
                  comment: reviewComment || null,
                  orderId,
                }
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
    >
      <Star size={16} />
      <span>Write Review</span>
    </button>
  );
}
