import React from 'react';

const StarRating = ({ rating, editable = false, onRatingChange }) => {
  const handleClick = (newRating) => {
    if (editable && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} ${editable ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={() => editable && handleClick(star)}
          onMouseEnter={() => editable && handleClick(star)}
          disabled={!editable}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default StarRating;