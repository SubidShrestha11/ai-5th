import { Link } from 'react-router-dom';
import { Star, BookOpen, UserPlus } from 'lucide-react';
import type { FeedItem } from '@/types';
import { posterUrl, timeAgo } from '@/lib/utils';
import { Avatar, StarRating, Badge } from '@/components/ui';

interface FeedCardProps {
  item: FeedItem;
}

export function FeedCard({ item }: FeedCardProps) {
  const poster = item.moviePoster ? posterUrl(item.moviePoster, 'w154') : null;

  if (item.type === 'friend_added') {
    return (
      <div className="flex items-center gap-3 p-4 bg-[#101827] rounded-xl border border-white/8">
        <Avatar name={item.displayName} src={item.userAvatar} size="sm" />
        <p className="text-sm text-slate-400 flex-1">
          <Link
            to={`/profile/${item.userId}`}
            className="font-medium text-slate-200 hover:text-sky-300 transition-colors"
          >
            {item.displayName}
          </Link>{' '}
          became friends with{' '}
          <span className="font-medium text-slate-200">{item.friendEmail}</span>
        </p>
        <div className="flex items-center gap-1 text-violet-400">
          <UserPlus size={14} />
        </div>
        <span className="text-xs text-slate-600 shrink-0">{timeAgo(item.createdAt)}</span>
      </div>
    );
  }

  return (
    <article className="bg-[#101827] rounded-2xl border border-white/8 overflow-hidden hover:border-white/15 transition-all duration-300">
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={item.displayName} src={item.userAvatar} size="sm" />
            <div>
              <Link
                to={`/profile/${item.userId}`}
                className="font-semibold text-slate-100 hover:text-sky-300 transition-colors text-sm"
              >
                {item.displayName}
              </Link>
              <p className="text-xs text-slate-500">{item.userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={item.type === 'review' ? 'violet' : 'cyan'} size="sm">
              {item.type === 'review' ? (
                <><Star size={9} /> Review</>
              ) : (
                <><BookOpen size={9} /> Logged</>
              )}
            </Badge>
            <span className="text-xs text-slate-600">{timeAgo(item.createdAt)}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <Link to={`/movie/${item.movieId}`} className="shrink-0 group">
            <div className="w-14 aspect-[2/3] rounded-lg overflow-hidden bg-[#162032] ring-1 ring-white/10 group-hover:ring-sky-300/30 transition-all">
              {poster ? (
                <img
                  src={poster}
                  alt={item.movieTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full" />
              )}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <Link
              to={`/movie/${item.movieId}`}
              className="font-bold font-serif text-white hover:text-sky-300 transition-colors line-clamp-1"
            >
              {item.movieTitle}
            </Link>
            {item.movieYear && (
              <p className="text-xs text-slate-500 mt-0.5">{item.movieYear}</p>
            )}

            {item.rating !== undefined && (
              <div className="mt-2">
                <StarRating value={item.rating} readonly size="sm" />
              </div>
            )}

            {item.reviewText && (
              <blockquote className="mt-3 text-sm text-slate-300 leading-relaxed line-clamp-3 pl-3 border-l-2 border-violet-400/40 italic">
                {item.reviewText}
              </blockquote>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
