export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },
  feed: {
    all: ['feed'] as const,
    list: (page = 1, pageSize = 20) =>
      [...queryKeys.feed.all, 'list', page, pageSize] as const,
  },
  friends: {
    all: ['friends'] as const,
    list: () => [...queryKeys.friends.all, 'list'] as const,
    logs: (userId: string) => [...queryKeys.friends.all, 'logs', userId] as const,
    requests: (direction: 'incoming' | 'outgoing' = 'incoming') =>
      [...queryKeys.friends.all, 'requests', direction] as const,
  },
  movies: {
    all: ['movies'] as const,
    popular: (page = 1) => [...queryKeys.movies.all, 'popular', page] as const,
    search: (query: string, page = 1) =>
      [...queryKeys.movies.all, 'search', query, page] as const,
    browse: (page = 1) => [...queryKeys.movies.all, 'browse', page] as const,
    detail: (tmdbId: number) => [...queryKeys.movies.all, 'detail', tmdbId] as const,
    logs: () => [...queryKeys.movies.all, 'logs'] as const,
    log: (logId: string | number) => [...queryKeys.movies.all, 'log', logId] as const,
  },
  users: {
    all: ['users'] as const,
    me: () => [...queryKeys.users.all, 'me'] as const,
    search: (query: string) => [...queryKeys.users.all, 'search', query] as const,
  },
} as const;
