/** Set via VITE_API_BASE_URL at build time (no trailing slash). */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export const API_PATHS = {
  auth: {
    login: '/api/v1/auth/login/',
    logout: '/api/v1/auth/logout/',
    register: '/api/v1/auth/register/',
  },
  feed: {
    list: '/api/v1/feed/',
  },
  friends: {
    list: '/api/v1/friends/',
    search: '/api/v1/friends/search/',
    remove: (userId: string | number) => `/api/v1/friends/${userId}/`,
    logs: (userId: string | number) => `/api/v1/friends/${userId}/logs/`,
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
