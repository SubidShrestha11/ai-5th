import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mapApiUser } from '@/api/mappers';
import { queryKeys } from '@/api/queryKeys';
import { getErrorMessage } from '@/api/errors';
import { usersService } from '@/api/services/usersService';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types';

/** Example: fetch current user profile */
export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: async () => mapApiUser(await usersService.getMeRaw()),
    enabled,
  });
}

/** Example: update profile with cache + auth store sync */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore(state => state.setSession);

  return useMutation({
    mutationFn: async (updates: Partial<Pick<User, 'displayName' | 'bio' | 'avatar'>>) => {
      const payload = {
        ...(updates.displayName !== undefined ? { display_name: updates.displayName } : {}),
        ...(updates.bio !== undefined ? { bio: updates.bio } : {}),
        ...(updates.avatar !== undefined ? { profile_image: updates.avatar } : {}),
      };
      return mapApiUser(await usersService.updateMeRaw(payload));
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
