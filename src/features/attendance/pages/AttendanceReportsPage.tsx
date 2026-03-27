import { useState } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import ExportButtons from '@/features/attendance/components/ExportButtons';
import { useAttendanceExport } from '@/features/attendance/hooks/useAttendanceExport';
import type {
  MonthlyReportExportFilters,
  HistoryExportFilters,
  AllRecordsExportFilters,
} from '@/shared/types/attendance';

/**
 * Attendance Reports Page
 * 
 * Provides Excel export functionality for attendance data.
 * Supports 3 export types:
 * - Monthly Report (ADMIN, MANAGER)
 * - Attendance History (ADMIN, MANAGER)
 * - All Records (ADMIN ONLY)
 * 
 * Features:
 * - Date range filters
 * - Status filters
 * - User search
 * - Real-time export status
 * - Error handling
 * 
 * @access ADMIN, MANAGER
 */
export default function AttendanceReportsPage() {
  // Monthly Report Filters
  const [monthlyFilters, setMonthlyFilters] = useState<MonthlyReportExportFilters>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    q: '',
  });

  // History Export Filters
  const [historyFilters, setHistoryFilters] = useState<HistoryExportFilters>({
    startDate: '',
    endDate: '',
    userId: '',
    status: undefined,
  });

  // All Records Export Filters
  const [allRecordsFilters, setAllRecordsFilters] = useState<AllRecordsExportFilters>({
    startDate: '',
    endDate: '',
    status: undefined,
    clockOutStatus: undefined,
  });

  // Active tab
  const [activeTab, setActiveTab] = useState<'monthly' | 'history' | 'allRecords'>('monthly');

  const { exportState } = useAttendanceExport();

  // Get current year and month for display
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Month names for display
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  return (
    <PageContainer title="📊 Laporan Attendance">
      <div className="space-y-6">
        {/* Export Type Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('monthly')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'monthly'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              📅 Laporan Bulanan
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              📋 Riwayat Attendance
            </button>
            <button
              onClick={() => setActiveTab('allRecords')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'allRecords'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              📁 Semua Data (ADMIN)
            </button>
          </nav>
        </div>

        {/* Monthly Report Tab */}
        {activeTab === 'monthly' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Export Laporan Bulanan
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Download rekap bulanan attendance semua user dalam format Excel dengan 2 sheet:
                Rekap Bulanan dan Statistik.
              </p>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tahun
                  </label>
                  <select
                    value={monthlyFilters.year || currentYear}
                    onChange={(e) => setMonthlyFilters({ ...monthlyFilters, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bulan
                  </label>
                  <select
                    value={monthlyFilters.month || currentMonth}
                    onChange={(e) => setMonthlyFilters({ ...monthlyFilters, month: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {monthNames.map((month, index) => (
                      <option key={index + 1} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cari User (Opsional)
                  </label>
                  <input
                    type="text"
                    value={monthlyFilters.q || ''}
                    onChange={(e) => setMonthlyFilters({ ...monthlyFilters, q: e.target.value })}
                    placeholder="Nama atau email..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Export Button */}
              <ExportButtons
                showMonthly
                defaultMonthlyFilters={monthlyFilters}
                className="justify-start"
              />

              {/* Info */}
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-800">
                  <strong>📊 Sheet yang akan diexport:</strong>
                </p>
                <ul className="mt-2 text-sm text-emerald-700 space-y-1">
                  <li>• <strong>Rekap Bulanan:</strong> Ringkasan attendance semua user (Hadir, Terlambat, Alpa, Izin, Sakit)</li>
                  <li>• <strong>Statistik:</strong> Total statistik attendance untuk periode {monthNames[(monthlyFilters.month || currentMonth) - 1]} {monthlyFilters.year || currentYear}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Export Riwayat Attendance
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Download riwayat attendance dengan detail lengkap dalam format Excel.
              </p>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={historyFilters.startDate || ''}
                    onChange={(e) => setHistoryFilters({ ...historyFilters, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    value={historyFilters.endDate || ''}
                    onChange={(e) => setHistoryFilters({ ...historyFilters, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status (Opsional)
                  </label>
                  <select
                    value={historyFilters.status || ''}
                    onChange={(e) => setHistoryFilters({ ...historyFilters, status: e.target.value as any || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Semua Status</option>
                    <option value="HADIR">Hadir</option>
                    <option value="TERLAMBAT">Terlambat</option>
                    <option value="ALPA">Alpa</option>
                    <option value="IZIN">Izin</option>
                    <option value="SAKIT">Sakit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID (Opsional)
                  </label>
                  <input
                    type="text"
                    value={historyFilters.userId || ''}
                    onChange={(e) => setHistoryFilters({ ...historyFilters, userId: e.target.value })}
                    placeholder="UUID user..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Export Button */}
              <ExportButtons
                showHistory
                defaultHistoryFilters={historyFilters}
                className="justify-start"
              />

              {/* Info */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>📋 Data yang akan diexport:</strong>
                </p>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• Detail attendance: Clock In/Out time, lokasi, status, payment</li>
                  <li>• Info user: Nama, email, role</li>
                  <li>• Info kantor: Nama, alamat, shift</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* All Records Tab */}
        {activeTab === 'allRecords' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Export Semua Data Attendance
                </h3>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-6">
                Download semua data attendance dengan informasi lengkap dalam format Excel dengan 3 sheet.
              </p>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={allRecordsFilters.startDate || ''}
                    onChange={(e) => setAllRecordsFilters({ ...allRecordsFilters, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    value={allRecordsFilters.endDate || ''}
                    onChange={(e) => setAllRecordsFilters({ ...allRecordsFilters, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status (Opsional)
                  </label>
                  <select
                    value={allRecordsFilters.status || ''}
                    onChange={(e) => setAllRecordsFilters({ ...allRecordsFilters, status: e.target.value as any || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Semua Status</option>
                    <option value="HADIR">Hadir</option>
                    <option value="TERLAMBAT">Terlambat</option>
                    <option value="ALPA">Alpa</option>
                    <option value="IZIN">Izin</option>
                    <option value="SAKIT">Sakit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clock Out Status (Opsional)
                  </label>
                  <select
                    value={allRecordsFilters.clockOutStatus || ''}
                    onChange={(e) => setAllRecordsFilters({ ...allRecordsFilters, clockOutStatus: e.target.value as any || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Semua Status</option>
                    <option value="ON_TIME">Tepat Waktu</option>
                    <option value="LATE">Terlambat</option>
                    <option value="EARLY">Pulang Cepat</option>
                    <option value="NORMAL">Normal</option>
                  </select>
                </div>
              </div>

              {/* Export Button */}
              <ExportButtons
                showAllRecords
                defaultAllRecordsFilters={allRecordsFilters}
                className="justify-start"
              />

              {/* Info */}
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>📁 Sheet yang akan diexport:</strong>
                </p>
                <ul className="mt-2 text-sm text-purple-700 space-y-1">
                  <li>• <strong>Semua Data:</strong> 50+ kolom dengan informasi lengkap (user, attendance, payment, leave, dll)</li>
                  <li>• <strong>Summary per User:</strong> Ringkasan attendance per user</li>
                  <li>• <strong>Statistik:</strong> Statistik global untuk periode yang dipilih</li>
                </ul>
              </div>

              {/* Warning */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Perhatian:</strong> Export ini hanya tersedia untuk ADMIN. File yang dihasilkan mungkin berukuran besar tergantung periode yang dipilih.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Global Export Status */}
        {exportState.loading && (
          <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border-l-4 border-blue-500 flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
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
            <div>
              <p className="font-medium text-gray-900">Sedang mengexport data...</p>
              <p className="text-sm text-gray-600">File Excel sedang disiapkan untuk download</p>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
