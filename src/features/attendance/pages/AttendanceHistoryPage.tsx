import { useState, useCallback, useMemo } from 'react';
import { useAttendanceRecords } from '@/features/attendance/hooks/useAttendance';
import {
  AttendanceDailyTable,
  AttendanceDetailsModal,
  AttendanceEditModal,
} from '@/features/attendance/components';
import CreateManualAttendanceModal from '@/features/attendance/components/CreateManualAttendanceModal';
import type { AttendanceRecordsFilters, AttendanceRecord } from '@/shared/types/attendance';

const DEFAULT_PAGE_SIZE = 100;

function getTodayInIndonesia(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Jakarta',
  };
  const parts = new Intl.DateTimeFormat('id-ID', options).formatToParts(now);
  const year = parts.find((p) => p.type === 'year')?.value || '';
  const month = parts.find((p) => p.type === 'month')?.value || '';
  const day = parts.find((p) => p.type === 'day')?.value || '';
  return `${year}-${month}-${day}`;
}

export default function AttendanceHistoryPage() {
  const [filters, setFilters] = useState<AttendanceRecordsFilters>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const today = getTodayInIndonesia();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const apiFilters = useMemo<AttendanceRecordsFilters>(() => {
    return {
      page: filters.page,
      pageSize: filters.pageSize,
      startDate: startDate,
      endDate: endDate,
    };
  }, [filters.page, filters.pageSize, startDate, endDate]);

  const { data, isLoading, error } = useAttendanceRecords(apiFilters);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    const today = getTodayInIndonesia();
    setStartDate(today);
    setEndDate(today);
    setFilters({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  }, []);

  const handleViewDetails = useCallback((record: AttendanceRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  }, []);

  const handleEdit = useCallback((record: AttendanceRecord) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingRecord(null);
  }, []);

  const handleCreateAttendance = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleSaveEdit = useCallback(async (editData: { checkIn: string; checkOut: string; status: string; editReason: string }) => {
    if (!editingRecord) {
      alert('Tidak ada data attendance yang dipilih untuk diedit.');
      return;
    }

    if (!editingRecord.id) {
      alert('ID attendance tidak ditemukan. Untuk user yang belum absen, gunakan tombol "Buat Absensi Manual".');
      return;
    }

    try {
      const clockInDate = new Date(editingRecord.clockIn);
      const year = clockInDate.getFullYear();
      const month = (clockInDate.getMonth() + 1).toString().padStart(2, '0');
      const day = clockInDate.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const { privateApi } = await import('@/services/authApi');
      await privateApi.put(`/attendance/${editingRecord.id}`, {
        status: editData.status,
        editReason: editData.editReason,
        clockIn: editData.checkIn ? new Date(`${dateStr}T${editData.checkIn}:00`).toISOString() : undefined,
        clockOut: editData.checkOut ? new Date(`${dateStr}T${editData.checkOut}:00`).toISOString() : undefined,
      });

      handleCloseEditModal();
      alert('Attendance updated successfully!');
    } catch (error: any) {
      console.error('Error updating attendance:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to update attendance. Please try again.';
      alert(`Error: ${errorMessage}`);
    }
  }, [editingRecord, handleCloseEditModal]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
              <p className="text-sm text-gray-500 mt-1">
                Menampilkan <strong>semua user</strong> dengan data attendance
              </p>
            </div>
            <button
              onClick={handleCreateAttendance}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
              title="Buat record attendance untuk user yang belum absen karena masalah teknis"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Buat Absensi Manual
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error instanceof Error ? error.message : 'Terjadi kesalahan'}</p>
          </div>
        )}

        <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">📅 Filter Tanggal</h3>
            <p className="text-xs text-gray-500">Default: hari ini</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-end gap-2 md:col-span-2">
              <button onClick={handleApplyFilters} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Terapkan Filter
              </button>
              <button onClick={handleClearFilters} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Reset ke Hari Ini
              </button>
            </div>
          </div>
          {(startDate !== today || endDate !== today) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                Dari: {startDate}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                Sampai: {endDate}
              </span>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Total <span className="font-semibold text-gray-900">{data?.records?.length || 0}</span> user
              {data?.pagination && data.pagination.totalPages > 1 && (
                <span className="ml-2 text-gray-500">
                  (halaman {data.pagination.page} dari {data.pagination.totalPages}, total {data.pagination.total} records)
                </span>
              )}
            </p>
          </div>
        </div>

        <AttendanceDailyTable
          data={data?.records || []}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
        />

        {data?.pagination && (
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(data.pagination!.page - 1)}
              disabled={data.pagination.page <= 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">Page {data.pagination.page} of {data.pagination.totalPages}</span>
            <button
              onClick={() => handlePageChange(data.pagination!.page + 1)}
              disabled={data.pagination.page >= data.pagination.totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        <AttendanceDetailsModal record={selectedRecord} isOpen={isModalOpen} onClose={handleCloseModal} />
        <AttendanceEditModal record={editingRecord} isOpen={isEditModalOpen} onClose={handleCloseEditModal} onSave={handleSaveEdit} isLoading={false} />
        <CreateManualAttendanceModal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} onSuccess={handleCreateSuccess} />
      </div>
    </div>
  );
}
