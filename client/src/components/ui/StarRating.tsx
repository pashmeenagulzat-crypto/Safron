

interface StarRatingProps { rating: number; max?: number; size?: 'sm' | 'md' | 'lg'; }

export function StarRating({ rating, max = 5, size = 'md' }: StarRatingProps) {
  const sizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };
  return (
    <span className={`flex items-center gap-0.5 ${sizes[size]}`} aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => {
        const fill = Math.min(Math.max(rating - i, 0), 1);
        return (
          <span key={i} className="relative inline-block text-amber-200">
            ★
            <span className="absolute inset-0 overflow-hidden text-amber-500" style={{ width: `${fill * 100}%` }}>★</span>
          </span>
        );
      })}
    </span>
  );
}

export function RatingDisplay({ rating, count, size = 'md' }: { rating: number; count: number; size?: 'sm' | 'md' }) {
  return (
    <div className="flex items-center gap-1.5">
      <StarRating rating={rating} size={size} />
      <span className={`text-gold-600 font-semibold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{rating.toFixed(1)}</span>
      <span className={`text-saffron-muted ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>({count})</span>
    </div>
  );
}
