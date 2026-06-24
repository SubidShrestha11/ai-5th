import { useState, useEffect, useRef } from 'react';
import type { Movie, User } from '@/types';
import { tmdbApi } from '@/lib/api/tmdb';
import { MOCK_MOVIES, MOCK_USERS } from '@/lib/mockData';

interface UseSearchResult {
  movies: Movie[];
  users: User[];
  loading: boolean;
  query: string;
  setQuery: (q: string) => void;
  clear: () => void;
}

function searchMock(query: string): { movies: Movie[]; users: User[] } {
  const q = query.toLowerCase();
  const movies = MOCK_MOVIES.filter(m =>
    m.title.toLowerCase().includes(q) || m.overview.toLowerCase().includes(q)
  );
  const users = MOCK_USERS.filter(
    u =>
      u.username.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q)
  );
  return { movies, users };
}

export function useSearch(): UseSearchResult {
  const [query, setQueryState] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setMovies([]);
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      tmdbApi
        .searchMovies(query)
        .then(results => {
          setMovies(results.slice(0, 12));
          setUsers([]);
        })
        .catch(() => {
          const { movies: m, users: u } = searchMock(query);
          setMovies(m);
          setUsers(u);
        })
        .finally(() => setLoading(false));
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const setQuery = (q: string) => setQueryState(q);
  const clear = () => {
    setQueryState('');
    setMovies([]);
    setUsers([]);
  };

  return { movies, users, loading, query, setQuery, clear };
}
