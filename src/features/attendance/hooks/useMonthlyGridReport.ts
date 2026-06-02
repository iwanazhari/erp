import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/services/attendanceApi';
import type { MonthlyGridFilters, MonthlyGridData } from '@/shared/types/attendance';

/**
 * Monthly Grid Query Keys Factory
 */
export const monthlyGridKeys = {
  all: ['monthly-grid'] as const,
  list: (filters: MonthlyGridFilters) => [...monthlyGridKeys.all, filters] as const,
};

/**
 * Hook to fetch monthly attendance grid with daily breakdown per user
 *
 * Uses GET /api/attendance/report/monthly-grid
 * Access: ADMIN, HR, MANAGER
 *
 * Features:
 * - Daily grid for each day of the month
 * - Clock-in/out times with late highlighting (jamMasuk merah)
 * - Leave classification (CUTI_TAHUNAN vs SID)
 * - Attendance percentage based on working days elapsed
 * - Balance info (sisaCuti, sisaSid)
 *
 * @param filters - Query parameters (year, month, q, page, pageSize)
 * @returns Query result with monthly grid data
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useMonthlyGridReport({
 *   year: 2026,
 *   month: 4,
 *   q: 'john',  // search by name/email
 *   page: 1,
 * });
 *
 * // data.users - Array of users with daily breakdown
 * // data.meta - Working days, quota info, notes
 * ```
 */
export function useMonthlyGridReport(filters: MonthlyGridFilters = {}) {
  return useQuery({
    queryKey: monthlyGridKeys.list(filters),
    queryFn: async () => {
      const response = await attendanceApi.getMonthlyGrid(filters);
      return response.data;
    },
    select: (data) => {
      if (data && 'users' in data && 'meta' in data) {
        return data as MonthlyGridData;
      }
      if (data && (data as any).data) {
        return (data as any).data as MonthlyGridData;
      }
      return data as MonthlyGridData;
    },
  });
}

interface ExportState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Hook for exporting monthly grid to Excel
 *
 * @example
 * ```tsx
 * const { exportGrid, exportState } = useMonthlyGridExport();
 *
 * const handleExport = async () => {
 *   await exportGrid({ year: 2026, month: 4 });
 * };
 * ```
 */
export function useMonthlyGridExport() {
  const [exportState, setExportState] = useState<ExportState>({
    loading: false,
    error: null,
    success: false,
  });

  const exportGrid = useCallback(async (filters?: MonthlyGridFilters) => {
    setExportState({ loading: true, error: null, success: false });

    try {
      const blob = await attendanceApi.exportMonthlyGrid(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const year = filters?.year || new Date().getFullYear();
      const month = String(filters?.month || new Date().getMonth() + 1).padStart(2, '0');
      a.download = `Grid_Bulanan_${year}-${month}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportState({ loading: false, error: null, success: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal export data';
      setExportState({ loading: false, error: errorMessage, success: false });
      throw error;
    }
  }, []);

  const resetState = useCallback(() => {
    setExportState({ loading: false, error: null, success: false });
  }, []);

  return { exportGrid, exportState, resetState };
}

export default useMonthlyGridReport;
