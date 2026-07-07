export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },
  friends: {
    all: ['friends'] as const,
    list: () => [...queryKeys.friends.all, 'list'] as const,
    requests: () => [...queryKeys.friends.all, 'requests'] as const,
  },
  movies: {
    all: ['movies'] as const,
    popular: (page = 1) => [...queryKeys.movies.all, 'popular', page] as const,
    search: (query: string, page = 1) =>
      [...queryKeys.movies.all, 'search', query, page] as const,
    detail: (tmdbId: number) => [...queryKeys.movies.all, 'detail', tmdbId] as const,
    logs: () => [...queryKeys.movies.all, 'logs'] as const,
    log: (logId: string | number) => [...queryKeys.movies.all, 'log', logId] as const,
  },
  users: {
    all: ['users'] as const,
    me: () => [...queryKeys.users.all, 'me'] as const,
  },
} as const;
