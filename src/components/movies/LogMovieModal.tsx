import { useState, useEffect, useMemo } from 'react';
import { Check } from 'lucide-react';
import { Modal, Button, Input, StarRating } from '@/components/ui';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import {
  useCreateMovieLog,
  useDeleteMovieLog,
  useMovieLogs,
  useUpdateMovieLog,
} from '@/hooks/queries/movies';
import { getErrorMessage } from '@/api/errors';
import { posterUrl } from '@/lib/utils';

export function LogMovieModal() {
  const { logMovieModal, closeLogModal, openAuthModal, addToast } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const { data: logs = [] } = useMovieLogs(isAuthenticated);
  const createLogMutation = useCreateMovieLog();
  const updateLogMutation = useUpdateMovieLog();
  const deleteLogMutation = useDeleteMovieLog();

  const existing = useMemo(
    () => logs.find(log => log.movieId === logMovieModal.movieId),
    [logs, logMovieModal.movieId]
  );

  const [rating, setRating] = useState<number | null>(existing?.rating ?? null);
  const [review, setReview] = useState(existing?.review ?? '');
  const [watchedAt, setWatchedAt] = useState(
    existing?.watchedAt
      ? new Date(existing.watchedAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (!logMovieModal.open) return;
    const entry = logs.find(log => log.movieId === logMovieModal.movieId);
    setRating(entry?.rating ?? null);
    setReview(entry?.review ?? '');
    setWatchedAt(
      entry?.watchedAt
        ? new Date(entry.watchedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    );
  }, [logMovieModal.open, logMovieModal.movieId, logs]);

  const saving =
    createLogMutation.isPending ||
    updateLogMutation.isPending ||
    deleteLogMutation.isPending;

  const handleSave = async () => {
    if (!isAuthenticated) {
      closeLogModal();
      openAuthModal('login');
      return;
    }
    if (!logMovieModal.movieId) return;

    const payload = {
      movieId: logMovieModal.movieId,
      watchedAt,
      rating,
      review: review.trim() || null,
    };

    try {
      if (existing) {
        await updateLogMutation.mutateAsync({
          logId: existing.id,
          updates: payload,
        });
        addToast('success', `Updated log for "${logMovieModal.movieTitle}"`);
      } else {
        await createLogMutation.mutateAsync(payload);
        addToast('success', `Logged "${logMovieModal.movieTitle}"`);
      }
      closeLogModal();
    } catch (error) {
      addToast('error', getErrorMessage(error));
    }
  };

  const handleRemove = async () => {
    if (!existing) return;

    try {
      await deleteLogMutation.mutateAsync(existing.id);
      addToast('info', `Removed "${logMovieModal.movieTitle}" from diary`);
      closeLogModal();
    } catch (error) {
      addToast('error', getErrorMessage(error));
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
            <Button variant="danger" size="sm" onClick={handleRemove} loading={saving}>
              Remove
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={closeLogModal}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
            <Check size={14} />
            {existing ? 'Update' : 'Save'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
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

        <Input
          label="Watched on"
          type="date"
          value={watchedAt}
          onChange={e => setWatchedAt(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />

        <Input
          as="textarea"
          label="Review (optional)"
          placeholder="What did you think?"
          value={review}
          onChange={e => setReview(e.target.value)}
          rows={3}
        />
      </div>
    </Modal>
  );
}
