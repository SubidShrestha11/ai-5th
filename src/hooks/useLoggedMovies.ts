import { useMemo } from 'react';
import { useMovieLogs } from '@/hooks/queries/movies';
import { useAuthStore } from '@/store/authStore';

export function useLoggedMovies() {
  const { isAuthenticated } = useAuthStore();
  const { data: logs = [], isLoading } = useMovieLogs(isAuthenticated);

  const loggedMovieIds = useMemo(
    () => new Set(logs.map(log => log.movieId)),
    [logs]
  );

  return {
    logs,
    isLoading,
    isLogged: (movieId: number) => loggedMovieIds.has(movieId),
    getLogForMovie: (movieId: number) => logs.find(log => log.movieId === movieId),
  };
}
