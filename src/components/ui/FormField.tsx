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
        className="text-sm font-medium text-foreground flex items-center gap-1"
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint != null && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error != null && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
