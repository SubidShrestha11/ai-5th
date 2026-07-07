import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DiaryEntry } from '@/types';
import { generateId } from '@/lib/utils';

interface MovieState {
  diary: DiaryEntry[];
  favorites: number[];
  addEntry: (entry: Omit<DiaryEntry, 'id'>) => string;
  updateEntry: (id: string, updates: Partial<DiaryEntry>) => void;
  removeEntry: (id: string) => void;
  addFavorite: (movieId: number) => void;
  removeFavorite: (movieId: number) => void;
  toggleFavorite: (movieId: number) => void;
  isFavorite: (movieId: number) => boolean;
  isLogged: (movieId: number) => boolean;
  getEntry: (movieId: number) => DiaryEntry | undefined;
  getEntriesForMonth: (year: number, month: number) => DiaryEntry[];
  clearAll: () => void;
}

export const useMovieStore = create<MovieState>()(
  persist(
    (set, get) => ({
      diary: [],
      favorites: [],

      addEntry: (entry) => {
        const id = generateId();
        set(s => ({ diary: [{ ...entry, id }, ...s.diary] }));
        return id;
      },

      updateEntry: (id, updates) => {
        set(s => ({
          diary: s.diary.map(e => (e.id === id ? { ...e, ...updates } : e)),
        }));
      },

      removeEntry: (id) => {
        set(s => ({ diary: s.diary.filter(e => e.id !== id) }));
      },

      addFavorite: (movieId) => {
        set(s => ({
          favorites: s.favorites.includes(movieId)
            ? s.favorites
            : [...s.favorites, movieId],
        }));
      },

      removeFavorite: (movieId) => {
        set(s => ({ favorites: s.favorites.filter(id => id !== movieId) }));
      },

      toggleFavorite: (movieId) => {
        const { favorites } = get();
        if (favorites.includes(movieId)) {
          set(s => ({ favorites: s.favorites.filter(id => id !== movieId) }));
        } else {
          set(s => ({ favorites: [...s.favorites, movieId] }));
        }
      },

      isFavorite: (movieId) => get().favorites.includes(movieId),

      isLogged: (movieId) => get().diary.some(e => e.movieId === movieId),

      getEntry: (movieId) => get().diary.find(e => e.movieId === movieId),

      getEntriesForMonth: (year, month) =>
        get().diary.filter(e => {
          const d = new Date(e.watchedAt);
          return d.getFullYear() === year && d.getMonth() === month;
        }),

      clearAll: () => set({ diary: [], favorites: [] }),
    }),
    { name: 'lbl_movies' }
  )
);
