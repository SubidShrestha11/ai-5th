import { useState, useEffect, useRef, useCallback } from 'react';
import type { Movie } from '@/types';
import { moviesService } from '@/api/services/moviesService';
import { getErrorMessage } from '@/api/errors';

interface UseSearchResult {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  query: string;
  setQuery: (q: string) => void;
  clear: () => void;
}

async function fetchSearchMovies(query: string): Promise<Movie[]> {
  let result = await moviesService.searchMovies({ q: query });
  let attempts = 0;

  while (result.status === 'pending' && attempts < 5) {
    await new Promise(resolve => setTimeout(resolve, 800));
    result = await moviesService.searchMovies({ q: query });
    attempts += 1;
  }

  return result.movies;
}

export function useSearch(): UseSearchResult {
  const [query, setQueryState] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setMovies([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSearchMovies(query)
        .then(results => setMovies(results.slice(0, 12)))
        .catch(err => {
          setMovies([]);
          setError(getErrorMessage(err));
        })
        .finally(() => setLoading(false));
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const setQuery = useCallback((q: string) => setQueryState(q), []);
  const clear = useCallback(() => {
    setQueryState('');
    setMovies([]);
    setError(null);
  }, []);

  return { movies, loading, error, query, setQuery, clear };
}
