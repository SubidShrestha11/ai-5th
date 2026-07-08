import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Star, Clock, Calendar } from 'lucide-react';
import type { Movie } from '@/types';
import { backdropUrl, posterUrl, releaseYear, formatRating } from '@/lib/utils';
import { GENRE_MAP } from '@/lib/genres';
import { Button, Badge } from '@/components/ui';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useLoggedMovies } from '@/hooks/useLoggedMovies';

interface FeaturedMovieProps {
  movie: Movie;
  tagline?: string;
  runtime?: number;
}

export function FeaturedMovie({ movie, tagline, runtime }: FeaturedMovieProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const backdrop = backdropUrl(movie.backdrop_path);
  const poster = posterUrl(movie.poster_path, 'w500');
  const { openLogModal } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const { isLogged } = useLoggedMovies();
  const logged = isLogged(movie.id);

  const genres = movie.genre_ids.slice(0, 3).map(id => GENRE_MAP[id]).filter(Boolean);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#101827] min-h-[440px] sm:min-h-[520px]">
      {backdrop && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        >
          <img
            src={backdrop}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            onLoad={() => setImgLoaded(true)}
          />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-[#070B12] via-[#070B12]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070B12]/80 via-transparent to-transparent" />

      <div className="relative z-10 flex items-end h-full min-h-[440px] sm:min-h-[520px] p-6 sm:p-10">
        <div className="flex gap-6 sm:gap-8 items-end max-w-3xl">
          {poster && (
            <div className="hidden sm:block shrink-0 w-32 lg:w-40 rounded-xl overflow-hidden ring-2 ring-white/15 shadow-2xl shadow-black/60">
              <img
                src={poster}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover"
              />
            </div>
          )}

          <div className="flex flex-col gap-4">
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.map(g => (
                  <Badge key={g} variant="glass" size="sm">{g}</Badge>
                ))}
              </div>
            )}

            <div>
              <h1 className="text-3xl sm:text-5xl font-bold font-serif text-white leading-tight tracking-tight">
                {movie.title}
              </h1>
              {tagline && (
                <p className="text-slate-400 italic mt-2 text-lg font-serif">
                  "{tagline}"
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="font-semibold text-white">{formatRating(movie.vote_average)}</span>
                <span className="text-slate-500">/ 10</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {releaseYear(movie.release_date)}
              </span>
              {runtime && (
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {Math.floor(runtime / 60)}h {runtime % 60}m
                </span>
              )}
            </div>

            <p className="text-slate-300 text-sm leading-relaxed line-clamp-3 max-w-xl">
              {movie.overview}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to={`/movie/${movie.id}`}>
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Play size={18} fill="currentColor" />}
                >
                  View Details
                </Button>
              </Link>
              {isAuthenticated && (
                <Button
                  variant="outline"
                  size="lg"
                  icon={<Plus size={18} />}
                  onClick={() => openLogModal(movie.id, movie.title, movie.poster_path)}
                >
                  {logged ? 'Update Log' : 'Log Film'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
