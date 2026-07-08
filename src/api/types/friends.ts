export interface FriendUser {
  id: string;
  email: string;
  bio: string;
  profile_image: string | null;
}

export interface FriendRequest {
  id: string;
  sender: FriendUser;
  receiver: FriendUser;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface FriendRequestCreateRequest {
  receiver_id: string;
}

export interface FriendRequestActionRequest {
  action: 'accept' | 'decline';
}

export interface PaginatedFriendUserList {
  count: number;
  next: string | null;
  previous: string | null;
  results: FriendUser[];
}

export interface PaginatedFriendRequestList {
  count: number;
  next: string | null;
  previous: string | null;
  results: FriendRequest[];
}

export type FriendRequestDirection = 'incoming' | 'outgoing';
