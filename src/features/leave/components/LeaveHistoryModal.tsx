import type { LeaveEditHistoryData } from '@/shared/types/leave';
import ModalShell from '@/components/ui/ModalShell';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

type Props = {
  history: LeaveEditHistoryData | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function LeaveHistoryModal({ history, isOpen, onClose }: Props) {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFieldName = (field: string) => {
    const labels: Record<string, string> = {
      status: 'Tipe Cuti',
      leaveReason: 'Alasan Cuti',
      leaveFileUrl: 'Dokumen',
      leaveStatus: 'Status Approval',
      date: 'Tanggal',
      approvedBy: 'Disetujui Oleh',
      approvedAt: 'Disetujui Pada',
    };
    return labels[field] || field;
  };

  if (!isOpen || !history) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Riwayat edit"
      subtitle="Audit trail perubahan pengajuan izin"
      size="xl"
      footer={
        <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
          Tutup
        </Button>
      }
    >
      <div className="space-y-6">
        <Card padding="sm" className="bg-slate-50/80">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Karyawan</p>
              <p className="mt-1 font-semibold text-slate-900">{history.user.name}</p>
              <p className="text-sm text-slate-600">{history.user.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">ID</p>
              <p className="font-mono text-xs text-slate-700">{history.leaveId}</p>
            </div>
          </div>
        </Card>

        {history.currentEditInfo && (
          <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm text-indigo-950">
            <p className="font-semibold text-indigo-900">Edit terakhir</p>
            <p className="mt-1">
              Oleh <span className="font-medium">{history.currentEditInfo.editedBy}</span>
            </p>
            <p className="mt-1 italic text-indigo-900/90">{history.currentEditInfo.editReason}</p>
          </div>
        )}

        <div>
          <h3 className="mb-3 text-base font-semibold text-slate-900">Riwayat perubahan</h3>
          {history.editHistory.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Belum ada riwayat perubahan.</p>
          ) : (
            <div className="space-y-4">
              {history.editHistory.map((edit, index) => (
                <div key={index} className="relative border-l-2 border-indigo-200 pl-6">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-indigo-600" />
                  <Card padding="sm" className="bg-white">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900">{edit.editedBy.name}</span>
                      <span className="text-xs text-slate-500">{formatDateTime(edit.editedAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500">Role: {edit.editedBy.role}</p>
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-medium">Alasan:</span> {edit.reason}
                    </p>
                    {Object.entries(edit.changes).map(([field, change]) => (
                      <div key={field} className="mt-3 rounded-lg border border-slate-100 bg-slate-50/80 p-2 text-sm">
                        <div className="font-medium text-slate-800">{formatFieldName(field)}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded bg-red-50 px-2 py-0.5 text-red-800">{String(change.old ?? '—')}</span>
                          <span className="text-slate-400">→</span>
                          <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-800">
                            {String(change.new ?? '—')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
