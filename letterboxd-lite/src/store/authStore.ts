import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { generateId } from '@/lib/utils';

interface StoredUser extends User {
  passwordHash: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  register: (username: string, displayName: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, 'displayName' | 'bio' | 'avatar'>>) => void;
}

const USERS_KEY = 'lbl_users';

function getStoredUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') as StoredUser[];
  } catch {
    return [];
  }
}

function saveUser(user: StoredUser): void {
  const users = getStoredUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return String(hash);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (username, password) => {
        const users = getStoredUsers();
        const found = users.find(
          u => u.username.toLowerCase() === username.toLowerCase()
        );
        if (!found) return { success: false, error: 'User not found' };
        if (found.passwordHash !== simpleHash(password)) {
          return { success: false, error: 'Incorrect password' };
        }
        const { passwordHash: _ph, ...user } = found;
        void _ph;
        set({ user, isAuthenticated: true });
        return { success: true };
      },

      register: (username, displayName, email, password) => {
        const users = getStoredUsers();
        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
          return { success: false, error: 'Username already taken' };
        }
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          return { success: false, error: 'Email already registered' };
        }
        const newUser: StoredUser = {
          id: generateId(),
          username,
          displayName,
          email,
          bio: null,
          avatar: null,
          createdAt: new Date().toISOString(),
          moviesWatched: 0,
          passwordHash: simpleHash(password),
        };
        saveUser(newUser);
        const { passwordHash: _ph, ...user } = newUser;
        void _ph;
        set({ user, isAuthenticated: true });
        return { success: true };
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      updateProfile: (updates) => {
        const { user } = get();
        if (!user) return;
        const updatedUser = { ...user, ...updates };
        const users = getStoredUsers();
        const stored = users.find(u => u.id === user.id);
        if (stored) saveUser({ ...stored, ...updates });
        set({ user: updatedUser });
      },
    }),
    {
      name: 'lbl_auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
