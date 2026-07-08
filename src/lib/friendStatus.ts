import type { Friend, FriendRequest } from '@/types';

export type UserFriendStatus = 'self' | 'friend' | 'incoming' | 'outgoing' | 'add';

export function getUserFriendStatus(
  userId: string,
  currentUserId: string | undefined,
  friends: Friend[],
  incoming: FriendRequest[],
  outgoing: FriendRequest[]
): UserFriendStatus {
  if (currentUserId && userId === currentUserId) return 'self';
  if (friends.some(friend => friend.id === userId)) return 'friend';
  if (incoming.some(request => request.senderId === userId)) return 'incoming';
  if (outgoing.some(request => request.receiverId === userId)) return 'outgoing';
  return 'add';
}
