import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Star, Loader2 } from 'lucide-react';
import { FeedCard } from '@/components/social/FeedCard';
import { Button } from '@/components/ui';
import { useFeed } from '@/hooks/queries/feed';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import type { FeedItemType } from '@/types';

type Filter = 'all' | FeedItemType;

export function FeedPage() {
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const { data: items = [], isLoading: loading } = useFeed();
  const [filter, setFilter] = useState<Filter>('all');

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-300/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
          <Users size={28} className="text-sky-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-serif text-white mb-2">Activity Feed</h1>
          <p className="text-slate-400 max-w-sm">
            Sign in to see what your friends are watching and reviewing.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => openAuthModal('register')}>
            Join free
          </Button>
          <Button variant="outline" onClick={() => openAuthModal('login')}>
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  const filters: { value: Filter; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All Activity', icon: <BookOpen size={14} /> },
    { value: 'review', label: 'Reviews', icon: <Star size={14} /> },
    { value: 'log', label: 'Logs', icon: <BookOpen size={14} /> },
  ];

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-white">Activity Feed</h1>
          <p className="text-slate-400 mt-1">What your friends are watching</p>
        </div>
        <Link to="/friends" className="text-sm text-sky-400 hover:text-sky-300 transition-colors">
          Manage friends →
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
              filter === f.value
                ? 'bg-sky-300/15 text-sky-300 border border-sky-300/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white hover:bg-white/8',
            ].join(' ')}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 size={20} className="animate-spin" />
          Loading feed…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-400 mb-2">No activity yet.</p>
          <p className="text-slate-500 text-sm">
            Add friends to see their film activity here.
          </p>
          <Link to="/friends" className="mt-4 inline-block">
            <Button variant="outline" size="sm" icon={<Users size={14} />}>
              Find friends
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(item => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
