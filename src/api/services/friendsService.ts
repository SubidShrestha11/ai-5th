import { API_PATHS } from '@/api/config';
import { apiClient } from '@/api/client';
import { mapApiFriend, mapApiFriendRequest } from '@/api/mappers';
import type {
  ApiFriend,
  ApiFriendRequest,
  RespondToFriendRequestBody,
  SendFriendRequestBody,
} from '@/api/types/friends';
import type { Friend, FriendRequest } from '@/types';

export const friendsService = {
  async listFriends(): Promise<Friend[]> {
    const data = await apiClient.get<ApiFriend[] | { results: ApiFriend[] }>(
      API_PATHS.friends.list
    );
    const friends = Array.isArray(data) ? data : data.results;
    return friends.map(mapApiFriend);
  },

  async listFriendRequests(): Promise<FriendRequest[]> {
    const data = await apiClient.get<ApiFriendRequest[] | { results: ApiFriendRequest[] }>(
      API_PATHS.friends.requests
    );
    const requests = Array.isArray(data) ? data : data.results;
    return requests.map(mapApiFriendRequest);
  },

  async sendFriendRequest(userId: string | number): Promise<FriendRequest> {
    const payload: SendFriendRequestBody = { user_id: userId };
    const response = await apiClient.post<ApiFriendRequest>(
      API_PATHS.friends.request,
      payload
    );
    return mapApiFriendRequest(response);
  },

  async respondToFriendRequest(
    requestId: string | number,
    status: RespondToFriendRequestBody['status']
  ): Promise<FriendRequest> {
    const response = await apiClient.patch<ApiFriendRequest>(
      API_PATHS.friends.respond(requestId),
      { status } satisfies RespondToFriendRequestBody
    );
    return mapApiFriendRequest(response);
  },

  async removeFriend(userId: string | number): Promise<void> {
    await apiClient.delete(API_PATHS.friends.remove(userId));
  },
};
