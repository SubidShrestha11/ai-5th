import type { ReactNode } from 'react';

type Variant = 'default' | 'cyan' | 'violet' | 'green' | 'yellow' | 'red' | 'glass';
type Size = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-white/8 text-slate-300 border border-white/10',
  cyan: 'bg-sky-300/15 text-sky-300 border border-sky-300/30',
  violet: 'bg-violet-400/15 text-violet-400 border border-violet-400/30',
  green: 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/30',
  yellow: 'bg-amber-400/15 text-amber-400 border border-amber-400/30',
  red: 'bg-red-400/15 text-red-400 border border-red-400/30',
  glass: 'bg-white/5 text-slate-300 border border-white/8 backdrop-blur-sm',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-[10px] font-semibold px-1.5 py-0.5 rounded-md tracking-wide',
  md: 'text-xs font-medium px-2 py-1 rounded-lg',
};

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 uppercase',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
