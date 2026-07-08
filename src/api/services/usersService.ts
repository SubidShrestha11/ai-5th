import { API_PATHS } from '@/api/config';
import { apiClient } from '@/api/client';
import type { UserProfile, UpdateProfileRequest } from '@/api/types/auth';

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
};
