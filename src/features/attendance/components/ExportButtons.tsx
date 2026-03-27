import { useState } from 'react';
import { useAttendanceExport } from '../hooks/useAttendanceExport';
import type {
  MonthlyReportExportFilters,
  HistoryExportFilters,
  AllRecordsExportFilters,
} from '@/shared/types/attendance';

interface ExportButtonsProps {
  /** Show monthly report export button */
  showMonthly?: boolean;
  /** Show history export button */
  showHistory?: boolean;
  /** Show all records export button (ADMIN only) */
  showAllRecords?: boolean;
  /** Default filters for monthly report */
  defaultMonthlyFilters?: MonthlyReportExportFilters;
  /** Default filters for history export */
  defaultHistoryFilters?: HistoryExportFilters;
  /** Default filters for all records export */
  defaultAllRecordsFilters?: AllRecordsExportFilters;
  /** Callback when export starts */
  onExportStart?: () => void;
  /** Callback when export completes successfully */
  onExportSuccess?: () => void;
  /** Callback when export fails */
  onExportError?: (error: string) => void;
  /** Custom class name */
  className?: string;
}

/**
 * ExportButtons Component
 * 
 * Provides buttons for exporting attendance data to Excel.
 * Supports 3 export types: Monthly Report, History, and All Records.
 * 
 * Features:
 * - Loading state during export
 * - Error handling and display
 * - Success feedback
 * - Customizable buttons
 * 
 * @example
 * ```tsx
 * <ExportButtons
 *   showMonthly
 *   showHistory
 *   showAllRecords
 *   defaultMonthlyFilters={{ year: 2026, month: 3 }}
 * />
 * ```
 */
export default function ExportButtons({
  showMonthly = false,
  showHistory = false,
  showAllRecords = false,
  defaultMonthlyFilters,
  defaultHistoryFilters,
  defaultAllRecordsFilters,
  onExportStart,
  onExportSuccess,
  onExportError,
  className = '',
}: ExportButtonsProps) {
  const { exportState, exportMonthlyReport, exportHistory, exportAllRecords } = useAttendanceExport();
  const [activeExport, setActiveExport] = useState<string | null>(null);

  const handleMonthlyExport = async () => {
    setActiveExport('monthly');
    onExportStart?.();

    try {
      await exportMonthlyReport(defaultMonthlyFilters);
      onExportSuccess?.();
    } catch (error: any) {
      onExportError?.(error.message || 'Gagal export monthly report');
    } finally {
      setActiveExport(null);
    }
  };

  const handleHistoryExport = async () => {
    setActiveExport('history');
    onExportStart?.();

    try {
      await exportHistory(defaultHistoryFilters);
      onExportSuccess?.();
    } catch (error: any) {
      onExportError?.(error.message || 'Gagal export history');
    } finally {
      setActiveExport(null);
    }
  };

  const handleAllRecordsExport = async () => {
    setActiveExport('allRecords');
    onExportStart?.();

    try {
      await exportAllRecords(defaultAllRecordsFilters);
      onExportSuccess?.();
    } catch (error: any) {
      onExportError?.(error.message || 'Gagal export all records');
    } finally {
      setActiveExport(null);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {showMonthly && (
        <button
          onClick={handleMonthlyExport}
          disabled={exportState.loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-colors"
          title="Export laporan bulanan attendance ke Excel"
        >
          {activeExport === 'monthly' ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>📊 Export Monthly Report</span>
            </>
          )}
        </button>
      )}

      {showHistory && (
        <button
          onClick={handleHistoryExport}
          disabled={exportState.loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          title="Export riwayat attendance ke Excel"
        >
          {activeExport === 'history' ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>📋 Export History</span>
            </>
          )}
        </button>
      )}

      {showAllRecords && (
        <button
          onClick={handleAllRecordsExport}
          disabled={exportState.loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors"
          title="Export semua data attendance (ADMIN only)"
        >
          {activeExport === 'allRecords' ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>📁 Export All Records</span>
            </>
          )}
        </button>
      )}

      {exportState.error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{exportState.error}</span>
        </div>
      )}

      {exportState.success && (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Export berhasil! File sedang di-download.</span>
        </div>
      )}
    </div>
  );
}
