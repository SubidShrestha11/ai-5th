import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, mapUserProfile } from '@/api';
import { tokenStorage } from '@/api/tokenStorage';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setSession: (user: User) => void;
  clearSession: () => void;
  initialize: () => Promise<User | null>;
  updateProfileLocal: (updates: Partial<Pick<User, 'bio' | 'avatar' | 'displayName'>>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,

      setSession: user => {
        set({
          user: {
            ...user,
            displayName: user.displayName?.trim() || user.email.split('@')[0] || 'User',
          },
          isAuthenticated: true,
          isInitialized: true,
        });
      },

      clearSession: () => {
        authService.clearSession();
        set({ user: null, isAuthenticated: false, isInitialized: true });
      },

      initialize: async () => {
        if (!authService.isLoggedIn()) {
          set({ user: null, isAuthenticated: false, isInitialized: true });
          return null;
        }

        try {
          const profile = await authService.fetchCurrentUser();
          const user = mapUserProfile(profile);
          set({ user, isAuthenticated: true, isInitialized: true });
          return user;
        } catch {
          authService.clearSession();
          set({ user: null, isAuthenticated: false, isInitialized: true });
          return null;
        }
      },

      updateProfileLocal: updates => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, ...updates } });
      },
    }),
    {
      name: 'lbl_auth',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => state => {
        if (state && !tokenStorage.hasTokens()) {
          state.user = null;
          state.isAuthenticated = false;
        }
      },
    }
  )
);
