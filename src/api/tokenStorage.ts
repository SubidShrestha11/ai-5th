/**
 * Token storage uses localStorage because the SPA cannot set httpOnly cookies
 * from JavaScript. httpOnly cookies are preferred when the backend sets them
 * on login/refresh responses — that requires SameSite + CORS credentials and
 * no Authorization header. Until then, localStorage is the practical choice;
 * mitigate XSS risk with strict CSP and input sanitization.
 */
const ACCESS_TOKEN_KEY = 'lbl_access_token';
const REFRESH_TOKEN_KEY = 'lbl_refresh_token';

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens(access: string, refresh: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },

  setAccessToken(access: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
  },

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  hasTokens(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },
};
