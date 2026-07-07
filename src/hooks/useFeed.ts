import { useState, useEffect } from 'react';
import type { FeedItem } from '@/types';
import { MOCK_FEED_ITEMS } from '@/lib/mockData';
import { useFriendStore } from '@/store/friendStore';
import { useMovieStore } from '@/store/movieStore';
import { useAuthStore } from '@/store/authStore';
import { generateId } from '@/lib/utils';

export function useFeed(): { items: FeedItem[]; loading: boolean } {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { friends } = useFriendStore();
  const { diary } = useMovieStore();
  const { user } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const friendIds = new Set(friends.map(f => f.id));
      const friendFeed = MOCK_FEED_ITEMS.filter(item => friendIds.has(item.userId));

      const ownFeed: FeedItem[] = user
        ? diary.slice(0, 5).map(entry => ({
            id: generateId(),
            type: (entry.review ? 'review' : 'log') as FeedItem['type'],
            userId: user.id,
            username: user.username,
            displayName: user.displayName,
            userAvatar: user.avatar,
            movieId: entry.movieId,
            movieTitle: entry.movieTitle,
            moviePoster: entry.moviePoster,
            movieYear: entry.movieYear,
            rating: entry.rating ?? undefined,
            reviewText: entry.review ?? undefined,
            createdAt: entry.watchedAt,
          }))
        : [];

      const allItems = [...ownFeed, ...friendFeed, ...MOCK_FEED_ITEMS].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const seen = new Set<string>();
      const deduped = allItems.filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });

      setItems(deduped);
      setLoading(false);
    }, 400);
  }, [friends, diary, user]);

  return { items, loading };
}
