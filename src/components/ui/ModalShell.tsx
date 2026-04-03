import { useEffect, type ReactNode } from 'react';

export type ModalShellSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalShellSize;
  /** Kelas tambahan untuk area konten scroll (mis. tinggi modal jadwal) */
  contentClassName?: string;
  /** z-index di atas toast (50) */
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

/**
 * Wrapper modal konsisten: backdrop, panel, header netral (tanpa gradient warna-warni).
 */
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
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] transition-opacity"
        aria-label="Tutup"
        onClick={onClose}
      />
      <div
        className={[
          'relative w-full min-w-0 rounded-xl border border-slate-200 bg-white shadow-xl',
          sizeWidth[size],
        ].join(' ')}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div className="min-w-0 flex-1">
            {title != null && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
            {subtitle != null && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Tutup dialog"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-6 py-4 bg-slate-50/80 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
