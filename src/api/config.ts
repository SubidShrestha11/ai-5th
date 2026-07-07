export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://localhost:8000';

export const API_PATHS = {
  auth: {
    login: '/api/v1/auth/login/',
    logout: '/api/v1/auth/logout/',
    register: '/api/v1/auth/register/',
    /** Django SimpleJWT default; change if your backend uses a different path */
    refresh: '/api/v1/auth/token/refresh/',
  },
  friends: {
    list: '/api/v1/friends/',
    remove: (userId: string | number) => `/api/v1/friends/${userId}/`,
    request: '/api/v1/friends/request/',
    respond: (requestId: string | number) => `/api/v1/friends/request/${requestId}/`,
    requests: '/api/v1/friends/requests/',
  },
  movies: {
    detail: (tmdbId: number) => `/api/v1/movies/${tmdbId}/`,
    logs: '/api/v1/movies/logs/',
    log: (logId: string | number) => `/api/v1/movies/logs/${logId}/`,
    popular: '/api/v1/movies/popular/',
    search: '/api/v1/movies/search/',
  },
  users: {
    me: '/api/v1/users/me/',
  },
} as const;
