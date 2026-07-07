import { useState } from 'react';
import { Star } from 'lucide-react';

type Size = 'sm' | 'md' | 'lg';

interface StarRatingProps {
  value: number | null;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: Size;
  className?: string;
  showValue?: boolean;
}

const sizeMap: Record<Size, number> = {
  sm: 12,
  md: 16,
  lg: 20,
};

const MAX = 5;

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  className = '',
  showValue = false,
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const starSize = sizeMap[size];
  const display = hover ?? value ?? 0;
  const isInteractive = !readonly && !!onChange;

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: MAX }, (_, i) => {
        const starVal = i + 1;
        const filled = display >= starVal;
        const halfFilled = !filled && display >= starVal - 0.5;

        return (
          <button
            key={i}
            type="button"
            disabled={!isInteractive}
            onClick={() => onChange?.(starVal)}
            onMouseEnter={() => isInteractive && setHover(starVal)}
            onMouseLeave={() => isInteractive && setHover(null)}
            className={[
              'transition-all duration-100 focus:outline-none',
              isInteractive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
            ].join(' ')}
            aria-label={`Rate ${starVal} star${starVal > 1 ? 's' : ''}`}
          >
            <Star
              size={starSize}
              className={[
                'transition-colors duration-100',
                filled
                  ? 'text-amber-400 fill-amber-400'
                  : halfFilled
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-slate-600',
                isInteractive && hover !== null
                  ? starVal <= (hover ?? 0)
                    ? 'text-amber-300 fill-amber-300'
                    : 'text-slate-600'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          </button>
        );
      })}
      {showValue && value !== null && (
        <span className="ml-1.5 text-sm font-medium text-slate-300">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
