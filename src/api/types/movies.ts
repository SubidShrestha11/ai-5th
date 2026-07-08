export interface ApiMovie {
  tmdb_id: number;
  title: string;
  overview?: string;
  poster_path?: string | null;
  poster_url?: string | null;
  release_date?: string | null;
  vote_average: number;
  runtime?: number | null;
  genres?: unknown;
}

export interface ApiMovieDetail extends ApiMovie {
  genres?: Array<{ id?: number; name?: string } | Record<string, unknown>>;
}

export interface ApiMovieLog {
  id: string;
  movie: ApiMovie;
  watched_date: string;
  rating?: string | null;
  review_text?: string;
  created_at: string;
  updated_at: string;
}

export interface MovieLogCreateRequest {
  tmdb_id: number;
  watched_date: string;
  rating?: string | null;
  review_text?: string;
}

export interface MovieLogUpdateRequest {
  watched_date?: string;
  rating?: string | null;
  review_text?: string;
}

export interface MovieSearchParams {
  q?: string;
  page?: number;
}

export interface TMDBMovie extends ApiMovie {}

export interface TMDBPaginatedResponse {
  page: number;
  total_pages: number;
  total_results: number;
  next?: string | null;
  previous?: string | null;
  results: TMDBMovie[];
}

export interface TMDBBrowseResponse extends TMDBPaginatedResponse {
  status: 'ready' | 'pending';
}

export interface PaginatedMovieLogsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiMovieLog[];
}
