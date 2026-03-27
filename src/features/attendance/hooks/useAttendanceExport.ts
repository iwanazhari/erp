import { useState, useCallback } from 'react';
import { attendanceApi } from '@/services/attendanceApi';
import type {
  MonthlyReportExportFilters,
  HistoryExportFilters,
  AllRecordsExportFilters,
} from '@/shared/types/attendance';
import {
  getMonthlyReportFilename,
  getHistoryFilename,
  getAllRecordsFilename,
  handleExcelDownload,
} from '@/utils/attendanceExcelExport';

interface ExportState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface UseAttendanceExportReturn {
  exportState: ExportState;
  exportMonthlyReport: (filters?: MonthlyReportExportFilters) => Promise<void>;
  exportHistory: (filters?: HistoryExportFilters) => Promise<void>;
  exportAllRecords: (filters?: AllRecordsExportFilters) => Promise<void>;
  resetState: () => void;
}

/**
 * Hook for handling attendance Excel exports
 * 
 * Provides methods to export:
 * - Monthly Report (ADMIN, MANAGER)
 * - Attendance History (ADMIN, MANAGER)
 * - All Records (ADMIN ONLY)
 * 
 * @example
 * ```tsx
 * const { exportMonthlyReport, exportState } = useAttendanceExport();
 * 
 * const handleExport = async () => {
 *   await exportMonthlyReport({ year: 2026, month: 3 });
 * };
 * ```
 */
export function useAttendanceExport(): UseAttendanceExportReturn {
  const [exportState, setExportState] = useState<ExportState>({
    loading: false,
    error: null,
    success: false,
  });

  /**
   * Export Monthly Report to Excel
   */
  const exportMonthlyReport = useCallback(async (filters?: MonthlyReportExportFilters) => {
    setExportState({ loading: true, error: null, success: false });

    try {
      const blob = await attendanceApi.exportMonthlyReport(filters);
      const filename = getMonthlyReportFilename(filters?.year, filters?.month);
      
      // Get content-disposition from response headers (if available)
      // Note: This requires the backend to expose headers in the response
      handleExcelDownload(blob, null, filename);
      
      setExportState({ loading: false, error: null, success: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal export data';
      setExportState({ loading: false, error: errorMessage, success: false });
      throw error;
    }
  }, []);

  /**
   * Export Attendance History to Excel
   */
  const exportHistory = useCallback(async (filters?: HistoryExportFilters) => {
    setExportState({ loading: true, error: null, success: false });

    try {
      const blob = await attendanceApi.exportHistory(filters);
      const filename = getHistoryFilename(filters?.startDate, filters?.endDate);
      
      handleExcelDownload(blob, null, filename);
      
      setExportState({ loading: false, error: null, success: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal export data';
      setExportState({ loading: false, error: errorMessage, success: false });
      throw error;
    }
  }, []);

  /**
   * Export All Attendance Records to Excel (ADMIN ONLY)
   */
  const exportAllRecords = useCallback(async (filters?: AllRecordsExportFilters) => {
    setExportState({ loading: true, error: null, success: false });

    try {
      const blob = await attendanceApi.exportAllRecords(filters);
      const filename = getAllRecordsFilename(filters?.startDate, filters?.endDate);
      
      handleExcelDownload(blob, null, filename);
      
      setExportState({ loading: false, error: null, success: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal export data';
      
      // Check for permission error
      if (error.response?.status === 403) {
        setExportState({
          loading: false,
          error: 'Akses ditolak. Hanya ADMIN yang dapat export semua data attendance.',
          success: false,
        });
      } else {
        setExportState({ loading: false, error: errorMessage, success: false });
      }
      
      throw error;
    }
  }, []);

  /**
   * Reset export state
   */
  const resetState = useCallback(() => {
    setExportState({ loading: false, error: null, success: false });
  }, []);

  return {
    exportState,
    exportMonthlyReport,
    exportHistory,
    exportAllRecords,
    resetState,
  };
}

export default useAttendanceExport;
