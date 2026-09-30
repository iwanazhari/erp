import { useState, useMemo } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useToast } from '@/components/ui/ToastContext';
import {
  useSchedules,
  useCreateSchedule,
  useUpdateSchedule,
  useCancelSchedule,
  useDeleteSchedule,
  useLocations,
} from '@/features/schedule/hooks/useSchedules';
import {
  ScheduleModal,
  ScheduleTable,
  ScheduleFilters,
} from '@/features/schedule/components';
import ScheduleDetailModal from '@/features/schedule/components/ScheduleDetailModal';
import { scheduleApi } from '@/services/scheduleApi';
import { handleScheduleError } from '@/features/schedule/utils/scheduleHelpers';
import { exportSchedulesToCSV } from '@/utils/exportToCsv';
import type { Schedule, CreateScheduleInput, UpdateScheduleInput, ScheduleFilters as ScheduleFilterType } from '@/shared/types/schedule';

export default function SchedulePage() {
  const toast = useToast();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailSchedule, setDetailSchedule] = useState<any>(null);
  const [detailAttendances, setDetailAttendances] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<ScheduleFilterType>({
    page: 1,
    limit: 20,
    scheduleKind: 'TECHNICIAN',
  });

  const { data: schedulesData, isLoading: isLoadingSchedules } = useSchedules(filters);
  const { data: locationsData } = useLocations({ isActive: true, limit: 100 });

  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const cancelMutation = useCancelSchedule();
  const deleteMutation = useDeleteSchedule();

  const schedules = useMemo(() => {
    const raw = schedulesData?.data as any;
    // Backend returns: { data: { data: [...], pagination: {...} } }
    if (raw && Array.isArray(raw.data)) return raw.data as Schedule[];
    if (Array.isArray(raw)) return raw as Schedule[];
    return [];
  }, [schedulesData]);
  const locations = useMemo(() => {
    const raw = locationsData?.data as any;
    if (raw && Array.isArray(raw.data)) return raw.data as Location[];
    if (Array.isArray(raw)) return raw as Location[];
    return [];
  }, [locationsData]);

  const handleCreateClick = () => {
    setSelectedSchedule(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleRowClick = async (schedule: Schedule) => {
    setDetailSchedule(schedule);
    setDetailAttendances([]);
    setDetailLoading(true);
    try {
      const response = await scheduleApi.getById(schedule.id);
      if (response.success && response.data) {
        setDetailAttendances((response.data as any).attendances || []);
      }
    } catch (error) {
      console.error('Failed to fetch schedule detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setDetailSchedule(null);
    setDetailAttendances([]);
  };

  const handleRefreshDetail = async () => {
    if (!detailSchedule) return;
    try {
      const response = await scheduleApi.getById(detailSchedule.id);
      if (response.success && response.data) {
        setDetailSchedule(response.data as any);
        setDetailAttendances((response.data as any).attendances || []);
      }
    } catch (error) {
      console.error('Failed to refresh schedule detail:', error);
    }
  };

  const handleCancelSchedule = async () => {
    if (!selectedSchedule) return;

    const confirmed = window.confirm(
      'Apakah Anda yakin ingin membatalkan jadwal ini?'
    );
    if (!confirmed) return;

    try {
      await cancelMutation.mutateAsync(selectedSchedule.id);
      toast.success('Jadwal berhasil dibatalkan!');
      setIsModalOpen(false);
    } catch (error) {
      toast.error(handleScheduleError(error));
    }
  };

  const handleDeleteSchedule = async () => {
    if (!selectedSchedule) return;

    const confirmed = window.confirm(
      'Apakah Anda yakin ingin menghapus jadwal ini? Aksi ini tidak dapat dibatalkan.'
    );
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync({ scheduleId: selectedSchedule.id, reason: 'Dihapus oleh admin' });
      toast.success('Jadwal berhasil dihapus!');
      setIsModalOpen(false);
    } catch (error) {
      toast.error(handleScheduleError(error));
    }
  };

  const handleSubmit = async (data: CreateScheduleInput | UpdateScheduleInput) => {
    try {
      if (modalMode === 'create') {
        await createMutation.mutateAsync(data as CreateScheduleInput);
        toast.success('Jadwal berhasil dibuat!');
        setIsModalOpen(false);
      } else if (modalMode === 'edit' && selectedSchedule) {
        await updateMutation.mutateAsync({
          scheduleId: selectedSchedule.id,
          data: data as UpdateScheduleInput,
        });
        toast.success('Jadwal berhasil diperbarui!');
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error(handleScheduleError(error));
      throw error;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
  };

  const handleFilterChange = (newFilters: ScheduleFilterType) => {
    setFilters({
      ...newFilters,
      page: 1,
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Tarik seluruh hasil filter (bukan hanya 20 baris di tabel), lalu export.
      const all = await scheduleApi.getAllPaged(filters);
      if (all.length === 0) {
        toast.warning('Tidak ada jadwal untuk diekspor');
        return;
      }
      exportSchedulesToCSV(all, 'jadwal');
      toast.success(`${all.length} jadwal diekspor ke CSV`);
    } catch (error) {
      toast.error('Gagal mengekspor jadwal. Coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageContainer title="Jadwal Teknisi">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <p className="text-slate-600">
            Kelola penjadwalan teknisi di lokasi tertentu
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              leftIcon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
            >
              {isExporting ? 'Menyiapkan...' : 'Export CSV'}
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={handleCreateClick}>
              + Buat jadwal
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card padding="md">
          <ScheduleFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            locations={(locations as any[]).map((loc: any) => ({ id: loc.id, name: loc.name }))}
          />
        </Card>

        {/* Schedule Table */}
        <ScheduleTable
          schedules={schedules}
          onRowClick={handleRowClick}
          isLoading={isLoadingSchedules}
        />

        {/* Pagination Info */}
        {schedulesData?.pagination && (
          <div className="flex items-center justify-between text-sm text-slate-600">
            <p>
              Menampilkan {schedules.length} dari {schedulesData.pagination.total} jadwal
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                disabled={!filters.page || filters.page <= 1}
              >
                Previous
              </Button>
              <span>
                Page {filters.page || 1} of {schedulesData.pagination.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                disabled={!filters.page || filters.page >= schedulesData.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        schedule={selectedSchedule || undefined}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        mode={modalMode}
        onEdit={() => {
          setModalMode('edit');
        }}
        onCancel={handleCancelSchedule}
        onDelete={handleDeleteSchedule}
      />

      {/* Detail Modal — tampilan persis build 11 Agustus (tab Catatan Kehadiran + Hasil Kerja) */}
      <ScheduleDetailModal
        isOpen={!!detailSchedule && !detailLoading}
        onClose={handleCloseDetail}
        schedule={detailSchedule}
        attendances={detailAttendances}
        onAttendanceUpdated={handleRefreshDetail}
        onScheduleUpdated={handleRefreshDetail}
      />
    </PageContainer>
  );
}
