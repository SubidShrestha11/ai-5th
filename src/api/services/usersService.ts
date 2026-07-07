import { API_PATHS } from '@/api/config';
import { apiClient } from '@/api/client';
import type { ApiUser, UpdateProfileRequest } from '@/api/types/users';

export const usersService = {
  getMeRaw(): Promise<ApiUser> {
    return apiClient.get<ApiUser>(API_PATHS.users.me);
  },

  updateMeRaw(payload: UpdateProfileRequest): Promise<ApiUser> {
    return apiClient.patch<ApiUser>(API_PATHS.users.me, payload);
  },
};
