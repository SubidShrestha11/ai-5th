import { API_PATHS } from '@/api/config';
import { apiClient } from '@/api/client';
import {
  mapApiMovie,
  mapApiMovieDetail,
  mapApiMovieLog,
  mapDiaryEntryToCreateRequest,
  mapDiaryEntryToUpdateRequest,
} from '@/api/mappers';
import type {
  ApiMovieDetail,
  ApiMovieLog,
  MovieSearchParams,
  PaginatedMovieLogsResponse,
  TMDBBrowseResponse,
  TMDBPaginatedResponse,
} from '@/api/types/movies';
import type { DiaryEntry, Movie, MovieDetail } from '@/types';

async function browseMovies(params: MovieSearchParams = {}): Promise<TMDBBrowseResponse> {
  return apiClient.get<TMDBBrowseResponse>(API_PATHS.movies.search, {
    params: {
      q: params.q,
      page: params.page ?? 1,
    },
  });
}

export const moviesService = {
  async getPopular(page = 1): Promise<Movie[]> {
    const data = await apiClient.get<TMDBPaginatedResponse>(API_PATHS.movies.popular, {
      params: { page },
    });
    return data.results.map(mapApiMovie);
  },

  async searchMovies(params: MovieSearchParams): Promise<{
    movies: Movie[];
    status: TMDBBrowseResponse['status'];
  }> {
    const data = await browseMovies(params);
    return {
      movies: data.results.map(mapApiMovie),
      status: data.status,
    };
  },

  async browseMovies(params: MovieSearchParams = {}): Promise<TMDBBrowseResponse> {
    return browseMovies(params);
  },

  async getMovieDetail(tmdbId: number): Promise<MovieDetail> {
    const data = await apiClient.get<ApiMovieDetail>(API_PATHS.movies.detail(tmdbId));
    return mapApiMovieDetail(data);
  },

  async listLogs(): Promise<DiaryEntry[]> {
    const entries: DiaryEntry[] = [];
    let page = 1;

    while (true) {
      const data = await apiClient.get<PaginatedMovieLogsResponse>(API_PATHS.movies.logs, {
        params: { page },
      });
      entries.push(...data.results.map(mapApiMovieLog));
      if (!data.next) break;
      page += 1;
    }

    return entries;
  },

  async getLog(logId: string): Promise<DiaryEntry> {
    const data = await apiClient.get<ApiMovieLog>(API_PATHS.movies.log(logId));
    return mapApiMovieLog(data);
  },

  async createLog(
    entry: Pick<DiaryEntry, 'movieId' | 'rating' | 'review' | 'watchedAt'>
  ): Promise<DiaryEntry> {
    const data = await apiClient.post<ApiMovieLog>(
      API_PATHS.movies.logs,
      mapDiaryEntryToCreateRequest(entry)
    );
    return mapApiMovieLog(data);
  },

  async updateLog(
    logId: string,
    updates: Partial<Pick<DiaryEntry, 'rating' | 'review' | 'watchedAt'>>
  ): Promise<DiaryEntry> {
    const data = await apiClient.patch<ApiMovieLog>(
      API_PATHS.movies.log(logId),
      mapDiaryEntryToUpdateRequest(updates)
    );
    return mapApiMovieLog(data);
  },

  async deleteLog(logId: string): Promise<void> {
    await apiClient.delete(API_PATHS.movies.log(logId));
  },
};
