import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

interface BaseProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

interface InputProps extends BaseProps, InputHTMLAttributes<HTMLInputElement> {
  as?: 'input';
}

interface TextareaProps extends BaseProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: 'textarea';
  rows?: number;
}

type Props = InputProps | TextareaProps;

const baseInput = `
  w-full bg-[#162032] border border-white/10 rounded-lg text-slate-100 placeholder-slate-500
  text-sm transition-all duration-200
  focus:outline-none focus:border-sky-300/50 focus:ring-1 focus:ring-sky-300/20
  hover:border-white/20
  disabled:opacity-50 disabled:cursor-not-allowed
`.trim();

export function Input(props: Props) {
  const { label, error, hint, icon, iconRight, className = '', ...rest } = props;
  const isTextarea = props.as === 'textarea';

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
          {(rest as InputHTMLAttributes<HTMLInputElement>).required && (
            <span className="text-sky-400 ml-1">*</span>
          )}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            {icon}
          </span>
        )}
        {isTextarea ? (
          <textarea
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            rows={(props as TextareaProps).rows ?? 4}
            className={[
              baseInput,
              'resize-none py-3 px-4',
              icon ? 'pl-10' : '',
              iconRight ? 'pr-10' : '',
              error ? 'border-red-500/60 focus:border-red-500/80 focus:ring-red-500/20' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
          />
        ) : (
          <input
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
            className={[
              baseInput,
              'h-10 px-4',
              icon ? 'pl-10' : '',
              iconRight ? 'pr-10' : '',
              error ? 'border-red-500/60 focus:border-red-500/80 focus:ring-red-500/20' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
          />
        )}
        {iconRight && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
            {iconRight}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
