import { Star } from "lucide-react";
import Image from "next/image";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date | string;
  user: {
    name: string | null;
    avatar: string | null;
  };
  menuItem?: {
    name: string;
  };
}

interface ReviewsSectionProps {
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

export default function ReviewsSection({ reviews, rating, reviewCount }: ReviewsSectionProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl text-center border border-gray-100">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
          <Star size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900">No Reviews Yet</h3>
        <p className="text-gray-500 mt-2">Be the first to order and leave a review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Visual Summary */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
        <div className="text-center md:text-left">
          <div className="text-5xl font-black text-gray-900">{rating}</div>
          <div className="flex items-center justify-center md:justify-start gap-1 my-2 text-orange-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={20} 
                fill={star <= Math.round(rating) ? "currentColor" : "none"} 
                className={star <= Math.round(rating) ? "text-orange-400" : "text-gray-300"}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 font-medium">{reviewCount} Reviews</p>
        </div>
        
        <div className="flex-1 w-full border-l border-gray-100 pl-0 md:pl-8">
             <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter(r => Math.round(r.rating) === star).length;
                  const percentage = (count / reviews.length) * 100;
                  return (
                    <div key={star} className="flex items-center gap-3 text-sm">
                        <span className="font-bold w-3">{star}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-orange-400 rounded-full" 
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                        <span className="text-gray-400 w-8 text-right">{percentage.toFixed(0)}%</span>
                    </div>
                  );
                })}
             </div>
        </div>
      </section>

      {/* Reviews List */}
      <section className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  <Image 
                    src={review.user.avatar || "/placeholder-avatar.jpg"} 
                    alt={review.user.name || "User"} 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{review.user.name || "Anonymous User"}</h4>
                  <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold">
                 {review.rating} <Star size={10} fill="currentColor" />
              </div>
            </div>
            
            {review.menuItem && (
               <div className="mb-3">
                 <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-md">
                   Ordered: {review.menuItem.name}
                 </span>
               </div>
            )}
            
            <p className="text-gray-600 text-sm leading-relaxed">
              {review.comment || "No comment provided."}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
