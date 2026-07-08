import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mapApiMovie } from '@/api/mappers';
import { moviesService } from '@/api/services/moviesService';
import { queryKeys } from '@/api/queryKeys';
import { getErrorMessage } from '@/api/errors';
import type { DiaryEntry, Movie } from '@/types';

async function fetchBrowseMovies(page = 1): Promise<Movie[]> {
  let data = await moviesService.browseMovies({ page });
  let attempts = 0;

  while (data.status === 'pending' && attempts < 5) {
    await new Promise(resolve => setTimeout(resolve, 800));
    data = await moviesService.browseMovies({ page });
    attempts += 1;
  }

  return data.results.map(mapApiMovie);
}

async function fetchSearchMovies(query: string, page = 1): Promise<Movie[]> {
  let result = await moviesService.searchMovies({ q: query, page });
  let attempts = 0;

  while (result.status === 'pending' && attempts < 5) {
    await new Promise(resolve => setTimeout(resolve, 800));
    result = await moviesService.searchMovies({ q: query, page });
    attempts += 1;
  }

  return result.movies;
}

export function usePopularMovies(page = 1) {
  return useQuery({
    queryKey: queryKeys.movies.popular(page),
    queryFn: () => moviesService.getPopular(page),
  });
}

export function useSearchMovies(query: string, enabled = query.trim().length > 0, page = 1) {
  return useQuery({
    queryKey: queryKeys.movies.search(query, page),
    queryFn: () => fetchSearchMovies(query, page),
    enabled,
  });
}

export function useBrowseMovies(page = 1, enabled = true) {
  return useQuery({
    queryKey: queryKeys.movies.browse(page),
    queryFn: () => fetchBrowseMovies(page),
    enabled,
  });
}

export function useMovieDetails(tmdbId: number | null) {
  return useQuery({
    queryKey: queryKeys.movies.detail(tmdbId ?? 0),
    queryFn: () => moviesService.getMovieDetail(tmdbId as number),
    enabled: tmdbId !== null,
  });
}

export function useMovieLogs(enabled = true) {
  return useQuery({
    queryKey: queryKeys.movies.logs(),
    queryFn: () => moviesService.listLogs(),
    enabled,
  });
}

export function useMovieLog(logId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.movies.log(logId ?? ''),
    queryFn: () => moviesService.getLog(logId as string),
    enabled: enabled && Boolean(logId),
  });
}

export function useCreateMovieLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      entry: Pick<DiaryEntry, 'movieId' | 'rating' | 'review' | 'watchedAt'>
    ) => moviesService.createLog(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.movies.logs() });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
    },
  });
}

export function useUpdateMovieLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      logId,
      updates,
    }: {
      logId: string;
      updates: Partial<Pick<DiaryEntry, 'rating' | 'review' | 'watchedAt'>>;
    }) => moviesService.updateLog(logId, updates),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
    },
    meta: {
      errorMessage: (error: unknown) => getErrorMessage(error),
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
    },
  });
}
