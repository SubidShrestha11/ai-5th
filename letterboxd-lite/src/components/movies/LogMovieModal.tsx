import { useState, useEffect } from 'react';
import { Check, Globe, Lock } from 'lucide-react';
import { Modal, Button, Input, StarRating } from '@/components/ui';
import { useUIStore } from '@/store/uiStore';
import { useMovieStore } from '@/store/movieStore';
import { useAuthStore } from '@/store/authStore';
import { posterUrl } from '@/lib/utils';

export function LogMovieModal() {
  const { logMovieModal, closeLogModal, openAuthModal, addToast } = useUIStore();
  const { addEntry, updateEntry, getEntry, removeEntry } = useMovieStore();
  const { isAuthenticated } = useAuthStore();

  const existing = logMovieModal.movieId ? getEntry(logMovieModal.movieId) : undefined;

  const [rating, setRating] = useState<number | null>(existing?.rating ?? null);
  const [review, setReview] = useState(existing?.review ?? '');
  const [watchedAt, setWatchedAt] = useState(
    existing?.watchedAt
      ? new Date(existing.watchedAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [isPublic, setIsPublic] = useState(existing?.isPublic ?? true);

  useEffect(() => {
    if (!logMovieModal.open) return;
    const e = logMovieModal.movieId ? getEntry(logMovieModal.movieId) : undefined;
    setRating(e?.rating ?? null);
    setReview(e?.review ?? '');
    setWatchedAt(
      e?.watchedAt
        ? new Date(e.watchedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    );
    setIsPublic(e?.isPublic ?? true);
  }, [logMovieModal.open, logMovieModal.movieId, getEntry]);

  const handleSave = () => {
    if (!isAuthenticated) {
      closeLogModal();
      openAuthModal('login');
      return;
    }
    if (!logMovieModal.movieId) return;

    const entry = {
      movieId: logMovieModal.movieId,
      movieTitle: logMovieModal.movieTitle,
      moviePoster: logMovieModal.moviePoster,
      movieYear: new Date().getFullYear().toString(),
      watchedAt: new Date(watchedAt).toISOString(),
      rating,
      review: review.trim() || null,
      isPublic,
    };

    if (existing) {
      updateEntry(existing.id, entry);
      addToast('success', `Updated log for "${logMovieModal.movieTitle}"`);
    } else {
      addEntry(entry);
      addToast('success', `Logged "${logMovieModal.movieTitle}"`);
    }
    closeLogModal();
  };

  const handleRemove = () => {
    if (existing) {
      removeEntry(existing.id);
      addToast('info', `Removed "${logMovieModal.movieTitle}" from diary`);
      closeLogModal();
    }
  };

  const poster = posterUrl(logMovieModal.moviePoster, 'w154');

  return (
    <Modal
      open={logMovieModal.open}
      onClose={closeLogModal}
      title={existing ? 'Update Entry' : 'Log Film'}
      size="sm"
      footer={
        <div className="flex gap-2">
          {existing && (
            <Button variant="danger" size="sm" onClick={handleRemove}>
              Remove
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={closeLogModal}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            <Check size={14} />
            {existing ? 'Update' : 'Save'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Movie info */}
        <div className="flex gap-3 items-center">
          {poster ? (
            <img
              src={poster}
              alt={logMovieModal.movieTitle}
              className="w-12 h-18 rounded-lg object-cover ring-1 ring-white/10 shrink-0"
            />
          ) : (
            <div className="w-12 h-18 rounded-lg bg-[#162032] shrink-0" />
          )}
          <div>
            <p className="font-semibold text-white font-serif">{logMovieModal.movieTitle}</p>
            <p className="text-sm text-slate-400">Add to your diary</p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300">Rating</label>
          <div className="flex items-center gap-3">
            <StarRating value={rating} onChange={setRating} size="lg" />
            {rating !== null && (
              <button
                type="button"
                onClick={() => setRating(null)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Date */}
        <Input
          label="Watched on"
          type="date"
          value={watchedAt}
          onChange={e => setWatchedAt(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />

        {/* Review */}
        <Input
          as="textarea"
          label="Review (optional)"
          placeholder="What did you think?"
          value={review}
          onChange={e => setReview(e.target.value)}
          rows={3}
        />

        {/* Privacy */}
        <button
          type="button"
          onClick={() => setIsPublic(v => !v)}
          className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
            isPublic
              ? 'border-sky-300/30 bg-sky-300/8 text-sky-300'
              : 'border-white/10 bg-white/5 text-slate-400'
          }`}
        >
          {isPublic ? <Globe size={16} /> : <Lock size={16} />}
          <div className="text-left">
            <p className="text-sm font-medium">{isPublic ? 'Public' : 'Private'}</p>
            <p className="text-xs opacity-70">
              {isPublic ? 'Friends can see this entry' : 'Only visible to you'}
            </p>
          </div>
        </button>
      </div>
    </Modal>
  );
}
