import type { ReactNode } from 'react';

type Props = {
  id?: string;
  label: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
};

/**
 * Label + kontrol form + hint/error — spacing konsisten.
 */
export default function FormField({
  id,
  label,
  children,
  hint,
  error,
  required,
  className = '',
}: Props) {
  return (
    <div className={['space-y-1.5', className].filter(Boolean).join(' ')}>
      <label
        htmlFor={id}
        className="app-label flex items-center gap-1 text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint != null && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error != null && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
