import { useState, useCallback } from 'react';
import { useAttendanceHistory } from '@/features/attendance/hooks/useAttendance';
import {
  AttendanceHistoryTable,
  AttendanceFilters,
  AttendanceDetailsModal,
  Pagination,
} from '@/features/attendance/components';
import type { AttendanceHistoryFilters, AttendanceRecord } from '@/shared/types/attendance';

const DEFAULT_PAGE_SIZE = 20;

export default function AttendanceHistoryPage() {
  const [filters, setFilters] = useState<AttendanceHistoryFilters>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data,
    isLoading,
    error,
  } = useAttendanceHistory(filters);

  const handleFilterChange = useCallback((newFilters: AttendanceHistoryFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to page 1 when filters change
    }));
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
              <p className="text-sm text-gray-500 mt-1">
                Lihat riwayat attendance semua karyawan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-600 mt-1">{error instanceof Error ? error.message : 'Terjadi kesalahan'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <AttendanceFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={() => {}}
          isLoading={isLoading}
        />

        {/* Stats Summary */}
        {data && (
          <div className="mt-4 bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{data.total}</p>
                <p className="text-sm text-green-700 mt-1">Total Records</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{data.totalPages}</p>
                <p className="text-sm text-blue-700 mt-1">Total Pages</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{data.pageSize}</p>
                <p className="text-sm text-purple-700 mt-1">Per Page</p>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
          <AttendanceHistoryTable
            records={data?.records || []}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
          />

          {/* Pagination */}
          {data && (
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              totalRecords={data.total}
              pageSize={data.pageSize}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      {/* Details Modal */}
      <AttendanceDetailsModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
