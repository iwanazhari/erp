import Button from '@/components/ui/Button';

interface CancelScheduleModalProps {
  scheduleLabel: string;
  isCancelling: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function CancelScheduleModal({
  scheduleLabel,
  isCancelling,
  onConfirm,
  onClose,
}: CancelScheduleModalProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl border border-border">
        <h3 className="mb-1 text-lg font-semibold text-foreground">Batalkan Jadwal</h3>
        <p className="mb-4 text-sm text-muted-foreground">{scheduleLabel}</p>
        <p className="mb-4 text-sm text-muted-foreground">
          Apakah Anda yakin ingin membatalkan jadwal ini?
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isCancelling}>
            Kembali
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} disabled={isCancelling}>
            {isCancelling ? 'Membatalkan...' : 'Batalkan Jadwal'}
          </Button>
        </div>
      </div>
    </div>
  );
}