import { useState, useEffect } from 'react';
import type { Movie } from '@/types';
import { moviesService } from '@/api/services/moviesService';
import { useLoggedMovies } from '@/hooks/useLoggedMovies';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/api/errors';

export function useSuggestions(): {
  movies: Movie[];
  loading: boolean;
  error: string | null;
} {
  const { isAuthenticated } = useAuthStore();
  const isInitialized = useAuthStore(state => state.isInitialized);
  const { logs } = useLoggedMovies();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      setLoading(true);
      return;
    }

    if (!isAuthenticated) {
      setMovies([]);
      setLoading(false);
      setError(null);
      return;
    }

    const loggedIds = new Set(logs.map(log => log.movieId));

    let cancelled = false;

    setLoading(true);
    setError(null);
    moviesService
      .getPopular(1)
      .then(results =>
        results.filter(movie => !loggedIds.has(movie.id)).slice(0, 10)
      )
      .then(nextMovies => {
        if (!cancelled) setMovies(nextMovies);
      })
      .catch(err => {
        if (!cancelled) {
          setMovies([]);
          setError(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isInitialized, logs]);

  return { movies, loading, error };
}
