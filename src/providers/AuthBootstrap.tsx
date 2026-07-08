import { useEffect } from 'react';
import { setAuthFailureHandler } from '@/api/client';
import { useAuthBootstrap } from '@/hooks/queries/auth';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

interface AuthBootstrapProps {
  children: React.ReactNode;
}

/** Restores session from stored tokens and opens login when refresh fails */
export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const clearSession = useAuthStore(state => state.clearSession);
  const openAuthModal = useUIStore(state => state.openAuthModal);
  const { isLoading } = useAuthBootstrap();

  useEffect(() => {
    setAuthFailureHandler(() => {
      clearSession();
      openAuthModal('login');
    });
  }, [clearSession, openAuthModal]);

  if (isLoading) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-[#070B12] text-slate-400">
        Loading your session...
      </div>
    );
  }

  return children;
}
