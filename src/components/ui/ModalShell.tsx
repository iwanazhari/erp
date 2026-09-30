import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

export type ModalShellSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalShellSize;
  contentClassName?: string;
  zIndexClass?: string;
};

const sizeWidth: Record<ModalShellSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-3xl',
  '2xl': 'max-w-5xl',
  '3xl': 'max-w-6xl',
};

export default function ModalShell({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'lg',
  contentClassName = '',
  zIndexClass = 'z-[100]',
}: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 ${zIndexClass} flex items-center justify-center overflow-y-auto p-4`}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        aria-label="Tutup"
        onClick={onClose}
      />
      <div
        className={[
          'relative w-full min-w-0 mx-4 rounded-2xl bg-card shadow-xl border border-border',
          sizeWidth[size],
        ].join(' ')}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div className="min-w-0 flex-1">
            {title != null && (
              <h2 className="text-lg font-bold text-foreground">
                {title}
              </h2>
            )}
            {subtitle != null && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground
              hover:bg-muted hover:text-foreground
              transition-all duration-150"
            aria-label="Tutup dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className={[
            'max-h-[min(85vh,880px)] overflow-y-auto px-6 py-4',
            contentClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </div>

        {footer != null && (
          <div
            className="flex flex-wrap items-center justify-end gap-2 border-t border-border
              px-6 py-4 bg-muted/30 rounded-b-2xl"
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
