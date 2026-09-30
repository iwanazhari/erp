import type { Leave } from '@/shared/types/leave';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LeaveStatusBadge from '@/components/ui/LeaveStatusBadge';

type Props = {
  leaves: Leave[];
  isLoading?: boolean;
  onViewDetails?: (leave: Leave) => void;
  onViewAttachment?: (leave: Leave) => void;
  onEdit?: (leave: Leave) => void;
  onDelete?: (leave: Leave) => void;
  canApproveReject?: boolean;
  onApprove?: (leave: Leave) => void;
  onReject?: (leave: Leave) => void;
  approveLoadingId?: string | null;
  rejectLoadingId?: string | null;
};

export default function LeaveTable({
  leaves,
  isLoading,
  onViewDetails,
  onViewAttachment,
  onEdit,
  onDelete,
  canApproveReject = false,
  onApprove,
  onReject,
  approveLoadingId,
  rejectLoadingId,
}: Props) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Jakarta',
    });
  };

  if (isLoading) {
    return (
      <Card padding="none">
        <div className="animate-pulse divide-y divide-slate-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4">
              <div className="h-4 flex-1 rounded bg-slate-200" />
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-4 w-24 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!leaves || leaves.length === 0) {
    return (
      <Card padding="lg">
        <div className="py-8 text-center text-slate-500">
          <p className="text-base font-medium text-slate-700">Tidak ada pengajuan</p>
          <p className="mt-1 text-sm">Sesuaikan filter atau klik &quot;Ajukan izin&quot;.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Karyawan</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Jenis</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Tanggal</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Alasan</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Keputusan</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Lampiran</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leaves.map((leave) => (
              <tr key={leave.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{leave.user.name}</div>
                  <div className="text-xs text-slate-500">{leave.user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <LeaveStatusBadge kind="type" value={String(leave.status)} />
                </td>
                <td className="px-4 py-3 text-slate-700">{formatDate(leave.date)}</td>
                <td className="max-w-xs px-4 py-3">
                  <p className="truncate text-slate-700" title={leave.leaveReason}>
                    {leave.leaveReason}
                  </p>
                </td>
                <td className="px-4 py-3 text-center">
                  <LeaveStatusBadge kind="approval" value={leave.leaveStatus} />
                </td>
                <td className="px-4 py-3 text-center">
                  {leave.leaveFileUrl ? (
                    <button
                      type="button"
                      onClick={() => onViewAttachment?.(leave)}
                      className="inline-flex text-indigo-600 hover:text-indigo-800"
                      title="Lihat lampiran"
                    >
                      <svg className="mx-auto h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="!p-2 text-indigo-600"
                      onClick={() => onViewDetails?.(leave)}
                      title="Detail"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="!p-2 text-amber-600"
                      onClick={() => onEdit?.(leave)}
                      title="Edit"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="!p-2 text-red-600"
                      onClick={() => onDelete?.(leave)}
                      title="Hapus"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                    {canApproveReject && leave.leaveStatus === 'PENDING' && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                          onClick={() => onApprove?.(leave)}
                          disabled={!!approveLoadingId || !!rejectLoadingId}
                        >
                          {approveLoadingId === leave.id ? '…' : 'Setujui'}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-800 hover:bg-red-50"
                          onClick={() => onReject?.(leave)}
                          disabled={!!approveLoadingId || !!rejectLoadingId}
                        >
                          {rejectLoadingId === leave.id ? '…' : 'Tolak'}
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
