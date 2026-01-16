"use client";

import { useState } from "react";
import { X, Star, AlertTriangle, CheckCircle2, MoreVertical } from "lucide-react";

interface MenuItem {
  id?: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  prepTime?: number;
  calories?: number;
  spiciness?: string;
  isVegetarian?: boolean;
  isAvailable?: boolean;
  images?: Array<{ id?: string; imageUrl?: string; order?: number }>;
  ingredients?: Array<{ id?: string; name: string; quantity: number; unit: string; cost?: number }>;
  rating?: number;
  reviewCount?: number;
}

interface MenuItemReview {
  id: string;
  rating: number;
  comment: string;
  customerName: string;
  date: string | Date;
  isAppealedByChef?: boolean;
  appealReason?: string;
}

interface MenuInsightsModalProps {
  menuItem: MenuItem;
  reviews: MenuItemReview[];
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
}

export default function MenuInsightsModal({
  menuItem,
  reviews,
  isOpen,
  onClose,
  loading = false,
}: MenuInsightsModalProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [appealedReviews, setAppealedReviews] = useState<Set<string>>(
    new Set(reviews.filter((r) => (r as any).isAppealedByChef).map((r) => r.id))
  );
  const [appealModalId, setAppealModalId] = useState<string | null>(null);
  const [appealText, setAppealText] = useState("");

  if (!isOpen) return null;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : menuItem.rating || 0;

  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const handleAppealClick = (reviewId: string, currentReason: string) => {
    setAppealModalId(reviewId);
    setAppealText(currentReason || "");
  };

  const handleSubmitAppeal = (reviewId: string) => {
    if (appealText.trim()) {
      setAppealedReviews((prev) => new Set([...prev, reviewId]));
      setAppealModalId(null);
      setAppealText("");
      alert("Appeal submitted successfully. Admin will review this within 24 hours.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{menuItem.name} - Insights</h2>
            <p className="text-sm text-gray-500 mt-1">{reviews.length} reviews</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Rating Summary */}
          {loading ? (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 animate-pulse">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="flex items-baseline gap-2">
                    <div className="h-10 w-16 bg-gray-200 rounded"></div>
                    <div className="h-5 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
                {/* Rating Distribution Skeleton */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-2">
                      <div className="w-12 h-3 bg-gray-200 rounded"></div>
                      <div className="w-24 h-2 bg-gray-200 rounded-full"></div>
                      <div className="w-6 h-3 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-orange-500">{avgRating}</span>
                    <span className="text-lg text-gray-500">/5.0</span>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-12 text-right">{stars}★</span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all"
                          style={{
                            width: `${reviews.length > 0 ? (ratingDistribution[stars as keyof typeof ratingDistribution] / reviews.length) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 w-6">
                        {ratingDistribution[stars as keyof typeof ratingDistribution]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-lg">Customer Reviews</h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-lg p-4 bg-white animate-pulse"
                  >
                    {/* Review Header Skeleton */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, j) => (
                              <div
                                key={j}
                                className="w-3 h-3 bg-gray-200 rounded"
                              ></div>
                            ))}
                          </div>
                        </div>
                        <div className="h-3 w-20 bg-gray-200 rounded"></div>
                      </div>
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    </div>
                    {/* Review Text Skeleton */}
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-gray-200 rounded"></div>
                      <div className="h-3 w-4/5 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No reviews yet. Encourage customers to share their feedback!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className={`border rounded-lg p-4 transition ${
                    appealedReviews.has(review.id)
                      ? "bg-purple-50 border-purple-200"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{review.customerName}</h4>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {review.date instanceof Date
                          ? review.date.toLocaleDateString()
                          : new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Menu Button */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === review.id ? null : review.id)
                        }
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                      >
                        <MoreVertical size={18} className="text-gray-600" />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === review.id && (
                        <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-max">
                          {appealedReviews.has(review.id) ? (
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 font-semibold">
                              <CheckCircle2 size={16} className="text-purple-600" />
                              Appeal Submitted
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                handleAppealClick(review.id, "");
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                            >
                              <AlertTriangle size={16} />
                              Appeal for Fraud
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Review Text */}
                  {review.comment && (
                    <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                  )}
                  {!review.comment && (
                    <p className="text-sm text-gray-400 italic mb-2">No comment provided</p>
                  )}

                  {/* Appeal Status Badge */}
                  {appealedReviews.has(review.id) && (
                    <div className="flex items-center gap-2 p-2 bg-purple-100 border border-purple-300 rounded-lg mt-2">
                      <CheckCircle2 size={16} className="text-purple-600" />
                      <span className="text-xs font-semibold text-purple-700">
                        {review.appealReason || "Appeal under review"}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Appeal Modal Overlay */}
        {appealModalId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="text-red-600" />
                  Appeal Review
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for Appeal *
                  </label>
                  <textarea
                    value={appealText}
                    onChange={(e) => setAppealText(e.target.value)}
                    placeholder="Explain why you believe this review is fraudulent (e.g., competitor review, false claims, etc.)"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 resize-none"
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setAppealModalId(null);
                      setAppealText("");
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmitAppeal(appealModalId)}
                    disabled={!appealText.trim()}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Appeal
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Our admin team will review this within 24 hours
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
