"use client";

import { Star, Edit2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import ReviewForm from "./ReviewForm";

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

interface ReviewSectionProps {
  menuItemId: string;
  currentRating: number;
  reviewCount: number;
}

export default function ReviewSection({
  menuItemId,
  currentRating,
  reviewCount,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [eligibleOrders, setEligibleOrders] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
    checkEligibility();
  }, [menuItemId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?menuItemId=${menuItemId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReviews(
            data.data.map((r: any) => ({
              ...r,
              createdAt: new Date(r.createdAt),
            }))
          );
          // Set current user ID from API response
          if (data.currentUserId) {
            setCurrentUserId(data.currentUserId);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    try {
      const response = await fetch(
        `/api/reviews/check-eligibility?menuItemId=${menuItemId}`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCanReview(data.data.canReview);
          setEligibleOrders(data.data.eligibleOrders);
        }
      }
    } catch (error) {
      console.error("Error checking eligibility:", error);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setEditingReviewId(null);
    fetchReviews();
    checkEligibility();
  };

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setShowReviewForm(true);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-gray-900">What Foodies Say</h3>
        <div className="flex items-center gap-1 text-yellow-500">
          <Star size={20} fill="currentColor" />
          <span className="font-bold text-gray-900 text-lg">
            {currentRating.toFixed(1)}
          </span>
          <span className="text-gray-400 text-sm">({reviewCount} Reviews)</span>
        </div>
      </div>

      {/* Review Form Toggle */}
      {canReview && !showReviewForm && (
        <div className="mb-6">
          <button
            onClick={() => setShowReviewForm(true)}
            className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition"
          >
            Write a Review
          </button>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <ReviewForm
            menuItemId={menuItemId}
            eligibleOrders={eligibleOrders}
            onSubmitted={handleReviewSubmitted}
            onCancel={() => {
              setShowReviewForm(false);
              setEditingReviewId(null);
            }}
            existingReview={
              editingReviewId
                ? reviews.find((r) => r.id === editingReviewId)
                  ? {
                      id: editingReviewId,
                      rating: reviews.find((r) => r.id === editingReviewId)!.rating,
                      comment: reviews.find((r) => r.id === editingReviewId)!.comment,
                      orderId: "", // Not needed for editing
                    }
                  : undefined
                : undefined
            }
          />
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {loading ? (
          <p className="text-gray-500 text-sm">Loading reviews...</p>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-50 pb-6 last:border-0 last:pb-0"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src={review.userAvatar}
                      alt={review.userName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block">
                      {review.userName}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={
                            star <= review.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currentUserId === review.userId && (
                    <button
                      onClick={() => handleEditReview(review)}
                      className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded transition"
                      title="Edit your review"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                  <span className="text-xs text-gray-400">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600 leading-relaxed mt-2">
                  "{review.comment}"
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm italic">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
