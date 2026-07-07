import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Friend, FriendRequest } from '@/types';
import { generateId } from '@/lib/utils';

interface FriendState {
  friends: Friend[];
  incomingRequests: FriendRequest[];
  sentRequestIds: string[];
  sendRequest: (user: { id: string; username: string; displayName: string; avatar: string | null }) => void;
  cancelRequest: (userId: string) => void;
  acceptRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;
  removeFriend: (friendId: string) => void;
  isFriend: (userId: string) => boolean;
  hasSentRequest: (userId: string) => boolean;
  addMockRequest: (request: Omit<FriendRequest, 'id' | 'createdAt'>) => void;
  clearAll: () => void;
}

export const useFriendStore = create<FriendState>()(
  persist(
    (set, get) => ({
      friends: [],
      incomingRequests: [],
      sentRequestIds: [],

      sendRequest: (user) => {
        if (get().isFriend(user.id) || get().hasSentRequest(user.id)) return;
        set(s => ({ sentRequestIds: [...s.sentRequestIds, user.id] }));
      },

      cancelRequest: (userId) => {
        set(s => ({ sentRequestIds: s.sentRequestIds.filter(id => id !== userId) }));
      },

      acceptRequest: (requestId) => {
        const req = get().incomingRequests.find(r => r.id === requestId);
        if (!req) return;
        const newFriend: Friend = {
          id: req.fromUserId,
          username: req.fromUsername,
          displayName: req.fromDisplayName,
          avatar: req.fromAvatar,
          moviesWatched: Math.floor(Math.random() * 300) + 50,
          recentActivity: null,
        };
        set(s => ({
          friends: [...s.friends, newFriend],
          incomingRequests: s.incomingRequests.filter(r => r.id !== requestId),
        }));
      },

      rejectRequest: (requestId) => {
        set(s => ({
          incomingRequests: s.incomingRequests.filter(r => r.id !== requestId),
        }));
      },

      removeFriend: (friendId) => {
        set(s => ({ friends: s.friends.filter(f => f.id !== friendId) }));
      },

      isFriend: (userId) => get().friends.some(f => f.id === userId),

      hasSentRequest: (userId) => get().sentRequestIds.includes(userId),

      addMockRequest: (request) => {
        const newReq: FriendRequest = {
          ...request,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set(s => ({ incomingRequests: [...s.incomingRequests, newReq] }));
      },

      clearAll: () => set({ friends: [], incomingRequests: [], sentRequestIds: [] }),
    }),
    { name: 'lbl_friends' }
  )
);
