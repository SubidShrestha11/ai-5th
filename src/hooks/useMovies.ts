import { useState, useEffect, useCallback } from 'react';
import type { Movie, MovieDetail } from '@/types';
import { moviesService } from '@/api/services/moviesService';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/api/errors';

interface UseMoviesResult {
  movies: Movie[];
  loading: boolean;
  error: string | null;
}

function useMoviesQuery(fetcher: () => Promise<Movie[]>): UseMoviesResult {
  const isInitialized = useAuthStore(state => state.isInitialized);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      setLoading(true);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);
    fetcher()
      .then(results => {
        if (!cancelled) setMovies(results);
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
  }, [isInitialized, isAuthenticated, fetcher]);

  return { movies, loading, error };
}

export function useTrending(): UseMoviesResult {
  const fetcher = useCallback(() => moviesService.getPopular(1), []);
  return useMoviesQuery(fetcher);
}

export function usePopular(): UseMoviesResult {
  const fetcher = useCallback(() => moviesService.getPopular(1), []);
  return useMoviesQuery(fetcher);
}

export function useTopRated(): UseMoviesResult {
  const fetcher = useCallback(
    () =>
      moviesService.getPopular(1).then(results =>
        [...results].sort((a, b) => b.vote_average - a.vote_average).slice(0, 10)
      ),
    []
  );
  return useMoviesQuery(fetcher);
}

export function useMovieDetail(movieId: number | null): {
  movie: MovieDetail | null;
  loading: boolean;
  error: string | null;
} {
  const isInitialized = useAuthStore(state => state.isInitialized);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId || !isInitialized) {
      setMovie(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);
    moviesService
      .getMovieDetail(movieId)
      .then(result => {
        if (!cancelled) setMovie(result);
      })
      .catch(err => {
        if (!cancelled) {
          setMovie(null);
          setError(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [movieId, isInitialized, isAuthenticated]);

  return { movie, loading, error };
}

export function useRecommendations(movieId: number | null): UseMoviesResult {
  const isInitialized = useAuthStore(state => state.isInitialized);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecs = useCallback(() => {
    if (!movieId || !isInitialized) {
      setMovies([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    moviesService
      .getPopular(1)
      .then(results => results.filter(movie => movie.id !== movieId).slice(0, 6))
      .then(setMovies)
      .catch(err => {
        setMovies([]);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, [movieId, isInitialized, isAuthenticated]);

  useEffect(() => {
    fetchRecs();
  }, [fetchRecs]);

  return { movies, loading, error };
}
