import { API_PATHS } from '@/api/config';
import { apiClient, postAuthRequest } from '@/api/client';
import { tokenStorage } from '@/api/tokenStorage';
import type { LoginRequest, RegisterRequest, UserProfile } from '@/api/types/auth';
import { usersService } from '@/api/services/usersService';

function extractAuthUser(data: Record<string, unknown>): UserProfile {
  const nestedUser = data.user;
  if (nestedUser && typeof nestedUser === 'object') {
    return nestedUser as UserProfile;
  }

  if (typeof data.id === 'string' && typeof data.email === 'string') {
    return data as unknown as UserProfile;
  }

  throw new Error('Invalid auth response: missing user profile');
}

export const authService = {
  async login(payload: LoginRequest): Promise<UserProfile> {
    return postAuthRequest(API_PATHS.auth.login, payload, extractAuthUser);
  },

  async register(payload: RegisterRequest): Promise<UserProfile> {
    return postAuthRequest(API_PATHS.auth.register, payload, extractAuthUser);
  },

  async logout(): Promise<void> {
    const refresh = tokenStorage.getRefreshToken();
    try {
      if (refresh) {
        await apiClient.post(API_PATHS.auth.logout, { refresh }, { auth: true });
      }
    } finally {
      tokenStorage.clearTokens();
    }
  },

  async fetchCurrentUser(): Promise<UserProfile> {
    return usersService.getMeRaw();
  },

  isLoggedIn(): boolean {
    return tokenStorage.hasTokens();
  },

  clearSession(): void {
    tokenStorage.clearTokens();
  },
};
