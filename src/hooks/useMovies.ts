import { useState, useEffect, useCallback } from 'react';
import type { Movie, MovieDetail } from '@/types';
import { moviesService } from '@/api/services/moviesService';
import { MOCK_MOVIES, MOCK_MOVIE_DETAIL } from '@/lib/mockData';

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
    moviesService
      .getPopular()
      .then(setMovies)
      .catch(() => {
        setMovies(MOCK_MOVIES.slice(0, 10));
        setError(null);
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
    moviesService
      .getPopular()
      .then(setMovies)
      .catch(() => {
        setMovies([...MOCK_MOVIES].sort((a, b) => b.vote_count - a.vote_count).slice(0, 10));
        setError(null);
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
    setMovies([...MOCK_MOVIES].sort((a, b) => b.vote_average - a.vote_average).slice(0, 10));
    setLoading(false);
    setError(null);
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
      .catch(() => {
        if (movieId === MOCK_MOVIE_DETAIL.id) {
          setMovie(MOCK_MOVIE_DETAIL);
        } else {
          const found = MOCK_MOVIES.find(m => m.id === movieId);
          if (found) {
            setMovie({
              ...found,
              genres: found.genre_ids.map(id => ({ id, name: String(id) })),
              runtime: 120,
              tagline: '',
              status: 'Released',
              credits: { cast: [], crew: [] },
            });
          } else {
            setError('Movie not found');
          }
        }
      })
      .finally(() => setLoading(false));
  }, [movieId]);

  return { movie, loading, error };
}

export function useMoviesByIds(ids: number[]): Movie[] {
  return MOCK_MOVIES.filter(m => ids.includes(m.id));
}

export function useRecommendations(movieId: number | null): UseMoviesResult {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecs = useCallback(() => {
    if (!movieId) return;
    setLoading(true);
    const base = MOCK_MOVIES.find(m => m.id === movieId);
    if (base) {
      setMovies(
        MOCK_MOVIES.filter(
          m => m.id !== movieId && m.genre_ids.some(g => base.genre_ids.includes(g))
        ).slice(0, 6)
      );
    }
    setError(null);
    setLoading(false);
  }, [movieId]);

  useEffect(() => {
    fetchRecs();
  }, [fetchRecs]);

  return { movies, loading, error };
}
