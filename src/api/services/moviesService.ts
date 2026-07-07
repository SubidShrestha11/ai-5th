import { API_PATHS } from '@/api/config';
import { apiClient } from '@/api/client';
import {
  mapApiMovie,
  mapApiMovieDetail,
  mapApiMovieLog,
} from '@/api/mappers';
import type {
  ApiMovieDetail,
  ApiMovieLog,
  CreateMovieLogRequest,
  MovieSearchParams,
  PaginatedMovieLogsResponse,
  PaginatedMoviesResponse,
  UpdateMovieLogRequest,
} from '@/api/types/movies';
import type { DiaryEntry, Movie, MovieDetail } from '@/types';

export const moviesService = {
  async getPopular(page = 1): Promise<Movie[]> {
    const data = await apiClient.get<PaginatedMoviesResponse | Movie[]>(
      API_PATHS.movies.popular,
      { params: { page } }
    );
    const movies = Array.isArray(data) ? data : data.results;
    return movies.map(mapApiMovie);
  },

  async searchMovies(params: MovieSearchParams): Promise<Movie[]> {
    const data = await apiClient.get<PaginatedMoviesResponse | Movie[]>(
      API_PATHS.movies.search,
      { params: { q: params.q, page: params.page ?? 1 } }
    );
    const movies = Array.isArray(data) ? data : data.results;
    return movies.map(mapApiMovie);
  },

  async getMovieDetail(tmdbId: number): Promise<MovieDetail> {
    const data = await apiClient.get<ApiMovieDetail>(API_PATHS.movies.detail(tmdbId));
    return mapApiMovieDetail(data);
  },

  async listLogs(): Promise<DiaryEntry[]> {
    const data = await apiClient.get<PaginatedMovieLogsResponse | ApiMovieLog[]>(
      API_PATHS.movies.logs
    );
    const logs = Array.isArray(data) ? data : data.results;
    return logs.map(mapApiMovieLog);
  },

  async getLog(logId: string | number): Promise<DiaryEntry> {
    const data = await apiClient.get<ApiMovieLog>(API_PATHS.movies.log(logId));
    return mapApiMovieLog(data);
  },

  async createLog(payload: CreateMovieLogRequest): Promise<DiaryEntry> {
    const data = await apiClient.post<ApiMovieLog>(API_PATHS.movies.logs, payload);
    return mapApiMovieLog(data);
  },

  async updateLog(
    logId: string | number,
    payload: UpdateMovieLogRequest
  ): Promise<DiaryEntry> {
    const data = await apiClient.patch<ApiMovieLog>(
      API_PATHS.movies.log(logId),
      payload
    );
    return mapApiMovieLog(data);
  },

  async replaceLog(
    logId: string | number,
    payload: CreateMovieLogRequest
  ): Promise<DiaryEntry> {
    const data = await apiClient.put<ApiMovieLog>(
      API_PATHS.movies.log(logId),
      payload
    );
    return mapApiMovieLog(data);
  },

  async deleteLog(logId: string | number): Promise<void> {
    await apiClient.delete(API_PATHS.movies.log(logId));
  },
};
