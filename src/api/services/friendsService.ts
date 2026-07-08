import { API_PATHS } from '@/api/config';
import { apiClient } from '@/api/client';
import { mapApiFriend, mapApiFriendRequest } from '@/api/mappers';
import type {
  FriendRequest as ApiFriendRequest,
  FriendRequestActionRequest,
  FriendRequestCreateRequest,
  FriendRequestDirection,
  PaginatedFriendRequestList,
  PaginatedFriendUserList,
} from '@/api/types/friends';
import type { Friend, FriendRequest } from '@/types';

export const friendsService = {
  async listFriends(): Promise<Friend[]> {
    const data = await apiClient.get<PaginatedFriendUserList>(API_PATHS.friends.list);
    return data.results.map(mapApiFriend);
  },

  async listFriendRequests(
    direction: FriendRequestDirection = 'incoming'
  ): Promise<FriendRequest[]> {
    const data = await apiClient.get<PaginatedFriendRequestList>(
      API_PATHS.friends.requests,
      { params: { direction } }
    );
    return data.results.map(mapApiFriendRequest);
  },

  async sendFriendRequest(receiverId: string): Promise<FriendRequest> {
    const payload: FriendRequestCreateRequest = { receiver_id: receiverId };
    const response = await apiClient.post<ApiFriendRequest>(
      API_PATHS.friends.request,
      payload
    );
    return mapApiFriendRequest(response);
  },

  async respondToFriendRequest(
    requestId: string,
    action: FriendRequestActionRequest['action']
  ): Promise<FriendRequest> {
    const response = await apiClient.patch<ApiFriendRequest>(
      API_PATHS.friends.respond(requestId),
      { action } satisfies FriendRequestActionRequest
    );
    return mapApiFriendRequest(response);
  },

  async removeFriend(userId: string): Promise<void> {
    await apiClient.delete(API_PATHS.friends.remove(userId));
  },
};
