import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { ToastContainer } from '@/components/ui';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-svh bg-[#070B12] text-slate-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
      <ToastContainer />
    </div>
  );
}
