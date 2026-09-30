import { useState, useEffect } from 'react';
import type { Leave, LeaveApprovalStatus, LeaveStatus } from '@/shared/types/leave';
import ModalShell from '@/components/ui/ModalShell';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { todayDate } from '@/utils/date';

type Props = {
  leave: Leave | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    status?: LeaveStatus;
    leaveReason?: string;
    leaveFileUrl?: string;
    leaveStatus?: LeaveApprovalStatus;
    date?: string;
    editReason: string;
  }) => Promise<void>;
  isLoading?: boolean;
};

export default function LeaveEditModal({
  leave,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: Props) {
  const [status, setStatus] = useState<LeaveStatus>('IZIN');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveFileUrl, setLeaveFileUrl] = useState('');
  const [leaveStatus, setLeaveStatus] = useState<LeaveApprovalStatus>('PENDING');
  const [date, setDate] = useState(todayDate);
  const [editReason, setEditReason] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (leave && isOpen) {
      const st = leave.status;
      setStatus(st === 'IZIN' || st === 'SAKIT' || st === 'ALPA' ? st : 'IZIN');
      setLeaveReason(leave.leaveReason);
      setLeaveFileUrl(leave.leaveFileUrl ?? '');
      setLeaveStatus(leave.leaveStatus);
      const parts = new Intl.DateTimeFormat('id-ID', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        timeZone: 'Asia/Jakarta',
      }).formatToParts(new Date(leave.date));
      const y = parts.find(p => p.type === 'year')?.value || '';
      const m = parts.find(p => p.type === 'month')?.value || '';
      const d = parts.find(p => p.type === 'day')?.value || '';
      setDate(`${y}-${m}-${d}`);
      setEditReason('');
      setLocalError(null);
    }
  }, [leave, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!editReason.trim()) {
      setLocalError('Alasan edit wajib diisi untuk jejak audit.');
      return;
    }
    await onSave({
      status,
      leaveReason,
      leaveFileUrl,
      leaveStatus,
      date: date || undefined,
      editReason: editReason.trim(),
    });
  };

  if (!isOpen || !leave) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Edit pengajuan izin"
      subtitle="Perubahan sebaiknya dicatat dengan alasan yang jelas."
      size="xl"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" form="leave-edit-form" disabled={isLoading}>
            {isLoading ? 'Menyimpan…' : 'Simpan'}
          </Button>
        </>
      }
    >
      <form id="leave-edit-form" onSubmit={handleSubmit} className="space-y-4">
        {localError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{localError}</div>
        )}

        <Card padding="sm" className="bg-muted/80">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Karyawan</p>
           <p className="mt-1 font-semibold text-foreground">{leave.user.name}</p>
           <p className="text-sm text-muted-foreground">{leave.user.email}</p>
           <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>
               Tipe: <span className="font-medium text-foreground">{leave.status}</span>
            </span>
            <span>
              Tanggal asli:{' '}
                <span className="font-medium text-foreground">
                  {new Date(leave.date).toLocaleDateString('id-ID', {
                   weekday: 'long',
                   year: 'numeric',
                   month: 'long',
                   day: 'numeric',
                   timeZone: 'Asia/Jakarta',
                 })}
              </span>
            </span>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Tipe cuti" id="leave-edit-type">
            <select
              id="leave-edit-type"
              value={status}
              onChange={(e) => setStatus(e.target.value as LeaveStatus)}
               className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2364748B%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
             >
               <option value="IZIN">Izin</option>
               <option value="SAKIT">Sakit</option>
               <option value="ALPA">Alpa</option>
             </select>
          </FormField>
          <FormField label="Tanggal" id="leave-edit-date">
            <input
              id="leave-edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
               className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
             />
           </FormField>
         </div>

         <FormField label="Keputusan" id="leave-edit-approval">
           <select
             id="leave-edit-approval"
             value={leaveStatus}
             onChange={(e) => setLeaveStatus(e.target.value as LeaveApprovalStatus)}
             className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2364748B%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </FormField>

        <FormField label="Alasan cuti" id="leave-edit-reason">
          <textarea
            id="leave-edit-reason"
            value={leaveReason}
            onChange={(e) => setLeaveReason(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 resize-none"
           />
         </FormField>

         <FormField label="URL dokumen pendukung" id="leave-edit-file">
           <input
             id="leave-edit-file"
             type="url"
             value={leaveFileUrl}
             onChange={(e) => setLeaveFileUrl(e.target.value)}
             placeholder="https://…"
             className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
          />
          {leaveFileUrl ? (
            <p className="mt-2">
              <a href={leaveFileUrl} target="_blank" rel="noopener noreferrer" className="app-link text-sm">
                Buka lampiran
              </a>
            </p>
          ) : null}
        </FormField>

        <FormField label="Alasan edit" required id="leave-edit-why" hint="Wajib untuk jejak audit.">
          <textarea
            id="leave-edit-why"
            value={editReason}
            onChange={(e) => setEditReason(e.target.value)}
            placeholder="Mis. koreksi data sesuai permintaan HR"
            rows={3}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 resize-none"
            required
          />
        </FormField>
      </form>
    </ModalShell>
  );
}
