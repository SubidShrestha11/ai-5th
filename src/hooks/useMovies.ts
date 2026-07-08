import { useState, useEffect, useCallback } from 'react';
import type { Movie, MovieDetail } from '@/types';
import { moviesService } from '@/api/services/moviesService';
import { getErrorMessage } from '@/api/errors';

interface UseMoviesResult {
  movies: Movie[];
  loading: boolean;
  error: string | null;
}

export function useTrending(): UseMoviesResult {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    moviesService
      .getPopular(1)
      .then(setMovies)
      .catch(err => {
        setMovies([]);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, []);

  return { movies, loading, error };
}

export function usePopular(): UseMoviesResult {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    moviesService
      .getPopular(1)
      .then(setMovies)
      .catch(err => {
        setMovies([]);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, []);

  return { movies, loading, error };
}

export function useTopRated(): UseMoviesResult {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    moviesService
      .getPopular(1)
      .then(results =>
        [...results].sort((a, b) => b.vote_average - a.vote_average).slice(0, 10)
      )
      .then(setMovies)
      .catch(err => {
        setMovies([]);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, []);

  return { movies, loading, error };
}

export function useMovieDetail(movieId: number | null): {
  movie: MovieDetail | null;
  loading: boolean;
  error: string | null;
} {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) return;
    setLoading(true);
    setError(null);
    moviesService
      .getMovieDetail(movieId)
      .then(setMovie)
      .catch(err => {
        setMovie(null);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, [movieId]);

  return { movie, loading, error };
}

export function useRecommendations(movieId: number | null): UseMoviesResult {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecs = useCallback(() => {
    if (!movieId) return;
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
  }, [movieId]);

  useEffect(() => {
    fetchRecs();
  }, [fetchRecs]);

  return { movies, loading, error };
}
