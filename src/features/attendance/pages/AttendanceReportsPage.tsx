import { useState, useEffect } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import ExportButtons from '@/features/attendance/components/ExportButtons';
import { useAttendanceExport } from '@/features/attendance/hooks/useAttendanceExport';
import MonthlyGridReportPage from '@/features/attendance/pages/MonthlyGridReportPage';
import DeferredPaymentReportPage from '@/features/attendance/pages/DeferredPaymentReportPage';
import { userApi, type UserOption } from '@/services/userApi';
import type {
  HistoryExportFilters,
  AllRecordsExportFilters,
} from '@/shared/types/attendance';

/**
 * Reports Page
 *
 * Main entry point for all attendance and payment reports with filter support:
 * - Grid Bulanan: Daily attendance grid per user (filter per tanggal + per user)
 * - Riwayat: Attendance history (filter per tanggal + per user)
 * - Semua Data: All records export (filter per tanggal)
 * - Pembayaran: Deferred payment report (filter per tanggal + per teknisi)
 */
export default function Reports() {
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

  // User dropdown state
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load users on mount
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await userApi.getAllUsers();
        console.log('User API response:', response);
        // Extract users from response (handles both array and object formats)
        const users = userApi.extractUsers(response);
        if (users.length > 0) {
          // Sort users by name
          const sortedUsers = users.sort((a, b) => 
            a.name.localeCompare(b.name)
          );
          setUserOptions(sortedUsers);
          console.log('Users loaded:', sortedUsers.length, sortedUsers.map(u => u.name));
        } else {
          console.warn('No users found in API response');
        }
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  // Filter users based on search query - show all users if no search
  const filteredUserOptions = searchQuery
    ? userOptions.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : userOptions; // Show all users if no search

  console.log('Search query:', searchQuery, 'Filtered users:', filteredUserOptions.length);

  // Active tab
  const [activeTab, setActiveTab] = useState<'monthlyGrid' | 'history' | 'allRecords' | 'payment'>('monthlyGrid');

  const { exportState } = useAttendanceExport();

  return (
    <PageContainer title="📊 Laporan">
      <div className="space-y-6">
        {/* Export Type Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('monthlyGrid')}
              className={`
                py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === 'monthlyGrid'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              📊 Grid Bulanan
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`
                py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              📋 Riwayat
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`
                py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === 'payment'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              💰 Pembayaran
            </button>
            <button
              onClick={() => setActiveTab('allRecords')}
              className={`
                py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === 'allRecords'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              📁 Semua Data
            </button>
          </nav>
        </div>

        {/* Monthly Grid Report Tab */}
        {activeTab === 'monthlyGrid' && (
          <MonthlyGridReportPage />
        )}

        {/* History Export Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Export Riwayat Attendance
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Download riwayat attendance dengan filter <strong>tanggal</strong> dan <strong>user</strong> dalam format Excel.
              </p>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📅 Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={historyFilters.startDate || ''}
                    onChange={(e) => setHistoryFilters({ ...historyFilters, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📅 Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    value={historyFilters.endDate || ''}
                    onChange={(e) => setHistoryFilters({ ...historyFilters, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    👤 User (Opsional)
                  </label>
                  {/* Search box */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik nama atau email user..."
                    disabled={loadingUsers}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  {/* User suggestions dropdown */}
                  {searchQuery.length > 0 && !historyFilters.userId && (
                    <div className="relative mt-1">
                      <div className="absolute z-10 w-full max-h-60 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                        {loadingUsers && (
                          <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                        )}
                        {!loadingUsers && filteredUserOptions.length === 0 && (
                          <div className="px-4 py-2 text-sm text-gray-500">User tidak ditemukan</div>
                        )}
                        {!loadingUsers && filteredUserOptions.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              setHistoryFilters({ ...historyFilters, userId: user.id });
                              setSearchQuery(''); // Clear search query after selection
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors"
                          >
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Selected user display */}
                  {historyFilters.userId && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-blue-900">
                            👤 {userOptions.find(u => u.id === historyFilters.userId)?.name}
                          </div>
                          <div className="text-xs text-blue-600">
                            {userOptions.find(u => u.id === historyFilters.userId)?.email}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHistoryFilters({ ...historyFilters, userId: '' })}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Hapus pilihan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <strong>📋 Filter yang tersedia:</strong>
                </p>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• <strong>Per Tanggal:</strong> Tentukan rentang tanggal mulai dan akhir</li>
                  <li>• <strong>Per User:</strong> Pilih user dari dropdown (nama/email)</li>
                  <li>• <strong>Status:</strong> Filter berdasarkan status kehadiran</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Payment Report Tab */}
        {activeTab === 'payment' && (
          <DeferredPaymentReportPage />
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
                Download semua data attendance dengan filter <strong>tanggal</strong> dalam format Excel dengan 3 sheet.
              </p>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📅 Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={allRecordsFilters.startDate || ''}
                    onChange={(e) => setAllRecordsFilters({ ...allRecordsFilters, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📅 Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    value={allRecordsFilters.endDate || ''}
                    onChange={(e) => setAllRecordsFilters({ ...allRecordsFilters, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clock Out (Opsional)
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
                  <strong>📁 Filter yang tersedia:</strong>
                </p>
                <ul className="mt-2 text-sm text-purple-700 space-y-1">
                  <li>• <strong>Per Tanggal:</strong> Tentukan rentang tanggal mulai dan akhir</li>
                  <li>• <strong>Status:</strong> Filter berdasarkan status kehadiran</li>
                  <li>• <strong>Clock Out:</strong> Filter berdasarkan status clock out</li>
                </ul>
              </div>

              {/* Warning */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Perhatian:</strong> Export ini hanya tersedia untuk ADMIN.
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
