import { create } from 'zustand';
import type { Toast, ToastType, AuthModalState } from '@/types';
import { generateId } from '@/lib/utils';

interface UIState {
  toasts: Toast[];
  authModal: AuthModalState;
  logMovieModal: { open: boolean; movieId: number | null; movieTitle: string; moviePoster: string | null };
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  openLogModal: (movieId: number, movieTitle: string, moviePoster: string | null) => void;
  closeLogModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  authModal: { open: false, mode: 'login' },
  logMovieModal: { open: false, movieId: null, movieTitle: '', moviePoster: null },

  addToast: (type, message, duration = 4000) => {
    const id = generateId();
    set(s => ({ toasts: [...s.toasts, { id, type, message, duration }] }));
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
    }, duration);
  },

  removeToast: (id) => {
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
  },

  openAuthModal: (mode = 'login') => {
    set({ authModal: { open: true, mode } });
  },

  closeAuthModal: () => {
    set(s => ({ authModal: { ...s.authModal, open: false } }));
  },

  openLogModal: (movieId, movieTitle, moviePoster) => {
    set({ logMovieModal: { open: true, movieId, movieTitle, moviePoster } });
  },

  closeLogModal: () => {
    set(s => ({ logMovieModal: { ...s.logMovieModal, open: false } }));
  },
}));
