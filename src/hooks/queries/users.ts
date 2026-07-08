import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mapUserProfile } from '@/api/mappers';
import { queryKeys } from '@/api/queryKeys';
import { getErrorMessage } from '@/api/errors';
import { usersService } from '@/api/services/usersService';
import { useAuthStore } from '@/store/authStore';
import type { UpdateProfileRequest } from '@/api/types/auth';
import type { User } from '@/types';

type UpdateProfileInput = Partial<Pick<User, 'bio'>> & {
  avatar?: File | null;
};

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: async () => mapUserProfile(await usersService.getMeRaw()),
    enabled,
  });
}

export function useSearchUsers(query: string, enabled = query.trim().length >= 2) {
  return useQuery({
    queryKey: queryKeys.users.search(query),
    queryFn: () => usersService.searchUsers(query),
    enabled,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore(state => state.setSession);

  return useMutation({
    mutationFn: async (updates: UpdateProfileInput) => {
      const payload: UpdateProfileRequest = {};
      if (updates.bio !== undefined) {
        payload.bio = updates.bio;
      }
      if (updates.avatar instanceof File) {
        payload.profile_image = updates.avatar;
      }
      return mapUserProfile(await usersService.updateMeRaw(payload));
    },
    onSuccess: user => {
      setSession(user);
      queryClient.setQueryData(queryKeys.users.me(), user);
    },
    meta: {
      errorMessage: (error: unknown) => getErrorMessage(error),
    },
  });
}
