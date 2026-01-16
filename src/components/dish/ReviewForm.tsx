"use client";

import { Star, X } from "lucide-react";
import { useState } from "react";

interface ReviewFormProps {
  menuItemId: string;
  eligibleOrders: Array<{
    orderId: string;
    orderDate: Date;
    hasReviewed: boolean;
    canReview: boolean;
  }>;
  onSubmitted: () => void;
  onCancel: () => void;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
    orderId: string;
  };
}

export default function ReviewForm({
  menuItemId,
  eligibleOrders,
  onSubmitted,
  onCancel,
  existingReview,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    existingReview?.orderId || eligibleOrders.find((o) => o.canReview)?.orderId || null
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    // Only require order selection when creating a new review
    if (!existingReview && !selectedOrderId) {
      setError("Please select an order");
      return;
    }

    setSubmitting(true);

    try {
      const url = existingReview
        ? `/api/reviews/${existingReview.id}`
        : "/api/reviews";
      const method = existingReview ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(
          existingReview
            ? {
                rating,
                comment: comment.trim() || null,
              }
            : {
                menuItemId,
                orderId: selectedOrderId,
                rating,
                comment: comment.trim() || null,
              }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const reviewableOrders = eligibleOrders.filter((o) => o.canReview);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">
            {existingReview ? "Edit Your Review" : "Write Your Review"}
          </h4>
          {existingReview && (
            <p className="text-xs text-gray-500 mt-1">
              Update your rating and feedback
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>

      {/* Order Selection - Only show for new reviews */}
      {!existingReview && reviewableOrders.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Order
          </label>
          <select
            value={selectedOrderId || ""}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            required
          >
            <option value="">Select an order...</option>
            {reviewableOrders.map((order) => (
              <option key={order.orderId} value={order.orderId}>
                Order #{order.orderId.slice(-8).toUpperCase()} -{" "}
                {new Date(order.orderDate).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating *
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                size={32}
                className={
                  star <= (hoverRating || rating)
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300"
                }
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-sm text-gray-600 ml-2">
              {rating} {rating === 1 ? "star" : "stars"}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comment (Optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
          placeholder="Share your experience with this dish..."
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/500 characters
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="flex-1 py-2 px-4 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting
            ? existingReview
              ? "Updating..."
              : "Submitting..."
            : existingReview
            ? "Update Review"
            : "Submit Review"}
        </button>
      </div>
    </form>
  );
}
