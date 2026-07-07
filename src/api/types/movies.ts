export interface ApiMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  overview: string;
}

export interface ApiGenre {
  id: number;
  name: string;
}

export interface ApiCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface ApiCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface ApiMovieDetail extends ApiMovie {
  genres: ApiGenre[];
  runtime: number;
  tagline: string;
  status: string;
  credits?: {
    cast: ApiCastMember[];
    crew: ApiCrewMember[];
  };
}

export interface ApiMovieLog {
  id: string | number;
  tmdb_id: number;
  movie_title?: string;
  movie_poster?: string | null;
  movie_year?: string;
  rating: number | null;
  review: string | null;
  watched_date: string;
  is_public?: boolean;
}

export interface CreateMovieLogRequest {
  tmdb_id: number;
  rating?: number | null;
  review?: string | null;
  watched_date: string;
  is_public?: boolean;
}

export interface UpdateMovieLogRequest {
  rating?: number | null;
  review?: string | null;
  watched_date?: string;
  is_public?: boolean;
}

export interface MovieSearchParams {
  q: string;
  page?: number;
}

export interface PaginatedMoviesResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: ApiMovie[];
}

export interface PaginatedMovieLogsResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: ApiMovieLog[];
}
