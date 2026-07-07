import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Film, Heart, Star, Calendar, Edit3, BookOpen } from 'lucide-react';
import type { DiaryEntry } from '@/types';
import { Avatar, Badge, Button, StarRating, Modal, Input } from '@/components/ui';
import { MovieCard } from '@/components/movies/MovieCard';
import { useAuthStore } from '@/store/authStore';
import { useMovieStore } from '@/store/movieStore';
import { useUIStore } from '@/store/uiStore';
import { MOCK_MOVIES } from '@/lib/mockData';
import { formatDate, posterUrl, releaseYear } from '@/lib/utils';

function DiaryEntryCard({ entry }: { entry: DiaryEntry }) {
  const { openLogModal } = useUIStore();
  const poster = posterUrl(entry.moviePoster, 'w92');

  return (
    <div className="flex items-center gap-4 p-4 bg-[#101827] rounded-xl border border-white/8 hover:border-white/15 transition-all duration-200 group">
      <div className="w-10 aspect-[2/3] rounded-lg overflow-hidden bg-[#162032] ring-1 ring-white/10 shrink-0">
        {poster ? (
          <img src={poster} alt={entry.movieTitle} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Link
          to={`/movie/${entry.movieId}`}
          className="font-semibold text-slate-100 hover:text-sky-300 transition-colors font-serif block leading-tight line-clamp-1"
        >
          {entry.movieTitle}
        </Link>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-slate-500">{entry.movieYear}</span>
          <span className="text-slate-700">·</span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar size={10} />
            {formatDate(entry.watchedAt)}
          </span>
          {!entry.isPublic && (
            <Badge variant="default" size="sm">Private</Badge>
          )}
        </div>
        {entry.rating !== null && (
          <StarRating value={entry.rating} readonly size="sm" className="mt-1" />
        )}
        {entry.review && (
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 italic">
            "{entry.review}"
          </p>
        )}
      </div>
      <button
        onClick={() => openLogModal(entry.movieId, entry.movieTitle, entry.moviePoster)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-all cursor-pointer shrink-0"
        aria-label="Edit entry"
      >
        <Edit3 size={14} />
      </button>
    </div>
  );
}

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user, isAuthenticated, updateProfile } = useAuthStore();
  const { diary, favorites } = useMovieStore();
  const { addToast } = useUIStore();
  const [tab, setTab] = useState<'diary' | 'reviews' | 'favorites'>('diary');
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(user?.displayName ?? '');
  const [editBio, setEditBio] = useState(user?.bio ?? '');

  const isOwnProfile = isAuthenticated && user?.username === username;

  if (!username) return <Navigate to="/" replace />;

  const handleSaveProfile = () => {
    updateProfile({ displayName: editName.trim() || (user?.displayName ?? ''), bio: editBio.trim() || null });
    addToast('success', 'Profile updated!');
    setEditOpen(false);
  };

  const diaryEntries = diary;
  const reviewEntries = diary.filter(e => e.review);
  const favoriteMovies = MOCK_MOVIES.filter(m => favorites.includes(m.id));
  const avgRating = diary.filter(e => e.rating).reduce((sum, e, _, arr) => sum + (e.rating ?? 0) / arr.length, 0);

  const tabs = [
    { id: 'diary' as const, label: 'Diary', icon: <BookOpen size={14} />, count: diaryEntries.length },
    { id: 'reviews' as const, label: 'Reviews', icon: <Star size={14} />, count: reviewEntries.length },
    { id: 'favorites' as const, label: 'Favorites', icon: <Heart size={14} />, count: favoriteMovies.length },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Profile header */}
      <div className="bg-[#101827] rounded-2xl border border-white/8 overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-[#162032] via-[#1a2640] to-[#162032] relative">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-300/5 to-violet-500/10" />
        </div>

        <div className="px-6 pb-6 -mt-10 relative">
          <div className="flex items-end justify-between">
            <div className="ring-4 ring-[#101827] rounded-full">
              <Avatar
                name={isOwnProfile ? (user?.displayName ?? username) : username}
                src={isOwnProfile ? user?.avatar : null}
                size="xl"
              />
            </div>
            {isOwnProfile && (
              <Button
                variant="outline"
                size="sm"
                icon={<Edit3 size={13} />}
                onClick={() => {
                  setEditName(user?.displayName ?? '');
                  setEditBio(user?.bio ?? '');
                  setEditOpen(true);
                }}
              >
                Edit profile
              </Button>
            )}
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-bold font-serif text-white">
              {isOwnProfile ? user?.displayName : username}
            </h1>
            <p className="text-slate-500 text-sm">@{username}</p>
            {isOwnProfile && user?.bio && (
              <p className="text-slate-300 text-sm mt-2">{user.bio}</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/8">
            <div className="text-center">
              <p className="text-2xl font-bold text-white font-serif">{diaryEntries.length}</p>
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                <Film size={11} /> Films
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white font-serif">
                {avgRating > 0 ? avgRating.toFixed(1) : '—'}
              </p>
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                <Star size={11} /> Avg Rating
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white font-serif">{favoriteMovies.length}</p>
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                <Heart size={11} /> Favorites
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#101827] border border-white/8 rounded-xl p-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
              tab === t.id
                ? 'bg-[#162032] text-white shadow'
                : 'text-slate-400 hover:text-white',
            ].join(' ')}
          >
            {t.icon}
            {t.label}
            {t.count > 0 && (
              <span className="text-[10px] text-slate-500 bg-white/8 px-1.5 py-0.5 rounded-full">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'diary' && (
        <div className="space-y-3">
          {diaryEntries.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-white/8 bg-[#101827]">
              <BookOpen size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No films logged yet</p>
              <p className="text-slate-500 text-sm mt-1">
                Search for a film and log it to your diary
              </p>
              <Link to="/search" className="mt-4 inline-block">
                <Button variant="outline" size="sm">Find a film</Button>
              </Link>
            </div>
          ) : (
            diaryEntries.map(entry => (
              <DiaryEntryCard key={entry.id} entry={entry} />
            ))
          )}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="space-y-4">
          {reviewEntries.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-white/8 bg-[#101827]">
              <Star size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No reviews yet</p>
              <p className="text-slate-500 text-sm mt-1">
                Write a review when logging a film
              </p>
            </div>
          ) : (
            reviewEntries.map(entry => (
              <div key={entry.id} className="p-5 bg-[#101827] rounded-2xl border border-white/8">
                <div className="flex gap-4">
                  <div className="w-12 aspect-[2/3] rounded-lg overflow-hidden bg-[#162032] shrink-0 ring-1 ring-white/10">
                    {entry.moviePoster && (
                      <img
                        src={posterUrl(entry.moviePoster, 'w92') ?? ''}
                        alt={entry.movieTitle}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/movie/${entry.movieId}`}
                      className="font-bold font-serif text-white hover:text-sky-300 transition-colors"
                    >
                      {entry.movieTitle}
                    </Link>
                    <div className="flex items-center gap-3 mt-1.5">
                      {entry.rating !== null && <StarRating value={entry.rating} readonly size="sm" />}
                      <span className="text-xs text-slate-500">{releaseYear(entry.watchedAt)}</span>
                    </div>
                    <blockquote className="mt-3 text-sm text-slate-300 leading-relaxed italic pl-3 border-l-2 border-violet-400/40">
                      {entry.review}
                    </blockquote>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'favorites' && (
        <div>
          {favoriteMovies.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-white/8 bg-[#101827]">
              <Heart size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No favorites yet</p>
              <p className="text-slate-500 text-sm mt-1">
                Heart a film to add it to your favorites
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {favoriteMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} size="md" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit profile modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Profile"
        size="sm"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSaveProfile}>Save changes</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Display Name"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            placeholder="Your display name"
          />
          <Input
            as="textarea"
            label="Bio"
            value={editBio}
            onChange={e => setEditBio(e.target.value)}
            placeholder="Tell us about your taste in film..."
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
}
