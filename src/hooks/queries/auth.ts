import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/api/services/authService';
import { mapApiUser } from '@/api/mappers';
import { queryKeys } from '@/api/queryKeys';
import { getErrorMessage } from '@/api/errors';
import { useAuthStore } from '@/store/authStore';
import type { LoginRequest, RegisterRequest } from '@/api/types/auth';

/** Example: login mutation wired to auth store + token persistence */
export function useLogin() {
  const setSession = useAuthStore(state => state.setSession);
  const clearSession = useAuthStore(state => state.clearSession);

  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const response = await authService.login(payload);
      const user = response.user
        ? mapApiUser(response.user)
        : mapApiUser(await authService.fetchCurrentUser());
      return user;
    },
    onSuccess: user => {
      setSession(user);
    },
    onError: () => {
      clearSession();
    },
    meta: {
      errorMessage: (error: unknown) => getErrorMessage(error),
    },
  });
}

/** Example: register mutation */
export function useRegister() {
  const setSession = useAuthStore(state => state.setSession);
  const clearSession = useAuthStore(state => state.clearSession);

  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const response = await authService.register(payload);
      const user = response.user
        ? mapApiUser(response.user)
        : mapApiUser(await authService.fetchCurrentUser());
      return user;
    },
    onSuccess: user => {
      setSession(user);
    },
    onError: () => {
      clearSession();
    },
  });
}

/** Example: logout mutation */
export function useLogout() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore(state => state.clearSession);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearSession();
      queryClient.clear();
    },
  });
}

/** Example: restore session on app load */
export function useAuthBootstrap() {
  const initialize = useAuthStore(state => state.initialize);

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: initialize,
    staleTime: Infinity,
    retry: false,
  });
}
