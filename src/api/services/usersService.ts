import { API_PATHS } from '@/api/config';
import { apiClient } from '@/api/client';
import { mapSearchUser } from '@/api/mappers';
import type { UserProfile, UpdateProfileRequest } from '@/api/types/auth';
import type { PaginatedFriendUserList } from '@/api/types/friends';
import type { PaginationParams } from '@/api/types/common';
import type { SearchUserResult } from '@/types';

export const usersService = {
  getMeRaw(): Promise<UserProfile> {
    return apiClient.get<UserProfile>(API_PATHS.users.me);
  },

  updateMeRaw(payload: UpdateProfileRequest): Promise<UserProfile> {
    if (payload.profile_image instanceof File) {
      const formData = new FormData();
      if (payload.bio !== undefined) {
        formData.append('bio', payload.bio);
      }
      formData.append('profile_image', payload.profile_image);
      return apiClient.patch<UserProfile>(API_PATHS.users.me, formData);
    }

    return apiClient.patch<UserProfile>(API_PATHS.users.me, payload);
  },

  async searchUsers(
    query: string,
    params: PaginationParams = {}
  ): Promise<SearchUserResult[]> {
    const data = await apiClient.get<PaginatedFriendUserList>(API_PATHS.users.search, {
      params: {
        q: query,
        page: params.page,
        page_size: params.page_size,
      },
    });
    return data.results.map(mapSearchUser);
  },
};
