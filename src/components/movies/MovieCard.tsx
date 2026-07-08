import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, Star } from 'lucide-react';
import type { Movie } from '@/types';
import { posterUrl, releaseYear } from '@/lib/utils';
import { useLoggedMovies } from '@/hooks/useLoggedMovies';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui';

interface MovieCardProps {
  movie: Movie;
  size?: 'sm' | 'md' | 'lg';
  showRating?: boolean;
}

export function MovieCard({ movie, size = 'md', showRating = true }: MovieCardProps) {
  const [imgError, setImgError] = useState(false);
  const { isLogged } = useLoggedMovies();
  const { openLogModal } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  const poster = imgError ? null : posterUrl(movie.poster_path, size === 'lg' ? 'w500' : 'w342');
  const year = releaseYear(movie.release_date);
  const logged = isLogged(movie.id);

  const widthClass = {
    sm: 'w-28',
    md: 'w-36',
    lg: 'w-48',
  }[size];

  return (
    <div className={`${widthClass} shrink-0 group relative`}>
      <Link to={`/movie/${movie.id}`} className="block">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#162032] ring-1 ring-white/10 transition-all duration-300 group-hover:ring-sky-300/40 group-hover:shadow-xl group-hover:shadow-sky-300/10 group-hover:-translate-y-1">
          {poster ? (
            <img
              src={poster}
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 text-center">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Star size={16} className="text-slate-600" />
              </div>
              <span className="text-xs text-slate-500 leading-snug line-clamp-3">{movie.title}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#070B12]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {logged && (
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 rounded-full bg-sky-300 flex items-center justify-center shadow-lg">
                <Check size={12} className="text-[#070B12]" strokeWidth={3} />
              </div>
            </div>
          )}

          {isAuthenticated && (
            <div className="absolute bottom-0 left-0 right-0 p-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-1 group-hover:translate-y-0">
              <button
                type="button"
                onClick={e => {
                  e.preventDefault();
                  openLogModal(movie.id, movie.title, movie.poster_path);
                }}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  logged
                    ? 'bg-sky-300 text-[#070B12]'
                    : 'bg-[#101827]/90 text-slate-200 hover:bg-sky-300 hover:text-[#070B12] backdrop-blur-sm border border-white/10'
                }`}
                aria-label={logged ? 'Edit log' : 'Log film'}
              >
                {logged ? <Check size={12} strokeWidth={3} /> : <Plus size={12} />}
                {logged ? 'Logged' : 'Log'}
              </button>
            </div>
          )}
        </div>
      </Link>

      <div className="mt-2 px-0.5">
        <Link
          to={`/movie/${movie.id}`}
          className="block text-sm font-medium text-slate-200 leading-snug line-clamp-2 hover:text-sky-300 transition-colors duration-200"
        >
          {movie.title}
        </Link>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500">{year}</span>
          {showRating && (
            <Badge variant="yellow" size="sm">
              <Star size={9} fill="currentColor" className="text-amber-400" />
              {movie.vote_average.toFixed(1)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
