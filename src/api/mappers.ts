import type { ApiUser } from '@/api/types/auth';
import type { ApiFriend, ApiFriendRequest, ApiMovieLogSummary } from '@/api/types/friends';
import type { ApiMovie, ApiMovieDetail, ApiMovieLog } from '@/api/types/movies';
import type {
  DiaryEntry,
  Friend,
  FriendRequest,
  Movie,
  MovieDetail,
  User,
} from '@/types';

function toId(value: string | number): string {
  return String(value);
}

export function mapApiUser(user: ApiUser): User {
  return {
    id: toId(user.id),
    username: user.username,
    displayName: user.display_name,
    email: user.email,
    bio: user.bio,
    avatar: user.profile_image,
    createdAt: user.date_joined,
    moviesWatched: user.movies_watched ?? 0,
  };
}

export function mapApiFriend(friend: ApiFriend): Friend {
  return {
    id: toId(friend.id),
    username: friend.username,
    displayName: friend.display_name,
    avatar: friend.profile_image,
    moviesWatched: friend.movies_watched ?? 0,
    recentActivity: friend.recent_activity
      ? mapApiMovieLog(friend.recent_activity)
      : null,
  };
}

export function mapApiFriendRequest(request: ApiFriendRequest): FriendRequest {
  return {
    id: toId(request.id),
    fromUserId: toId(request.from_user.id),
    fromUsername: request.from_user.username,
    fromDisplayName: request.from_user.display_name,
    fromAvatar: request.from_user.profile_image,
    toUserId: toId(request.to_user.id),
    status: request.status === 'declined' ? 'rejected' : request.status,
    createdAt: request.created_at,
  };
}

export function mapApiMovie(movie: ApiMovie): Movie {
  return {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    genre_ids: movie.genre_ids,
    overview: movie.overview,
  };
}

export function mapApiMovieDetail(movie: ApiMovieDetail): MovieDetail {
  return {
    ...mapApiMovie(movie),
    genres: movie.genres,
    runtime: movie.runtime,
    tagline: movie.tagline,
    status: movie.status,
    credits: movie.credits ?? { cast: [], crew: [] },
  };
}

export function mapApiMovieLog(log: ApiMovieLog | ApiMovieLogSummary): DiaryEntry {
  return {
    id: toId(log.id),
    movieId: log.tmdb_id,
    movieTitle: log.movie_title ?? 'Unknown title',
    moviePoster: log.movie_poster ?? null,
    movieYear: log.movie_year ?? '',
    watchedAt: log.watched_date,
    rating: log.rating ?? null,
    review: log.review ?? null,
    isPublic: 'is_public' in log ? (log.is_public ?? true) : true,
  };
}

export function mapDiaryEntryToUpdateRequest(
  updates: Partial<Pick<DiaryEntry, 'rating' | 'review' | 'watchedAt' | 'isPublic'>>
) {
  return {
    ...(updates.rating !== undefined ? { rating: updates.rating } : {}),
    ...(updates.review !== undefined ? { review: updates.review } : {}),
    ...(updates.watchedAt !== undefined ? { watched_date: updates.watchedAt } : {}),
    ...(updates.isPublic !== undefined ? { is_public: updates.isPublic } : {}),
  };
}

export function mapDiaryEntryToCreateRequest(
  entry: Pick<DiaryEntry, 'movieId' | 'rating' | 'review' | 'watchedAt' | 'isPublic'>
) {
  return {
    tmdb_id: entry.movieId,
    rating: entry.rating,
    review: entry.review,
    watched_date: entry.watchedAt,
    is_public: entry.isPublic,
  };
}
