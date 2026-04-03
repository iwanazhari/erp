import { useState, useCallback, useMemo } from 'react';
import {
  useLeaveList,
  useCreateLeave,
  useApproveLeave,
  useRejectLeave,
  useLeaveTargetUsers,
} from '@/features/leave/hooks/useLeave';
import { LeaveTable, LeaveFilters, LeaveCreateModal } from '@/features/leave/components';
import type { CreateLeaveInput, Leave, LeaveFilters as LeaveFiltersType } from '@/shared/types/leave';
import { useAuth } from '@/shared/AuthContext';
import { useToast } from '@/components/ui/ToastContext';
import { useConfirm } from '@/components/ui/ConfirmDialogContext';
import { leaveApiErrorMessage } from '@/services/leaveApi';
import PageContainer from '@/components/ui/PageContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ModalShell from '@/components/ui/ModalShell';
import LeaveStatusBadge from '@/components/ui/LeaveStatusBadge';

const DEFAULT_PAGE_SIZE = 20;

function toDateKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function canApproveRejectLeave(role: string | undefined): boolean {
  const r = String(role ?? '').toUpperCase();
  return r === 'ADMIN' || r === 'HR';
}

export default function LeavePage() {
  const { user } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();

  const [filters, setFilters] = useState<LeaveFiltersType>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [detailLeave, setDetailLeave] = useState<Leave | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: leaves = [], isLoading, error } = useLeaveList();
  const createLeave = useCreateLeave();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();

  const canHrAdmin = canApproveRejectLeave(typeof user?.role === 'string' ? user.role : undefined);

  // Untuk tampilan `approvedBy` (backend mengirim UUID; UI ingin menampilkan user.name)
  const { data: targetUsers = [] } = useLeaveTargetUsers(!!detailLeave && canHrAdmin);
  const approvedByName = useMemo(() => {
    if (!detailLeave?.approvedBy) return null;
    const found = targetUsers.find((u) => u.id === detailLeave.approvedBy);
    return found?.name ?? detailLeave.approvedBy;
  }, [detailLeave?.approvedBy, targetUsers]);

  const filteredLeaves = useMemo(() => {
    let list = [...leaves];
    if (filters.type) {
      list = list.filter((l) => String(l.status) === filters.type);
    }
    if (filters.status) {
      list = list.filter((l) => l.leaveStatus === filters.status);
    }
    if (filters.startDate) {
      list = list.filter((l) => toDateKey(l.date) >= filters.startDate!);
    }
    if (filters.endDate) {
      list = list.filter((l) => toDateKey(l.date) <= filters.endDate!);
    }
    return list;
  }, [leaves, filters.type, filters.status, filters.startDate, filters.endDate]);

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(filteredLeaves.length / pageSize));

  const paginatedLeaves = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLeaves.slice(start, start + pageSize);
  }, [filteredLeaves, page, pageSize]);

  const stats = useMemo(() => {
    return {
      pending: filteredLeaves.filter((l) => l.leaveStatus === 'PENDING').length,
      approved: filteredLeaves.filter((l) => l.leaveStatus === 'APPROVED').length,
      rejected: filteredLeaves.filter((l) => l.leaveStatus === 'REJECTED').length,
    };
  }, [filteredLeaves]);

  const handleFilterChange = useCallback((newFilters: LeaveFiltersType) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const handlePageChange = useCallback((p: number) => {
    setFilters((prev) => ({ ...prev, page: p }));
  }, []);

  const handleCreate = useCallback(
    async (input: CreateLeaveInput) => {
      try {
        await createLeave.mutateAsync(input);
        toast.success('Pengajuan izin berhasil dikirim.');
        setIsCreateOpen(false);
      } catch (e) {
        toast.error(leaveApiErrorMessage(e));
      }
    },
    [createLeave, toast]
  );

  const handleApprove = useCallback(
    async (leave: Leave) => {
      const dateStr = new Date(leave.date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const ok = await confirm({
        title: 'Setujui pengajuan izin?',
        message: `Setujui izin ${leave.user.name} pada ${dateStr}?`,
        confirmLabel: 'Ya, setujui',
        cancelLabel: 'Batal',
        type: 'success',
      });
      if (!ok) return;
      try {
        await approveLeave.mutateAsync(leave.id);
        toast.success('Izin disetujui.');
      } catch (e) {
        toast.error(leaveApiErrorMessage(e));
      }
    },
    [approveLeave, confirm, toast]
  );

  const handleReject = useCallback(
    async (leave: Leave) => {
      const dateStr = new Date(leave.date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const ok = await confirm({
        title: 'Tolak pengajuan izin?',
        message: `Tolak izin ${leave.user.name} pada ${dateStr}? Tindakan ini mengubah status menjadi ditolak.`,
        confirmLabel: 'Ya, tolak',
        cancelLabel: 'Batal',
        type: 'danger',
      });
      if (!ok) return;
      try {
        await rejectLeave.mutateAsync(leave.id);
        toast.success('Izin ditolak.');
      } catch (e) {
        toast.error(leaveApiErrorMessage(e));
      }
    },
    [confirm, rejectLeave, toast]
  );

  const approveLoadingId = approveLeave.isPending ? approveLeave.variables : null;
  const rejectLoadingId = rejectLeave.isPending ? rejectLeave.variables : null;

  return (
    <>
      <PageContainer
        title="Izin & sakit"
        subtitle={
          <>
            Data dari endpoint <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">GET /api/leave</code>
            . Daftar mengikuti hak akses per role. HR/Admin dapat memproses status{' '}
            <span className="font-medium text-slate-700">PENDING</span>.
          </>
        }
        actions={
          <Button type="button" onClick={() => setIsCreateOpen(true)}>
            Ajukan izin
          </Button>
        }
        wrapContent={false}
      >
        <div className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error instanceof Error ? error.message : 'Gagal memuat daftar izin'}
            </div>
          )}

          <LeaveFilters filters={filters} onFilterChange={handleFilterChange} isLoading={isLoading} />

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                Menampilkan{' '}
                <span className="font-semibold text-slate-900">{paginatedLeaves.length}</span> dari{' '}
                <span className="font-semibold text-slate-900">{filteredLeaves.length}</span> pengajuan
                <span className="text-slate-400"> · total server: {leaves.length}</span>
              </p>
              <div className="flex flex-wrap gap-6 text-center text-sm">
                <div>
                  <p className="text-2xl font-semibold tabular-nums text-amber-700">{stats.pending}</p>
                  <p className="text-xs text-slate-500">Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold tabular-nums text-emerald-700">{stats.approved}</p>
                  <p className="text-xs text-slate-500">Disetujui</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold tabular-nums text-red-700">{stats.rejected}</p>
                  <p className="text-xs text-slate-500">Ditolak</p>
                </div>
              </div>
            </div>
          </Card>

          <LeaveTable
            leaves={paginatedLeaves}
            isLoading={isLoading}
            onViewDetails={setDetailLeave}
            canApproveReject={canHrAdmin}
            onApprove={handleApprove}
            onReject={handleReject}
            approveLoadingId={approveLoadingId ?? null}
            rejectLoadingId={rejectLoadingId ?? null}
          />

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                Sebelumnya
              </Button>
              <span className="flex items-center px-3 text-sm text-slate-600">
                Halaman {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Berikutnya
              </Button>
            </div>
          )}
        </div>
      </PageContainer>

      <LeaveCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
        isLoading={createLeave.isPending}
        allowHrTarget={canHrAdmin}
      />

      <ModalShell
        isOpen={!!detailLeave}
        onClose={() => setDetailLeave(null)}
        title="Detail pengajuan"
        subtitle={detailLeave ? `${detailLeave.user.name} · ${new Date(detailLeave.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}` : undefined}
        size="lg"
        footer={
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => setDetailLeave(null)}>
            Tutup
          </Button>
        }
      >
        {detailLeave && (
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Karyawan</dt>
              <dd className="font-medium text-slate-900">{detailLeave.user.name}</dd>
              <dd className="text-slate-600">{detailLeave.user.email}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Jenis (status absensi)</dt>
              <dd className="mt-1">
                <LeaveStatusBadge kind="type" value={String(detailLeave.status)} />
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Alasan</dt>
              <dd className="whitespace-pre-wrap text-slate-800">{detailLeave.leaveReason}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Keputusan</dt>
              <dd className="mt-1">
                <LeaveStatusBadge kind="approval" value={detailLeave.leaveStatus} />
              </dd>
            </div>
            {(detailLeave.approvedAt || detailLeave.approvedBy) && (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
                <p>
                  <span className="font-medium text-slate-700">approvedBy:</span>{' '}
                  {approvedByName ?? '—'}
                </p>
                <p className="mt-1">
                  <span className="font-medium text-slate-700">approvedAt:</span>{' '}
                  {detailLeave.approvedAt ? new Date(detailLeave.approvedAt).toLocaleString('id-ID') : '—'}
                </p>
              </div>
            )}
          </dl>
        )}
      </ModalShell>
    </>
  );
}
