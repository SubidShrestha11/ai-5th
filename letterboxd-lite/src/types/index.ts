export interface Movie {
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

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface MovieDetail {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genres: Genre[];
  overview: string;
  runtime: number;
  tagline: string;
  status: string;
  credits: {
    cast: CastMember[];
    crew: CrewMember[];
  };
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string | null;
  avatar: string | null;
  createdAt: string;
  moviesWatched: number;
}

export interface DiaryEntry {
  id: string;
  movieId: number;
  movieTitle: string;
  moviePoster: string | null;
  movieYear: string;
  watchedAt: string;
  rating: number | null;
  review: string | null;
  isPublic: boolean;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromDisplayName: string;
  fromAvatar: string | null;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  moviesWatched: number;
  recentActivity: DiaryEntry | null;
}

export type FeedItemType = 'review' | 'log' | 'friend_added';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  userId: string;
  username: string;
  displayName: string;
  userAvatar: string | null;
  movieId?: number;
  movieTitle?: string;
  moviePoster?: string | null;
  movieYear?: string;
  rating?: number;
  reviewText?: string;
  friendUsername?: string;
  createdAt: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface AuthModalState {
  open: boolean;
  mode: 'login' | 'register';
}

export interface SearchResults {
  movies: Movie[];
  users: User[];
}
