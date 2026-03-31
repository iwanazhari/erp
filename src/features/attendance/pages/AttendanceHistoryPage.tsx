import { useState, useCallback, useMemo } from 'react';
import { useAttendanceRecords, useUpdateAttendance } from '@/features/attendance/hooks/useAttendance';
import {
  AttendanceDailyTable,
  AttendanceDetailsModal,
  AttendanceEditModal,
} from '@/features/attendance/components';
import type { AttendanceRecordsFilters, AttendanceRecord } from '@/shared/types/attendance';

const DEFAULT_PAGE_SIZE = 50;

/**
 * Attendance History Page Component
 *
 * Displays all users' attendance records using GET /api/attendance/records endpoint.
 * Simple table view matching the screenshot design with search and date filters.
 */
export default function AttendanceHistoryPage() {
  const [filters, setFilters] = useState<AttendanceRecordsFilters>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  
  // Local filters for search and date range
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Mutation hook for updating attendance
  const updateAttendance = useUpdateAttendance();

  const {
    data,
    isLoading,
    error,
  } = useAttendanceRecords(filters);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
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
    console.log('Edit clicked for record:', record.id, record.user.name);
    setEditingRecord(record);
    setIsEditModalOpen(true);
    console.log('Edit modal should be open now');
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingRecord(null);
  }, []);

  const handleSaveEdit = useCallback(async (editData: { checkIn: string; checkOut: string; status: string; editReason: string }) => {
    if (!editingRecord) return;

    try {
      // Extract date from clockIn (format: YYYY-MM-DD)
      const clockInDate = new Date(editingRecord.clockIn);
      const year = clockInDate.getFullYear();
      const month = (clockInDate.getMonth() + 1).toString().padStart(2, '0');
      const day = clockInDate.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      await updateAttendance.mutateAsync({
        id: editingRecord.id,
        date: dateStr,
        checkIn: editData.checkIn,
        checkOut: editData.checkOut,
        status: editData.status,
        editReason: editData.editReason,
      });
      
      // Close modal on success
      handleCloseEditModal();
      
      // Show success message
      alert('Attendance updated successfully!');
    } catch (error) {
      console.error('Failed to update attendance:', error);
      alert('Failed to update attendance. Please try again.');
    }
  }, [editingRecord, updateAttendance, handleCloseEditModal]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleStartDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  }, []);

  const handleEndDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  }, []);

  // Filter data locally based on search and date range
  const filteredData = useMemo(() => {
    if (!data?.records) return [];

    return data.records.filter((record: AttendanceRecord) => {
      // Search filter by user name
      if (searchQuery && !record.user.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Date range filter
      const recordDate = new Date(record.clockIn);
      recordDate.setHours(0, 0, 0, 0);
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (recordDate < start) return false;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (recordDate > end) return false;
      }
      
      return true;
    });
  }, [data?.records, searchQuery, startDate, endDate]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
          <p className="text-sm text-gray-500 mt-1">
            Lihat semua data attendance dari semua user (Admin)
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error instanceof Error ? error.message : 'Terjadi kesalahan'}</p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cari Nama Karyawan
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Masukkan nama karyawan..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || startDate || endDate) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filters
              </button>
            </div>
          )}

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Menampilkan <span className="font-semibold text-gray-900">{filteredData.length}</span> dari{' '}
              <span className="font-semibold text-gray-900">{data?.records?.length || 0}</span> total records
            </p>
          </div>
        </div>

        {/* Table */}
        <AttendanceDailyTable
          data={filteredData}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
        />

        {/* Pagination */}
        {data?.pagination && (
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(data.pagination!.page - 1)}
              disabled={data.pagination.page <= 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700 flex items-center">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(data.pagination!.page + 1)}
              disabled={data.pagination.page >= data.pagination.totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AttendanceDetailsModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Edit Modal */}
      <AttendanceEditModal
        record={editingRecord}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
        isLoading={updateAttendance.isPending}
      />
    </div>
  );
}
