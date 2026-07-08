import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/api/services/authService';
import { mapUserProfile } from '@/api/mappers';
import { queryKeys } from '@/api/queryKeys';
import { getErrorMessage } from '@/api/errors';
import { useAuthStore } from '@/store/authStore';
import type { LoginRequest, RegisterRequest } from '@/api/types/auth';

export function useLogin() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore(state => state.setSession);
  const clearSession = useAuthStore(state => state.clearSession);

  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const profile = await authService.login(payload);
      return mapUserProfile(profile);
    },
    onSuccess: user => {
      setSession(user);
      queryClient.invalidateQueries({ queryKey: queryKeys.movies.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
    },
    onError: () => {
      clearSession();
    },
    meta: {
      errorMessage: (error: unknown) => getErrorMessage(error),
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore(state => state.setSession);
  const clearSession = useAuthStore(state => state.clearSession);

  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const profile = await authService.register(payload);
      return mapUserProfile(profile);
    },
    onSuccess: user => {
      setSession(user);
      queryClient.invalidateQueries({ queryKey: queryKeys.movies.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
    },
    onError: () => {
      clearSession();
    },
  });
}

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

export function useAuthBootstrap() {
  const initialize = useAuthStore(state => state.initialize);

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: initialize,
    staleTime: Infinity,
    retry: false,
  });
}
