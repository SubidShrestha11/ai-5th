import { getInitials } from '@/lib/utils';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: Size;
  className?: string;
  online?: boolean;
}

const sizeMap: Record<Size, { container: string; text: string; indicator: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', indicator: 'w-1.5 h-1.5' },
  sm: { container: 'w-8 h-8', text: 'text-xs', indicator: 'w-2 h-2' },
  md: { container: 'w-10 h-10', text: 'text-sm', indicator: 'w-2.5 h-2.5' },
  lg: { container: 'w-14 h-14', text: 'text-lg', indicator: 'w-3 h-3' },
  xl: { container: 'w-20 h-20', text: 'text-2xl', indicator: 'w-4 h-4' },
};

const gradients = [
  'from-sky-400 to-violet-500',
  'from-violet-400 to-pink-500',
  'from-emerald-400 to-sky-500',
  'from-amber-400 to-orange-500',
  'from-pink-400 to-rose-500',
  'from-indigo-400 to-purple-500',
];

function pickGradient(name: string): string {
  const safeName = name.trim() || '?';
  const idx = safeName.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

export function Avatar({ src, name, size = 'md', className = '', online }: AvatarProps) {
  const { container, text, indicator } = sizeMap[size];
  const safeName = name?.trim() || '?';
  const gradient = pickGradient(safeName);

  return (
    <div className={`relative shrink-0 ${className}`}>
      <div
        className={`${container} rounded-full overflow-hidden ring-1 ring-white/10`}
        aria-label={safeName}
      >
        {src ? (
          <img
            src={src}
            alt={safeName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradient} font-semibold text-white select-none ${text}`}
          >
            {getInitials(safeName)}
          </div>
        )}
      </div>
      {online && (
        <span
          className={`absolute bottom-0 right-0 ${indicator} bg-emerald-400 rounded-full ring-2 ring-[#101827]`}
          aria-label="Online"
        />
      )}
    </div>
  );
}
