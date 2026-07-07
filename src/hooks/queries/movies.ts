import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moviesService } from '@/api/services/moviesService';
import { mapDiaryEntryToCreateRequest, mapDiaryEntryToUpdateRequest } from '@/api/mappers';
import { queryKeys } from '@/api/queryKeys';
import { getErrorMessage } from '@/api/errors';
import type { DiaryEntry } from '@/types';

/** Example: popular movies from backend TMDB proxy */
export function usePopularMovies(page = 1) {
  return useQuery({
    queryKey: queryKeys.movies.popular(page),
    queryFn: () => moviesService.getPopular(page),
  });
}

/** Example: search movies */
export function useSearchMovies(query: string, enabled = query.length >= 2) {
  return useQuery({
    queryKey: queryKeys.movies.search(query),
    queryFn: () => moviesService.searchMovies({ q: query }),
    enabled,
  });
}

/** Example: movie detail by TMDB id */
export function useMovieDetails(tmdbId: number | null) {
  return useQuery({
    queryKey: queryKeys.movies.detail(tmdbId ?? 0),
    queryFn: () => moviesService.getMovieDetail(tmdbId as number),
    enabled: tmdbId !== null,
  });
}

/** Example: list your movie logs */
export function useMovieLogs(enabled = true) {
  return useQuery({
    queryKey: queryKeys.movies.logs(),
    queryFn: () => moviesService.listLogs(),
    enabled,
  });
}

/** Example: create movie log */
export function useCreateMovieLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      entry: Pick<DiaryEntry, 'movieId' | 'rating' | 'review' | 'watchedAt' | 'isPublic'>
    ) => moviesService.createLog(mapDiaryEntryToCreateRequest(entry)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.movies.logs() });
    },
  });
}

/** Example: update movie log with optimistic UI */
export function useUpdateMovieLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      logId,
      updates,
    }: {
      logId: string;
      updates: Partial<Pick<DiaryEntry, 'rating' | 'review' | 'watchedAt' | 'isPublic'>>;
    }) => moviesService.updateLog(logId, mapDiaryEntryToUpdateRequest(updates)),
    onMutate: async ({ logId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.movies.logs() });

      const previousLogs = queryClient.getQueryData<DiaryEntry[]>(queryKeys.movies.logs());

      queryClient.setQueryData<DiaryEntry[]>(queryKeys.movies.logs(), current =>
        current?.map(log => (log.id === logId ? { ...log, ...updates } : log)) ?? []
      );

      return { previousLogs };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(queryKeys.movies.logs(), context.previousLogs);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.movies.logs() });
      queryClient.invalidateQueries({ queryKey: queryKeys.movies.log(variables.logId) });
    },
    meta: {
      errorMessage: (error: unknown) => getErrorMessage(error),
    },
  });
}

/** Example: delete movie log with optimistic UI */
export function useDeleteMovieLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logId: string) => moviesService.deleteLog(logId),
    onMutate: async logId => {
      await queryClient.cancelQueries({ queryKey: queryKeys.movies.logs() });
      const previousLogs = queryClient.getQueryData<DiaryEntry[]>(queryKeys.movies.logs());

      queryClient.setQueryData<DiaryEntry[]>(
        queryKeys.movies.logs(),
        current => current?.filter(log => log.id !== logId) ?? []
      );

      return { previousLogs };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(queryKeys.movies.logs(), context.previousLogs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.movies.logs() });
    },
  });
}
