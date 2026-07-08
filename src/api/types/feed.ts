import type { ApiMovie } from '@/api/types/movies';
import type { FriendUser } from '@/api/types/friends';

export interface ApiFeedActivity {
  id: string;
  user: FriendUser;
  movie: ApiMovie;
  watched_date: string;
  rating: string | null;
  review_text: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedFeedActivityList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiFeedActivity[];
}
