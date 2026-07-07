export interface ApiFriend {
  id: string | number;
  username: string;
  display_name: string;
  profile_image: string | null;
  movies_watched?: number;
  recent_activity?: ApiMovieLogSummary | null;
}

export interface ApiFriendRequestUser {
  id: string | number;
  username: string;
  display_name: string;
  profile_image: string | null;
}

export interface ApiFriendRequest {
  id: string | number;
  from_user: ApiFriendRequestUser;
  to_user: ApiFriendRequestUser;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface SendFriendRequestBody {
  user_id: string | number;
}

export interface RespondToFriendRequestBody {
  status: 'accepted' | 'declined';
}

export interface ApiMovieLogSummary {
  id: string | number;
  tmdb_id: number;
  movie_title?: string;
  movie_poster?: string | null;
  movie_year?: string;
  rating?: number | null;
  review?: string | null;
  watched_date: string;
}
