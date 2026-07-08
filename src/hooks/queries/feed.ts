import { useQuery } from '@tanstack/react-query';
import { feedService } from '@/api/services/feedService';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/store/authStore';

export function useFeed(page = 1, pageSize = 20) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.feed.list(page, pageSize),
    queryFn: () => feedService.listFeed({ page, page_size: pageSize }),
    enabled: isAuthenticated,
  });
}
