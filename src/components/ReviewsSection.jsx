import { useState, useEffect } from "react";
import {
  Star,
  MessageCircle,
  Send,
  Loader2,
} from "lucide-react";

// ─── Star Rating Display ───────────────────────────────────────────────────────
const StarRating = ({ rating, size = "sm", interactive = false, onRate }) => {
  const [hovered, setHovered] = useState(0);
  const sizeClass =
    size === "lg" ? "w-7 h-7" : size === "md" ? "w-5 h-5" : "w-4 h-4";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          onClick={interactive ? () => onRate(star) : undefined}
          onMouseEnter={interactive ? () => setHovered(star) : undefined}
          onMouseLeave={interactive ? () => setHovered(0) : undefined}
          className={
            interactive
              ? "cursor-pointer transition-transform hover:scale-110"
              : "cursor-default"
          }
          disabled={!interactive}
        >
          <Star
            className={`${sizeClass} transition-colors ${
              star <= (hovered || rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// ─── Rating Summary Bar ────────────────────────────────────────────────────────
const RatingBar = ({ count, total, star }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-6 text-right text-gray-600 font-medium">{star}</span>
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-gray-500 text-xs">{count}</span>
    </div>
  );
};

// ─── Single Review Card ────────────────────────────────────────────────────────
const ReviewCard = ({ review, currentUserId, currentUserRole, onReplySubmit }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState(review.providerReply?.comment || "");
  const [submitting, setSubmitting] = useState(false);
  const [localReply, setLocalReply] = useState(review.providerReply || null);

  const isProvider = currentUserRole === "provider";

  const initials = review.reviewer?.name
    ? review.reviewer.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await onReplySubmit(review._id, replyText.trim());
      setLocalReply({
        comment: replyText.trim(),
        createdAt: new Date().toISOString(),
      });
      setShowReply(false);
    } catch (err) {
      alert("Failed to submit reply. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Reviewer Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {review.reviewer?.avatar ? (
            <img
              src={review.reviewer.avatar}
              alt={review.reviewer.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-orange-100"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#B7410E] to-[#D7490C] flex items-center justify-center text-white text-sm font-bold ring-2 ring-orange-100">
              {initials}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              {review.reviewer?.name || "Anonymous"}
            </p>
            <p className="text-xs text-gray-400">{timeAgo(review.createdAt)}</p>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>

      {/* Review Comment */}
      {review.comment && (
        <p className="text-gray-700 text-sm leading-relaxed mb-4">
          {review.comment}
        </p>
      )}

      {/* Provider Reply (if exists) */}
      {localReply && (
        <div className="mt-4 ml-4 pl-4 border-l-2 border-[#D7490C]/30 bg-orange-50/50 rounded-r-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#B7410E] to-[#D7490C] flex items-center justify-center">
              <MessageCircle className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#B7410E]">
                Host Response
              </span>
              {localReply.createdAt && (
                <span className="text-xs text-gray-400 ml-2">
                  {timeAgo(localReply.createdAt)}
                </span>
              )}
            </div>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            {localReply.comment}
          </p>
        </div>
      )}

      {/* Provider Reply Button */}
      {isProvider && !localReply && (
        <div className="mt-4">
          {!showReply ? (
            <button
              onClick={() => setShowReply(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-[#D7490C] hover:text-[#B7410E] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Reply to this review
            </button>
          ) : (
            <div className="mt-3 space-y-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a thoughtful response to this review..."
                rows={3}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D7490C]/30 focus:border-[#D7490C] outline-none resize-none bg-gray-50 placeholder-gray-400"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowReply(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={submitting || !replyText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  {submitting ? "Posting..." : "Post Reply"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main ReviewsSection Component ────────────────────────────────────────────
const ReviewsSection = ({
  entityId,           // id of the event / service / resource
  type = "event",     // "event" | "service" | "resource"
  eventId,            // legacy fallback so old usages still work
  currentUser,        // optional — if not passed, we read from localStorage
}) => {
  // Accept either the new `entityId`/`type` pair or the legacy `eventId`
  const resolvedId = entityId || eventId;
  const resolvedType = type || "event";

  // Fallback: if parent didn't pass currentUser, pull it from localStorage
  // so providers can reply even when the page forgets to pass the user down.
  const resolvedUser =
    currentUser ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "null");
      } catch {
        return null;
      }
    })();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("recent");

  const LIMIT = 5;
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (!resolvedId) return;
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedId, resolvedType, page, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // GET /api/reviews/:type/:id
      const res = await fetch(
        `${API_URL}/reviews/${resolvedType}/${resolvedId}?page=${page}&limit=${LIMIT}&sort=${sortBy}`,
        { headers: { "Content-Type": "application/json" } }
      );
      const data = await res.json();

      if (data.success) {
        setReviews(data.data.reviews || []);
        setTotalPages(data.data.totalPages || 1);
        setTotal(data.data.total || 0);
      } else {
        setError(data.message || "Failed to load reviews");
      }
    } catch (err) {
      console.error("Reviews fetch error:", err);
      setError("Could not load reviews.");
    } finally {
      setLoading(false);
    }
  };

  // Handle provider reply submission
  const handleReplySubmit = async (reviewId, comment) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/reviews/${reviewId}/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ comment }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to reply");
    return data;
  };

  // Compute rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  if (!resolvedId) {
    return null; // nothing to show without an id
  }

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {resolvedType === "service"
              ? "Customer Reviews"
              : resolvedType === "resource"
              ? "Renter Reviews"
              : "Guest Reviews"}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {total > 0
              ? `${total} verified review${total !== 1 ? "s" : ""}`
              : "No reviews yet"}
          </p>
        </div>
        {total > 0 && (
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D7490C]/30 focus:border-[#D7490C] outline-none bg-white text-gray-600"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        )}
      </div>

      {/* Rating Overview */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row gap-8 mb-8 pb-8 border-b border-gray-100">
          <div className="flex flex-col items-center justify-center bg-orange-50 rounded-2xl px-8 py-6 flex-shrink-0">
            <span className="text-6xl font-black text-[#D7490C] leading-none">
              {avgRating}
            </span>
            <StarRating rating={parseFloat(avgRating)} size="md" />
            <span className="text-xs text-gray-500 mt-2">{total} reviews</span>
          </div>

          <div className="flex-1 space-y-2 justify-center flex flex-col">
            {ratingCounts.map(({ star, count }) => (
              <RatingBar
                key={star}
                star={star}
                count={count}
                total={reviews.length}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#D7490C]" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-8 text-red-600 text-sm bg-red-50 rounded-xl">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && reviews.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-[#D7490C]/40" />
          </div>
          <h3 className="text-gray-700 font-semibold mb-1">No reviews yet</h3>
          <p className="text-sm text-gray-400">
            Be the first to share your experience!
          </p>
        </div>
      )}

      {/* Reviews List */}
      {!loading && !error && reviews.length > 0 && (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                currentUserId={resolvedUser?._id}
                currentUserRole={resolvedUser?.role}
                onReplySubmit={handleReplySubmit}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500 px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ReviewsSection;