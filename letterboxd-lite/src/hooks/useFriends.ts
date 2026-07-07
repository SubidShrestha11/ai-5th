import { useEffect } from 'react';
import { useFriendStore } from '@/store/friendStore';
import { useAuthStore } from '@/store/authStore';
import { MOCK_USERS } from '@/lib/mockData';
import type { User } from '@/types';

export function useFriends() {
  const store = useFriendStore();
  const { user } = useAuthStore();

  const suggestedUsers: User[] = MOCK_USERS.filter(
    u =>
      u.id !== user?.id &&
      !store.isFriend(u.id) &&
      !store.hasSentRequest(u.id)
  );

  return {
    friends: store.friends,
    incomingRequests: store.incomingRequests,
    sentRequestIds: store.sentRequestIds,
    suggestedUsers,
    sendRequest: store.sendRequest,
    cancelRequest: store.cancelRequest,
    acceptRequest: store.acceptRequest,
    rejectRequest: store.rejectRequest,
    removeFriend: store.removeFriend,
    isFriend: store.isFriend,
    hasSentRequest: store.hasSentRequest,
  };
}

export function useSeededFriendRequests() {
  const { incomingRequests, addMockRequest } = useFriendStore();

  useEffect(() => {
    if (incomingRequests.length === 0) {
      addMockRequest({
        fromUserId: 'u1',
        fromUsername: 'cinematica',
        fromDisplayName: 'Cinematica',
        fromAvatar: null,
        toUserId: 'current',
        status: 'pending',
      });
      addMockRequest({
        fromUserId: 'u3',
        fromUsername: 'velvet_reel',
        fromDisplayName: 'Velvet Reel',
        fromAvatar: null,
        toUserId: 'current',
        status: 'pending',
      });
    }
  }, [incomingRequests.length, addMockRequest]);
}
