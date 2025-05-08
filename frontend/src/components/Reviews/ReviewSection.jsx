import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../Context/AuthContext';
import api from '../../services/api';
import StarRating from './StarRating';

const ReviewSection = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safely find user's review
  const userReview = user ? reviews.find(review => {
    const reviewUserId = review.user?._id ? review.user._id : review.user;
    return reviewUserId === user._id;
  }) : null;

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/reviews/product/${productId}`);
      
      let reviewsData = Array.isArray(response) ? response : response?.data || [];
      setReviews(reviewsData);
      
      if (reviewsData.length > 0) {
        const avg = reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewsData.length;
        setAverageRating(parseFloat(avg.toFixed(1)));
      } else {
        setAverageRating(0);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
      setReviews([]);
      setAverageRating(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  // Set initial values when userReview changes
  useEffect(() => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment);
    } else {
      setRating(0);
      setComment('');
    }
  }, [userReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only require rating for new reviews, not updates
    if (!userReview && !rating) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      let response;
      if (userReview) {
        // Update existing review - use existing rating if new one isn't selected
        const updatedRating = rating || userReview.rating;
        response = await api.put(`/api/reviews/${userReview._id}`, { 
          rating: updatedRating, 
          comment 
        });
        toast.success('Review updated successfully');
      } else {
        // Create new review
        response = await api.post(`/api/reviews/${productId}`, { 
          rating, 
          comment 
        });
        toast.success('Review added successfully');
      }
      
      // Refresh reviews data
      await fetchReviews();
      
      // Only reset if it was a new review
      if (!userReview) {
        setRating(0);
        setComment('');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await api.delete(`/api/reviews/${reviewId}`);
      toast.success('Review deleted successfully');
      // Refresh reviews data
      await fetchReviews();
      // Reset form if deleting own review
      if (userReview?._id === reviewId) {
        setRating(0);
        setComment('');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
      
      <div className="flex items-center mb-6">
        <div className="flex items-center mr-4">
          <span className="text-3xl font-bold mr-2">{averageRating}</span>
          <StarRating rating={averageRating} />
        </div>
        <span className="text-gray-600">
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      {user && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-medium mb-4">
            {userReview ? 'Update Your Review' : 'Write a Review'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Your Rating</label>
              <StarRating 
                rating={rating} 
                editable={true}
                onRatingChange={setRating}
              />
              {!userReview && !rating && (
                <p className="text-red-500 text-xs mt-1">Please select a rating</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border rounded-lg"
                rows="4"
                placeholder="Share your thoughts about this product..."
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className={`bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : userReview ? 'Update Review' : 'Submit Review'}
              </button>
              {userReview && (
                <button
                  type="button"
                  onClick={() => handleDelete(userReview._id)}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Delete Review
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No reviews yet. {user ? 'Be the first to review this product!' : 'Sign in to leave a review.'}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b pb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{review.user?.name || 'Anonymous'}</h4>
                  <div className="flex items-center mt-1">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mt-2">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;