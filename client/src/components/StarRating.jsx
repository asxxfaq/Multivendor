// src/components/StarRating.jsx
export default function StarRating({ average = 0, count = 0, size = 'sm' }) {
    return (
      <div className="product-rating">
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= Math.floor(average) ? 'filled' : star - 0.5 <= average ? 'half' : ''}`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="rating-count">({count})</span>
      </div>
    )
  }