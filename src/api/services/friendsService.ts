import { API_PATHS } from '@/api/config';
import { apiClient } from '@/api/client';
import { mapApiFriend, mapApiFriendRequest, mapApiMovieLog, mapSearchUser } from '@/api/mappers';
import type { PaginationParams } from '@/api/types/common';
import type {
  FriendRequest as ApiFriendRequest,
  FriendRequestActionRequest,
  FriendRequestCreateRequest,
  FriendRequestDirection,
  PaginatedFriendRequestList,
  PaginatedFriendUserList,
} from '@/api/types/friends';
import type { PaginatedMovieLogsResponse } from '@/api/types/movies';
import type { DiaryEntry, Friend, FriendRequest, SearchUserResult } from '@/types';

export const friendsService = {
  async listFriends(params: PaginationParams = {}): Promise<Friend[]> {
    const data = await apiClient.get<PaginatedFriendUserList>(API_PATHS.friends.list, {
      params: {
        page: params.page,
        page_size: params.page_size,
      },
    });
    return data.results.map(mapApiFriend);
  },

  async listFriendRequests(
    direction: FriendRequestDirection = 'incoming',
    params: PaginationParams = {}
  ): Promise<FriendRequest[]> {
    const data = await apiClient.get<PaginatedFriendRequestList>(
      API_PATHS.friends.requests,
      {
        params: {
          direction,
          page: params.page,
          page_size: params.page_size,
        },
      }
    );
    return data.results.map(mapApiFriendRequest);
  },

  async searchFriends(
    query: string,
    params: PaginationParams = {}
  ): Promise<SearchUserResult[]> {
    const data = await apiClient.get<PaginatedFriendUserList>(API_PATHS.friends.search, {
      params: {
        q: query,
        page: params.page,
        page_size: params.page_size,
      },
    });
    return data.results.map(mapSearchUser);
  },

  async listFriendLogs(
    userId: string,
    params: PaginationParams = {}
  ): Promise<DiaryEntry[]> {
    const entries: DiaryEntry[] = [];
    let page = params.page ?? 1;

    while (true) {
      const data = await apiClient.get<PaginatedMovieLogsResponse>(
        API_PATHS.friends.logs(userId),
        {
          params: {
            page,
            page_size: params.page_size,
          },
        }
      );
      entries.push(...data.results.map(mapApiMovieLog));
      if (!data.next) break;
      page += 1;
    }

    return entries;
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
