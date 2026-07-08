import { API_PATHS } from '@/api/config';
import { apiClient } from '@/api/client';
import { mapApiFeedActivity } from '@/api/mappers';
import type { PaginatedFeedActivityList } from '@/api/types/feed';
import type { PaginationParams } from '@/api/types/common';
import type { FeedItem } from '@/types';

export const feedService = {
  async listFeed(params: PaginationParams = {}): Promise<FeedItem[]> {
    const data = await this.listFeedRaw(params);
    return data.results.map(mapApiFeedActivity);
  },

  listFeedRaw(params: PaginationParams = {}): Promise<PaginatedFeedActivityList> {
    return apiClient.get<PaginatedFeedActivityList>(API_PATHS.feed.list, {
      params: {
        page: params.page ?? 1,
        page_size: params.page_size ?? 20,
      },
    });
  },
};
