import { useState, useCallback } from 'react';
import { useMonthlyGridReport, useMonthlyGridExport } from '@/features/attendance/hooks/useMonthlyGridReport';
import type { MonthlyGridFilters, MonthlyGridUser } from '@/shared/types/attendance';

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/**
 * Monthly Grid Report Page
 *
 * Displays daily attendance grid per user with:
 * - Filter per tanggal (year/month selector)
 * - Filter per user (search by name/email)
 * - Daily clock-in/out times with late highlighting
 * - Leave classification (CUTI vs SID)
 * - Attendance percentage and balance info
 *
 * @access ADMIN, HR, MANAGER
 */
export default function MonthlyGridReportPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [filters, setFilters] = useState<MonthlyGridFilters>({
    year: currentYear,
    month: currentMonth,
    q: '',
    page: 1,
    pageSize: 20,
  });

  const [searchInput, setSearchInput] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const { data, isLoading, error } = useMonthlyGridReport(filters);
  const { exportGrid, exportState } = useMonthlyGridExport();

  const handleExport = useCallback(async () => {
    await exportGrid({
      year: filters.year,
      month: filters.month,
      q: filters.q,
    });
  }, [exportGrid, filters.year, filters.month, filters.q]);

  const handleSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, q: searchInput.trim() || undefined, page: 1 }));
  }, [searchInput]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  }, [handleSearch]);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleToggleExpand = useCallback((userId: string) => {
    setExpandedUserId((prev) => (prev === userId ? null : userId));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header + Export */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              📊 Laporan Grid Bulanan
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Rekap harian attendance semua user dengan filter tanggal dan pencarian user
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exportState.loading || !data || data.users.length === 0}
            className="px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
          >
            {exportState.loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export Excel</span>
              </>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            {/* Period Selectors */}
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-28 flex-shrink-0">
                <label className="block text-xs font-medium text-gray-500 mb-1">Tahun</label>
                <select
                  value={filters.year || currentYear}
                  onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value), page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="w-32 flex-shrink-0">
                <label className="block text-xs font-medium text-gray-500 mb-1">Bulan</label>
                <select
                  value={filters.month || currentMonth}
                  onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value), page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {monthNames.map((month, index) => (
                    <option key={index + 1} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* User Search */}
            <div className="w-full md:w-auto md:flex-1 md:max-w-xs lg:max-w-sm">
              <label className="block text-xs font-medium text-gray-500 mb-1">Cari User</label>
              <div className="flex gap-0">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Nama / email..."
                  className="flex-1 min-w-0 px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none truncate"
                />
                <button
                  onClick={handleSearch}
                  className="flex-shrink-0 px-3 py-2 bg-emerald-600 text-white text-sm rounded-r-lg hover:bg-emerald-700 transition-colors"
                  title="Cari"
                >
                  🔍
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error instanceof Error ? error.message : 'Terjadi kesalahan'}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-emerald-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="ml-3 text-gray-600">Memuat data grid bulanan...</span>
          </div>
        )}

        {/* Data Display */}
        {data && data.users.length > 0 && (
          <>
            {/* Meta Info */}
            <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Hari Kerja</p>
                <p className="text-2xl font-bold text-gray-900">{data.workingDaysInMonth}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Total User</p>
                <p className="text-2xl font-bold text-gray-900">{data.totalUsers}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Jatah Cuti (YTD)</p>
                <p className="text-2xl font-bold text-gray-900">{data.meta.cutiQuotaYtd} hari</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Jatah SID (YTD)</p>
                <p className="text-2xl font-bold text-gray-900">{data.meta.sidQuotaYtd} hari</p>
              </div>
            </div>

            {/* User Cards */}
            <div className="space-y-4">
              {data.users.map((user: MonthlyGridUser) => (
                <div
                  key={user.userId}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* User Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleToggleExpand(user.userId)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500 font-medium">#{user.no}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email} • {user.jabatan}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Kehadiran</p>
                        <p className="text-lg font-bold text-emerald-600">{user.totals.percentKehadiran}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Hadir / Telat / Alpa</p>
                        <p className="text-sm font-medium">
                          <span className="text-emerald-600">{user.totals.tHadir}</span>
                          {' / '}
                          <span className="text-orange-600">{user.totals.tTelat}</span>
                          {' / '}
                          <span className="text-red-600">{user.totals.tAlpa}</span>
                        </p>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedUserId === user.userId ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Daily Grid */}
                  {expandedUserId === user.userId && (
                    <div className="border-t border-gray-200 p-4">
                      {/* Balance Info */}
                      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-3">
                        <div>
                          <p className="text-xs text-gray-500">Sisa Cuti</p>
                          <p className="text-lg font-bold text-blue-600">{user.balance.sisaCuti} hari</p>
                          <p className="text-xs text-gray-400">Diambil: {user.balance.cutiTakenYtd}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Sisa SID</p>
                          <p className="text-lg font-bold text-purple-600">{user.balance.sisaSid} hari</p>
                          <p className="text-xs text-gray-400">Diambil: {user.balance.sidTakenYtd}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">SID Bulan Ini</p>
                          <p className="text-lg font-bold text-gray-700">{user.totals.sid} hari</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Cuti Bulan Ini</p>
                          <p className="text-lg font-bold text-gray-700">{user.totals.cuti} hari</p>
                        </div>
                      </div>

                      {/* Daily Grid Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 px-2 text-gray-500 font-medium w-10">Tgl</th>
                              {user.days.map((day) => (
                                <th
                                  key={day.day}
                                  className={`text-center py-2 px-1 font-medium min-w-[60px] ${
                                    day.minggu || day.liburPerusahaan ? 'text-gray-400' : 'text-gray-600'
                                  }`}
                                >
                                  <div>{day.day}</div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {/* Clock In Row */}
                            <tr className="border-b border-gray-100">
                              <td className="py-1.5 px-2 text-gray-500 font-medium">Masuk</td>
                              {user.days.map((day) => (
                                <td
                                  key={day.day}
                                  className={`text-center py-1.5 px-1 text-xs ${
                                    day.minggu
                                      ? 'bg-yellow-50 text-yellow-600'
                                      : day.liburPerusahaan
                                      ? 'bg-blue-50 text-blue-600'
                                      : day.belumBerlaku
                                      ? 'text-gray-300'
                                      : day.jamMasukHighlight === 'red'
                                      ? 'text-red-600 font-bold bg-red-50'
                                      : day.leave
                                      ? day.leaveCategory === 'CUTI_TAHUNAN'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-purple-100 text-purple-700'
                                      : day.leavePending
                                      ? 'bg-orange-50 text-orange-500'
                                      : day.alpa
                                      ? 'text-red-500 font-medium'
                                      : day.jamMasuk
                                      ? 'text-gray-900'
                                      : 'text-gray-300'
                                  }`}
                                >
                                  {day.minggu
                                    ? 'M'
                                    : day.liburPerusahaan
                                    ? 'L'
                                    : day.belumBerlaku
                                    ? '-'
                                    : day.leave
                                    ? day.leaveCategory === 'CUTI_TAHUNAN'
                                      ? 'C'
                                      : 'S'
                                    : day.leavePending
                                    ? 'P'
                                    : day.alpa
                                    ? 'A'
                                    : day.jamMasuk || '-'}
                                </td>
                              ))}
                            </tr>
                            {/* Clock Out Row */}
                            <tr>
                              <td className="py-1.5 px-2 text-gray-500 font-medium">Pulang</td>
                              {user.days.map((day) => (
                                <td
                                  key={day.day}
                                  className={`text-center py-1.5 px-1 text-xs ${
                                    day.minggu || day.liburPerusahaan
                                      ? 'bg-gray-50 text-gray-300'
                                      : day.belumBerlaku
                                      ? 'text-gray-300'
                                      : day.leave || day.leavePending || day.alpa
                                      ? ''
                                      : day.jamKeluar
                                      ? 'text-gray-700'
                                      : 'text-gray-300'
                                  }`}
                                >
                                  {day.minggu || day.liburPerusahaan || day.belumBerlaku
                                    ? '-'
                                    : day.leave || day.leavePending || day.alpa
                                    ? ''
                                    : day.jamKeluar || '-'}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Legend */}
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                        <span><strong className="text-emerald-600">Hadir</strong> = Tepat waktu</span>
                        <span><strong className="text-red-600">Merah</strong> = Terlambat</span>
                        <span><strong className="text-green-700">C</strong> = Cuti Tahunan</span>
                        <span><strong className="text-purple-700">S</strong> = SID (Sakit/Izin)</span>
                        <span><strong className="text-red-500">A</strong> = Alpa</span>
                        <span><strong className="text-orange-500">P</strong> = Pending</span>
                        <span><strong className="text-yellow-600">M</strong> = Minggu</span>
                        <span><strong className="text-blue-600">L</strong> = Libur</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(data.page - 1)}
                  disabled={data.page <= 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700 flex items-center">
                  Halaman {data.page} dari {data.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(data.page + 1)}
                  disabled={data.page >= data.totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {data && data.users.length === 0 && !isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-lg text-gray-500">Tidak ada data user ditemukan</p>
            <p className="text-sm text-gray-400 mt-2">Coba ubah filter tanggal atau kata kunci pencarian</p>
          </div>
        )}
      </div>
    </div>
  );
}
