import { API_BASE_URL } from '@/api/config';
import type { UserProfile } from '@/api/types/auth';
import type {
  FriendRequest as ApiFriendRequest,
  FriendUser,
} from '@/api/types/friends';
import type { ApiFeedActivity } from '@/api/types/feed';
import type { ApiMovie, ApiMovieDetail, ApiMovieLog } from '@/api/types/movies';
import type {
  DiaryEntry,
  Friend,
  FriendRequest,
  Movie,
  MovieDetail,
  FeedItem,
  User,
  SearchUserResult,
} from '@/types';
import { releaseYear } from '@/lib/utils';

function toId(value: string | number): string {
  return String(value);
}

export function emailLabel(email: string): string {
  const local = email.split('@')[0]?.trim();
  return local || email || 'User';
}

export function parseApiRating(rating: string | null | undefined): number | null {
  if (rating == null || rating === '') return null;
  const value = Number(rating);
  return Number.isFinite(value) ? value : null;
}

export function formatApiRating(rating: number | null | undefined): string | null | undefined {
  if (rating === undefined) return undefined;
  if (rating === null) return null;
  return String(rating);
}

function moviePosterPath(movie: ApiMovie): string | null {
  return movie.poster_path ?? movie.poster_url ?? null;
}

function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) {
    return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
  }
  return path;
}

export function mapUserProfile(profile: UserProfile): User {
  return {
    id: toId(profile.id),
    email: profile.email,
    bio: profile.bio ?? '',
    avatar: resolveMediaUrl(profile.profile_image),
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
    displayName: emailLabel(profile.email),
  };
}

/** @deprecated Use mapUserProfile */
export const mapApiUser = mapUserProfile;

export function mapFriendUser(user: FriendUser): User {
  return {
    id: toId(user.id),
    email: user.email,
    bio: user.bio ?? '',
    avatar: resolveMediaUrl(user.profile_image),
    createdAt: '',
    updatedAt: '',
    displayName: emailLabel(user.email),
  };
}

export function mapApiFriend(friend: FriendUser): Friend {
  const user = mapFriendUser(friend);
  return {
    id: user.id,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    displayName: user.displayName,
    recentActivity: null,
  };
}

export function mapApiFriendRequest(request: ApiFriendRequest): FriendRequest {
  return {
    id: toId(request.id),
    senderId: toId(request.sender.id),
    senderEmail: request.sender.email,
    senderDisplayName: emailLabel(request.sender.email),
    senderAvatar: resolveMediaUrl(request.sender.profile_image),
    receiverId: toId(request.receiver.id),
    receiverEmail: request.receiver.email,
    receiverDisplayName: emailLabel(request.receiver.email),
    receiverAvatar: resolveMediaUrl(request.receiver.profile_image),
    status: request.status,
    createdAt: request.created_at,
    updatedAt: request.updated_at,
  };
}

export function mapSearchUser(user: FriendUser): SearchUserResult {
  const mapped = mapFriendUser(user);
  return {
    id: mapped.id,
    email: mapped.email,
    bio: mapped.bio,
    avatar: mapped.avatar,
    displayName: mapped.displayName,
  };
}

export function mapApiMovie(movie: ApiMovie): Movie {
  const releaseDate = movie.release_date ?? '';
  return {
    id: movie.tmdb_id,
    title: movie.title,
    poster_path: moviePosterPath(movie),
    backdrop_path: null,
    release_date: releaseDate,
    vote_average: movie.vote_average,
    vote_count: 0,
    genre_ids: [],
    overview: movie.overview ?? '',
  };
}

export function mapApiMovieDetail(movie: ApiMovieDetail): MovieDetail {
  const base = mapApiMovie(movie);
  const genres = Array.isArray(movie.genres)
    ? movie.genres
        .map((genre, index) => {
          if (typeof genre === 'object' && genre !== null && 'name' in genre) {
            const name = String(genre.name);
            const id = 'id' in genre && typeof genre.id === 'number' ? genre.id : index + 1;
            return { id, name };
          }
          return null;
        })
        .filter((genre): genre is { id: number; name: string } => genre !== null)
    : [];

  return {
    ...base,
    genres,
    runtime: movie.runtime ?? 0,
    tagline: '',
    status: 'Released',
    credits: { cast: [], crew: [] },
  };
}

export function mapApiMovieLog(log: ApiMovieLog): DiaryEntry {
  const movie = log.movie;
  const poster = moviePosterPath(movie);
  const releaseDate = movie.release_date ?? '';

  return {
    id: toId(log.id),
    movieId: movie.tmdb_id,
    movieTitle: movie.title,
    moviePoster: poster,
    movieYear: releaseYear(releaseDate),
    watchedAt: log.watched_date,
    rating: parseApiRating(log.rating),
    review: log.review_text?.trim() ? log.review_text : null,
  };
}

export function mapApiFeedActivity(activity: ApiFeedActivity): FeedItem {
  const movie = activity.movie;
  const user = mapFriendUser(activity.user);
  const hasReview = Boolean(activity.review_text?.trim());

  return {
    id: toId(activity.id),
    type: hasReview ? 'review' : 'log',
    userId: user.id,
    userEmail: user.email,
    displayName: user.displayName,
    userAvatar: user.avatar,
    movieId: movie.tmdb_id,
    movieTitle: movie.title,
    moviePoster: moviePosterPath(movie),
    movieYear: releaseYear(movie.release_date ?? ''),
    rating: parseApiRating(activity.rating) ?? undefined,
    reviewText: activity.review_text?.trim() || undefined,
    createdAt: activity.created_at,
  };
}

export function mapDiaryEntryToUpdateRequest(
  updates: Partial<Pick<DiaryEntry, 'rating' | 'review' | 'watchedAt'>>
) {
  return {
    ...(updates.rating !== undefined ? { rating: formatApiRating(updates.rating) } : {}),
    ...(updates.review !== undefined ? { review_text: updates.review ?? '' } : {}),
    ...(updates.watchedAt !== undefined ? { watched_date: updates.watchedAt } : {}),
  };
}

export function mapDiaryEntryToCreateRequest(
  entry: Pick<DiaryEntry, 'movieId' | 'rating' | 'review' | 'watchedAt'>
) {
  return {
    tmdb_id: entry.movieId,
    rating: formatApiRating(entry.rating),
    review_text: entry.review ?? '',
    watched_date: entry.watchedAt,
  };
}
