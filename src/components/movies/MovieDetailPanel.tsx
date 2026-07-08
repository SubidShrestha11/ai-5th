import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Calendar, Plus, ExternalLink } from 'lucide-react';
import type { MovieDetail } from '@/types';
import { backdropUrl, posterUrl, releaseYear, formatRuntime } from '@/lib/utils';
import { Badge, Button, Avatar } from '@/components/ui';
import { profileUrl } from '@/lib/utils';
import { useLoggedMovies } from '@/hooks/useLoggedMovies';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

interface MovieDetailPanelProps {
  movie: MovieDetail;
}

export function MovieDetailPanel({ movie }: MovieDetailPanelProps) {
  const [tab, setTab] = useState<'cast' | 'crew'>('cast');
  const [imgError, setImgError] = useState(false);

  const { isLogged } = useLoggedMovies();
  const { openLogModal } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  const backdrop = backdropUrl(movie.backdrop_path);
  const poster = posterUrl(movie.poster_path, 'w500');
  const year = releaseYear(movie.release_date);
  const logged = isLogged(movie.id);
  const director = movie.credits.crew.find(c => c.job === 'Director');

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-[#101827] min-h-64">
        {backdrop && !imgError && (
          <img
            src={backdrop}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            onError={() => setImgError(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070B12]/95 via-[#070B12]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B12]/60 to-transparent" />

        <div className="relative z-10 p-6 sm:p-10 flex gap-6 sm:gap-8">
          {/* Poster */}
          <div className="hidden sm:block shrink-0 w-36 lg:w-44">
            {poster ? (
              <img
                src={poster}
                alt={movie.title}
                className="w-full aspect-[2/3] rounded-xl object-cover ring-2 ring-white/15 shadow-2xl"
              />
            ) : (
              <div className="w-full aspect-[2/3] rounded-xl bg-[#162032] ring-1 ring-white/10" />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4 justify-end py-4">
            <div className="flex flex-wrap gap-2">
              {movie.genres.map(g => (
                <Badge key={g.id} variant="glass" size="sm">{g.name}</Badge>
              ))}
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white leading-tight">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-slate-400 italic mt-1.5 font-serif">"{movie.tagline}"</p>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="font-semibold text-white">{movie.vote_average.toFixed(1)}</span>
                <span>/ 10</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> {year}
              </span>
              {movie.runtime > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock size={14} /> {formatRuntime(movie.runtime)}
                </span>
              )}
              {director && (
                <span className="text-slate-400">
                  Dir. <span className="text-slate-200">{director.name}</span>
                </span>
              )}
            </div>

            {isAuthenticated && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={logged ? 'secondary' : 'primary'}
                  size="sm"
                  icon={<Plus size={14} />}
                  onClick={() => openLogModal(movie.id, movie.title, movie.poster_path)}
                >
                  {logged ? 'Update Log' : 'Log Film'}
                </Button>
                <a
                  href={`https://www.themoviedb.org/movie/${movie.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                >
                  <ExternalLink size={12} /> TMDB
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overview */}
      {movie.overview && (
        <div className="bg-[#101827] rounded-xl p-6 border border-white/8">
          <h2 className="text-base font-semibold text-white mb-3 font-serif">Synopsis</h2>
          <p className="text-slate-300 leading-relaxed">{movie.overview}</p>
        </div>
      )}

      {/* Cast & Crew */}
      {(movie.credits.cast.length > 0 || movie.credits.crew.length > 0) && (
        <div className="space-y-4">
          {/* Tab toggle */}
          <div className="flex gap-1 bg-[#101827] border border-white/8 rounded-lg p-1 w-fit">
            {(['cast', 'crew'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all duration-200 cursor-pointer ${
                  tab === t
                    ? 'bg-[#162032] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {tab === 'cast'
              ? movie.credits.cast.slice(0, 12).map(person => (
                  <div
                    key={person.id}
                    className="shrink-0 w-24 flex flex-col items-center gap-2 text-center"
                  >
                    <Avatar
                      src={profileUrl(person.profile_path)}
                      name={person.name}
                      size="lg"
                    />
                    <div>
                      <p className="text-xs font-medium text-slate-200 leading-tight line-clamp-2">
                        {person.name}
                      </p>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                        {person.character}
                      </p>
                    </div>
                  </div>
                ))
              : movie.credits.crew
                  .filter(c => ['Director', 'Screenplay', 'Director of Photography', 'Original Music Composer', 'Producer'].includes(c.job))
                  .map(person => (
                    <div
                      key={`${person.id}-${person.job}`}
                      className="shrink-0 w-24 flex flex-col items-center gap-2 text-center"
                    >
                      <Avatar name={person.name} size="lg" />
                      <div>
                        <p className="text-xs font-medium text-slate-200 leading-tight line-clamp-2">
                          {person.name}
                        </p>
                        <p className="text-[10px] text-sky-400 line-clamp-1 mt-0.5">{person.job}</p>
                      </div>
                    </div>
                  ))}
          </div>
        </div>
      )}

      {/* TMDB link for non-auth users */}
      {!isAuthenticated && (
        <div className="bg-[#101827] rounded-xl p-6 border border-white/8 flex items-center gap-4">
          <div className="flex-1">
            <p className="font-medium text-white">Want to log this film?</p>
            <p className="text-sm text-slate-400 mt-0.5">Create a free account to track your cinema journey.</p>
          </div>
          <Link to="/">
            <Button variant="primary" size="sm">Join free</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
