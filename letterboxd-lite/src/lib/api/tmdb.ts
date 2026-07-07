import type { Movie, MovieDetail } from '@/types';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
const BASE_URL = 'https://api.themoviedb.org/3';

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  if (!API_KEY) throw new Error('TMDB_NO_KEY');
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json() as Promise<T>;
}

export const tmdbApi = {
  hasApiKey: () => !!API_KEY,

  getTrending: () =>
    fetchTMDB<{ results: Movie[] }>('/trending/movie/week').then(r => r.results),

  getPopular: () =>
    fetchTMDB<{ results: Movie[] }>('/movie/popular').then(r => r.results),

  getNowPlaying: () =>
    fetchTMDB<{ results: Movie[] }>('/movie/now_playing').then(r => r.results),

  getTopRated: () =>
    fetchTMDB<{ results: Movie[] }>('/movie/top_rated').then(r => r.results),

  searchMovies: (query: string) =>
    fetchTMDB<{ results: Movie[] }>('/search/movie', {
      query,
      include_adult: 'false',
    }).then(r => r.results),

  getMovieDetail: (id: number) =>
    fetchTMDB<MovieDetail>(`/movie/${id}`, { append_to_response: 'credits' }),

  discoverByGenre: (genreId: number) =>
    fetchTMDB<{ results: Movie[] }>('/discover/movie', {
      with_genres: String(genreId),
      sort_by: 'vote_average.desc',
      'vote_count.gte': '200',
    }).then(r => r.results),

  getRecommendations: (movieId: number) =>
    fetchTMDB<{ results: Movie[] }>(`/movie/${movieId}/recommendations`).then(r => r.results),

  searchUsers: (_query: string): Promise<[]> => Promise.resolve([]),
};
