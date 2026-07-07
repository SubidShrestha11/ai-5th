import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { MovieDetailPanel } from '@/components/movies/MovieDetailPanel';
import { MovieCarousel } from '@/components/movies/MovieCarousel';
import { FullPageSpinner } from '@/components/ui';
import { useMovieDetail, useRecommendations } from '@/hooks/useMovies';

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = id ? Number(id) : null;

  const { movie, loading, error } = useMovieDetail(movieId);
  const { movies: recommendations, loading: recsLoading } = useRecommendations(movieId);

  return (
    <div className="space-y-10">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Discover
      </Link>

      {loading && <FullPageSpinner />}

      {error && (
        <div className="text-center py-20">
          <p className="text-slate-400">{error}</p>
          <Link to="/" className="text-sky-400 hover:text-sky-300 mt-3 inline-block">
            Return home
          </Link>
        </div>
      )}

      {movie && !loading && (
        <>
          <MovieDetailPanel movie={movie} />

          {/* Recommendations */}
          {(recommendations.length > 0 || recsLoading) && (
            <MovieCarousel
              title="You Might Also Like"
              subtitle="Films similar to this one"
              movies={recommendations}
              loading={recsLoading}
              cardSize="md"
            />
          )}
        </>
      )}
    </div>
  );
}
