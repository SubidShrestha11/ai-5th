import { API_PATHS } from '@/api/config';
import { apiClient } from '@/api/client';
import { tokenStorage } from '@/api/tokenStorage';
import type {
  AuthResponse,
  LoginRequest,
  RefreshTokenResponse,
  RegisterRequest,
} from '@/api/types/auth';
import type { ApiUser } from '@/api/types/auth';
import { usersService } from '@/api/services/usersService';

export const authService = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_PATHS.auth.login,
      payload,
      { auth: false }
    );
    tokenStorage.setTokens(response.access, response.refresh);
    return response;
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_PATHS.auth.register,
      payload,
      { auth: false }
    );
    tokenStorage.setTokens(response.access, response.refresh);
    return response;
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

  async refreshAccessToken(): Promise<string | null> {
    const refresh = tokenStorage.getRefreshToken();
    if (!refresh) return null;

    const response = await apiClient.post<RefreshTokenResponse>(
      API_PATHS.auth.refresh,
      { refresh },
      { auth: false }
    );
    tokenStorage.setAccessToken(response.access);
    return response.access;
  },

  async fetchCurrentUser(): Promise<ApiUser> {
    return usersService.getMeRaw();
  },

  isLoggedIn(): boolean {
    return tokenStorage.hasTokens();
  },

  clearSession(): void {
    tokenStorage.clearTokens();
  },
};
