import { API_PATHS } from '@/api/config';
import { apiClient } from '@/api/client';
import { mapApiFeedActivity } from '@/api/mappers';
import type { PaginatedFeedActivityList } from '@/api/types/feed';
import type { FeedItem } from '@/types';

export const feedService = {
  async listFeed(page = 1, pageSize = 20): Promise<FeedItem[]> {
    const data = await apiClient.get<PaginatedFeedActivityList>(API_PATHS.feed.list, {
      params: { page, page_size: pageSize },
    });
    return data.results.map(mapApiFeedActivity);
  },
};
