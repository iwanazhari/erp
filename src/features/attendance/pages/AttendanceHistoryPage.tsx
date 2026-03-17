import { useState, useCallback } from 'react';
import { useAttendanceRecords } from '@/features/attendance/hooks/useAttendance';
import {
  AttendanceHistoryTable,
  AttendanceFilters,
  AttendanceDetailsModal,
  Pagination,
} from '@/features/attendance/components';
import type { AttendanceRecordsFilters, AttendanceRecord } from '@/shared/types/attendance';

const DEFAULT_PAGE_SIZE = 50;

/**
 * Attendance History Page Component
 *
 * Displays all users' attendance records using GET /api/attendance/records endpoint.
 * Admin-only endpoint - comprehensive attendance data with photos, leave info, etc.
 *
 * Features:
 * - View all attendance data from all users (clock in & clock out)
 * - No companyId filter - ADMIN can see all data from all companies
 * - Optional filters: date range, status, clockOutStatus
 * - Pagination support (default 50, max 100 per page)
 *
 * Response format:
 * {
 *   success: true,
 *   message: "OK",
 *   data: {
 *     records: [...],
 *     pagination: { page, pageSize, total, totalPages }
 *   }
 * }
 */
export default function AttendanceHistoryPage() {
  const [filters, setFilters] = useState<AttendanceRecordsFilters>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data,
    isLoading,
    error,
  } = useAttendanceRecords(filters);

  const handleFilterChange = useCallback((newFilters: AttendanceRecordsFilters) => {
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
              <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
              <p className="text-sm text-gray-500 mt-1">
                Lihat semua data attendance dari semua user (Admin)
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
        {data?.pagination && (
          <div className="mt-4 bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {data.pagination.total || 0}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Total Records
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{data.pagination.totalPages || 0}</p>
                <p className="text-sm text-blue-700 mt-1">Total Pages</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{data.pagination.pageSize || DEFAULT_PAGE_SIZE}</p>
                <p className="text-sm text-purple-700 mt-1">Per Page</p>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
          <AttendanceHistoryTable
            attendances={data?.records || []}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
          />

          {/* Pagination */}
          {data?.pagination && (
            <Pagination
              currentPage={data.pagination.page || 1}
              totalPages={data.pagination.totalPages || 0}
              totalRecords={data.pagination.total || 0}
              pageSize={data.pagination.pageSize || DEFAULT_PAGE_SIZE}
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
