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

  const typeConfig = {
    danger: { icon: '✕', iconBg: 'bg-red-100', iconColor: 'text-red-600', confirmBg: 'bg-red-600 hover:bg-red-700' },
    warning: { icon: '⚠', iconBg: 'bg-amber-100', iconColor: 'text-amber-700', confirmBg: 'gradient-bg hover:brightness-110' },
    info: { icon: 'ℹ', iconBg: 'bg-blue-100', iconColor: 'text-blue-700', confirmBg: 'gradient-bg hover:brightness-110' },
    success: { icon: '✓', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', confirmBg: 'bg-emerald-600 hover:bg-emerald-700' },
  };

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onCancel} aria-hidden />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-md transform transition-all border border-border">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={`shrink-0 w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center`}>
                <span className={`text-2xl ${config.iconColor}`} aria-hidden>{config.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 id="confirm-dialog-title" className="text-lg font-bold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-border rounded-xl transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all ${config.confirmBg}`}
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
