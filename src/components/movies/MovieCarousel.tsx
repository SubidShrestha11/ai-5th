import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Movie } from '@/types';
import { MovieCard } from './MovieCard';
import { Spinner } from '@/components/ui';

interface MovieCarouselProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  loading?: boolean;
  error?: string | null;
  cardSize?: 'sm' | 'md' | 'lg';
  action?: { label: string; href: string };
}

export function MovieCarousel({
  title,
  subtitle,
  movies,
  loading = false,
  error = null,
  cardSize = 'md',
  action,
}: MovieCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <section className="relative">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold font-serif text-white">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {action && (
            <a
              href={action.href}
              className="text-sm text-sky-400 hover:text-sky-300 transition-colors hidden sm:block"
            >
              {action.label}
            </a>
          )}
          <div className="flex gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-400 py-8">{error}</p>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar pb-4"
          role="list"
        >
          {movies.map(movie => (
            <div key={movie.id} role="listitem">
              <MovieCard movie={movie} size={cardSize} />
            </div>
          ))}
          {movies.length === 0 && (
            <p className="text-slate-500 text-sm py-8">No films to show.</p>
          )}
        </div>
      )}
    </section>
  );
}
