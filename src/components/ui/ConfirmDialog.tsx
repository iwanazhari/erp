import { useEffect } from 'react';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info' | 'success';

type Props = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: ConfirmDialogVariant;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  type = 'warning',
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const typeConfig: Record<
    ConfirmDialogVariant,
    { icon: string; iconBg: string; iconColor: string; confirmBg: string }
  > = {
    danger: {
      icon: '✕',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      confirmBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: '⚠',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-700',
      confirmBg: 'bg-indigo-600 hover:bg-indigo-700',
    },
    info: {
      icon: 'ℹ',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-700',
      confirmBg: 'bg-indigo-600 hover:bg-indigo-700',
    },
    success: {
      icon: '✓',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      confirmBg: 'bg-emerald-600 hover:bg-emerald-700',
    },
  };

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onCancel}
        aria-hidden
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all border border-slate-100">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={`shrink-0 w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center`}>
                <span className={`text-2xl ${config.iconColor}`} aria-hidden>
                  {config.icon}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 id="confirm-dialog-title" className="text-lg font-semibold text-slate-800">
                  {title}
                </h3>
                <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{message}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${config.confirmBg}`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
