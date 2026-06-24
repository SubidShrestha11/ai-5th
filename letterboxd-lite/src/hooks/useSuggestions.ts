import { useState, useEffect } from 'react';
import type { Movie } from '@/types';
import { tmdbApi } from '@/lib/api/tmdb';
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

    const genreCount: Record<number, number> = {};
    diary.forEach(entry => {
      const movie = MOCK_MOVIES.find(m => m.id === entry.movieId);
      if (movie) {
        movie.genre_ids.forEach(g => {
          genreCount[g] = (genreCount[g] ?? 0) + 1;
        });
      }
    });

    const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0];

    if (topGenre && tmdbApi.hasApiKey()) {
      tmdbApi
        .discoverByGenre(Number(topGenre[0]))
        .then(results => {
          setMovies(results.filter(m => !loggedIds.has(m.id)).slice(0, 10));
        })
        .catch(() => {
          setMovies(getFallbackSuggestions(loggedIds));
        })
        .finally(() => setLoading(false));
    } else {
      setMovies(getFallbackSuggestions(loggedIds));
      setLoading(false);
    }
  }, [diary, favorites]);

  return { movies, loading };
}

function getFallbackSuggestions(loggedIds: Set<number>): Movie[] {
  return [...MOCK_MOVIES]
    .filter(m => !loggedIds.has(m.id))
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 10);
}
