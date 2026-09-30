import { useState } from 'react';
import Button from '@/components/ui/Button';

interface DeleteScheduleModalProps {
  scheduleLabel: string;
  isDeleting: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export default function DeleteScheduleModal({
  scheduleLabel,
  isDeleting,
  onConfirm,
  onClose,
}: DeleteScheduleModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (reason.trim().length < 3) {
      setError('Alasan penghapusan minimal 3 karakter');
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl border border-border">
        <h3 className="mb-1 text-lg font-semibold text-foreground">Hapus Jadwal</h3>
        <p className="mb-4 text-sm text-muted-foreground">{scheduleLabel}</p>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-muted-foreground">
            Alasan penghapusan <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError('');
            }}
            rows={3}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
            placeholder="Jelaskan alasan menghapus jadwal ini..."
            required
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
            Kembali
          </Button>
          <Button type="button" variant="danger" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? 'Menghapus...' : 'Hapus Jadwal'}
          </Button>
        </div>
      </div>
    </div>
  );
}
