import { useState, useEffect } from 'react';
import type { Leave, LeaveApprovalStatus, LeaveStatus } from '@/shared/types/leave';
import ModalShell from '@/components/ui/ModalShell';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

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
  const [date, setDate] = useState('');
  const [editReason, setEditReason] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (leave && isOpen) {
      const st = leave.status;
      setStatus(st === 'IZIN' || st === 'SAKIT' || st === 'ALPA' ? st : 'IZIN');
      setLeaveReason(leave.leaveReason);
      setLeaveFileUrl(leave.leaveFileUrl ?? '');
      setLeaveStatus(leave.leaveStatus);
      const leaveDate = new Date(leave.date);
      const year = leaveDate.getFullYear();
      const month = (leaveDate.getMonth() + 1).toString().padStart(2, '0');
      const day = leaveDate.getDate().toString().padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
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
      date: date ? new Date(date).toISOString() : undefined,
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

        <Card padding="sm" className="bg-slate-50/80">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Karyawan</p>
          <p className="mt-1 font-semibold text-slate-900">{leave.user.name}</p>
          <p className="text-sm text-slate-600">{leave.user.email}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
            <span>
              Tipe: <span className="font-medium text-slate-900">{leave.status}</span>
            </span>
            <span>
              Tanggal asli:{' '}
              <span className="font-medium text-slate-900">
                {new Date(leave.date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
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
              className="app-select"
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
              className="app-input"
            />
          </FormField>
        </div>

        <FormField label="Keputusan" id="leave-edit-approval">
          <select
            id="leave-edit-approval"
            value={leaveStatus}
            onChange={(e) => setLeaveStatus(e.target.value as LeaveApprovalStatus)}
            className="app-select"
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
            className="app-input resize-none"
          />
        </FormField>

        <FormField label="URL dokumen pendukung" id="leave-edit-file">
          <input
            id="leave-edit-file"
            type="url"
            value={leaveFileUrl}
            onChange={(e) => setLeaveFileUrl(e.target.value)}
            placeholder="https://…"
            className="app-input"
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
            className="app-input resize-none"
            required
          />
        </FormField>
      </form>
    </ModalShell>
  );
}
