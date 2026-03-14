import { useState } from 'react';
import type { AttendanceHistoryFilters } from '@/shared/types/attendance';

interface AttendanceFiltersProps {
  filters: AttendanceHistoryFilters;
  onFilterChange: (filters: AttendanceHistoryFilters) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

export function AttendanceFilters({
  filters,
  onFilterChange,
  onSearch,
  isLoading,
}: AttendanceFiltersProps) {
  const [localFilters, setLocalFilters] = useState<AttendanceHistoryFilters>({ ...filters });

  const handleInputChange = (key: keyof AttendanceHistoryFilters, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onFilterChange(localFilters);
    onSearch();
  };

  const handleReset = () => {
    const emptyFilters: AttendanceHistoryFilters = {};
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={localFilters.startDate || ''}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Akhir
          </label>
          <input
            type="date"
            value={localFilters.endDate || ''}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="present">Hadir</option>
            <option value="late">Terlambat</option>
            <option value="leave">Cuti</option>
            <option value="absent">Tidak Hadir</option>
          </select>
        </div>

        {/* Company (optional - can be enabled if needed) */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
          <input
            type="text"
            value={localFilters.companyId || ''}
            onChange={(e) => handleInputChange('companyId', e.target.value)}
            placeholder="Company ID"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div> */}

        {/* User (optional - can be enabled if needed) */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User ID
          </label>
          <input
            type="text"
            value={localFilters.userId || ''}
            onChange={(e) => handleInputChange('userId', e.target.value)}
            placeholder="User ID"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div> */}

        {/* Action Buttons */}
        <div className="flex items-end gap-2">
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Cari
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default AttendanceFilters;
