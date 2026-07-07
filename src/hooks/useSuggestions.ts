import { useState, useEffect } from 'react';
import type { Movie } from '@/types';
import { MOCK_MOVIES } from '@/lib/mockData';
import { useMovieStore } from '@/store/movieStore';

export function useSuggestions(): { movies: Movie[]; loading: boolean } {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const { diary, favorites } = useMovieStore();

  useEffect(() => {
    const loggedIds = new Set([
      ...diary.map(e => e.movieId),
      ...favorites,
    ]);

    setMovies(getFallbackSuggestions(loggedIds));
    setLoading(false);
  }, [diary, favorites]);

  return { movies, loading };
}

function getFallbackSuggestions(loggedIds: Set<number>): Movie[] {
  return [...MOCK_MOVIES]
    .filter(m => !loggedIds.has(m.id))
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 10);
}
