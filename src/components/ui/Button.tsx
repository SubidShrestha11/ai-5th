import type { ReactNode, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-sky-300 text-[#070B12] hover:bg-sky-200 active:bg-sky-400 font-semibold shadow-lg shadow-sky-300/20',
  secondary:
    'bg-violet-500 text-white hover:bg-violet-400 active:bg-violet-600 font-semibold shadow-lg shadow-violet-500/20',
  ghost:
    'bg-transparent text-slate-300 hover:text-white hover:bg-white/8',
  danger:
    'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:text-red-300',
  outline:
    'bg-transparent border border-white/15 text-slate-300 hover:border-white/30 hover:text-white hover:bg-white/5',
};

const sizeClasses: Record<Size, string> = {
  xs: 'h-7 px-2.5 text-xs rounded-md gap-1',
  sm: 'h-8 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-lg gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B12]',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}
