type Size = 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  size?: Size;
  className?: string;
  label?: string;
}

const sizeClasses: Record<Size, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
  xl: 'w-12 h-12 border-4',
};

export function Spinner({ size = 'md', className = '', label }: SpinnerProps) {
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      role="status"
      aria-label={label ?? 'Loading'}
    >
      <span
        className={`${sizeClasses[size]} rounded-full border-sky-300/30 border-t-sky-300 animate-spin`}
      />
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <Spinner size="lg" label="Loading" />
    </div>
  );
}
