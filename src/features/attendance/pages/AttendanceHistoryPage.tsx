import { useState, useCallback, useMemo } from 'react';
import { useAttendanceRecords } from '@/features/attendance/hooks/useAttendance';
import { userApi } from '@/services/userApi';
import type { UserOption } from '@/services/userApi';
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
 * Displays ALL attendance records with server-side filtering:
 * - **Filter per tanggal**: startDate & endDate (passed to API)
 * - **Filter per user**: userId (passed to API)
 *
 * Uses GET /api/attendance/records endpoint (ADMIN only - no companyId filter).
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

  // Server-side filters (passed to API)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  // User search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounced user search
  const searchTimeout = useMemo(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (query: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        if (query.trim().length >= 2) {
          setIsSearching(true);
          try {
            const response = await userApi.searchUsers(query.trim());
            setSearchResults(response.data.users || []);
            setShowDropdown(true);
          } catch {
            setSearchResults([]);
          } finally {
            setIsSearching(false);
          }
        } else {
          setSearchResults([]);
          setShowDropdown(false);
        }
      }, 400);
      return timeoutId;
    };
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    searchTimeout(value);
  }, [searchTimeout]);

  const handleSelectUser = useCallback((user: UserOption) => {
    setSelectedUserId(user.id);
    setSearchQuery(user.name);
    setShowDropdown(false);
  }, []);

  const handleClearUser = useCallback(() => {
    setSelectedUserId('');
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  }, []);

  // Build server-side filters for /attendance/records
  const apiFilters = useMemo<AttendanceRecordsFilters>(() => {
    const f: AttendanceRecordsFilters = {
      page: filters.page,
      pageSize: filters.pageSize,
    };

    if (startDate) f.startDate = startDate;
    if (endDate) f.endDate = endDate;

    return f;
  }, [filters.page, filters.pageSize, startDate, endDate]);

  const {
    data,
    isLoading,
    error,
  } = useAttendanceRecords(apiFilters);

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
    setEditingRecord(record);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingRecord(null);
  }, []);

  const handleSaveEdit = useCallback(async (editData: { checkIn: string; checkOut: string; status: string; editReason: string }) => {
    if (!editingRecord) return;

    try {
      const clockInDate = new Date(editingRecord.clockIn);
      const year = clockInDate.getFullYear();
      const month = (clockInDate.getMonth() + 1).toString().padStart(2, '0');
      const day = clockInDate.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Use privateApi directly for the update
      const { privateApi } = await import('@/services/authApi');
      await privateApi.put(`/attendance/${editingRecord.id}`, {
        status: editData.status,
        editReason: editData.editReason,
        clockIn: editData.checkIn ? new Date(`${dateStr}T${editData.checkIn}:00`).toISOString() : undefined,
        clockOut: editData.checkOut ? new Date(`${dateStr}T${editData.checkOut}:00`).toISOString() : undefined,
      });

      handleCloseEditModal();
      alert('Attendance updated successfully!');
    } catch {
      alert('Failed to update attendance. Please try again.');
    }
  }, [editingRecord, handleCloseEditModal]);

  const handleApplyFilters = useCallback(() => {
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setStartDate('');
    setEndDate('');
    setSelectedUserId('');
    setSearchQuery('');
    setFilters({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  }, []);

  // Check if any filter is active
  const hasActiveFilters = startDate || endDate;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Filter <strong>per tanggal</strong> dan <strong>per user</strong>
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error instanceof Error ? error.message : 'Terjadi kesalahan'}</p>
          </div>
        )}

        {/* Filters - Server-side */}
        <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">🔍 Filter Server-side</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📅 Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📅 Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* User Search with Dropdown */}
            <div className="md:col-span-1 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                👤 Cari User
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  placeholder="Ketik nama (min 2 huruf)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                {selectedUserId && (
                  <button
                    onClick={handleClearUser}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Hapus filter user"
                  >
                    ✕
                  </button>
                )}
                {isSearching && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Dropdown Results */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email} • {user.role}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Apply Button */}
            <div className="flex items-end">
              <button
                onClick={handleApplyFilters}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                🔍 Terapkan Filter
              </button>
            </div>
          </div>

          {/* Active Filters Indicator */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {startDate && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  📅 Dari: {startDate}
                </span>
              )}
              {endDate && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  📅 Sampai: {endDate}
                </span>
              )}
              {selectedUserId && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  👤 {searchQuery}
                </span>
              )}
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200"
              >
                ✕ Hapus Semua
              </button>
            </div>
          )}

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Menampilkan <span className="font-semibold text-gray-900">{data?.records?.length || 0}</span>{' '}
              {hasActiveFilters ? '(terfilter) ' : ''}
              dari total <span className="font-semibold text-gray-900">{data?.pagination?.total || 0}</span> records
            </p>
          </div>
        </div>

        {/* Table */}
        <AttendanceDailyTable
          data={data?.records || []}
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
        isLoading={false}
      />
    </div>
  );
}
