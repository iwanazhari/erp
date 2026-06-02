import { useState, useCallback } from 'react';
import { useDeferredPaymentReport, useDeferredPaymentSummary } from '@/features/attendance/hooks/useDeferredPaymentReport';
import type { DeferredPaymentFilters, DeferredPaymentItem } from '@/shared/types/attendance';

/**
 * Deferred Payment Report Page
 *
 * Displays deferred payment transactions with:
 * - Filter per tanggal (fromDate, toDate)
 * - Filter per user/technician (search by name)
 * - Status filter (DEFERRED, OVERDUE, COMPLETED)
 * - Dashboard summary
 *
 * @access ADMIN, HR, MANAGER
 */
export default function DeferredPaymentReportPage() {
  const [filters, setFilters] = useState<DeferredPaymentFilters>({
    status: 'DEFERRED',
    page: 1,
    pageSize: 20,
  });

  const [searchInput, setSearchInput] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [technicianId, setTechnicianId] = useState('');

  // Fetch summary
  const { data: summaryData } = useDeferredPaymentSummary();

  // Apply filters
  const applyFilters = useCallback(() => {
    const newFilters: DeferredPaymentFilters = {
      status: filters.status || 'DEFERRED',
      page: 1,
      pageSize: filters.pageSize || 20,
    };

    if (fromDate) newFilters.fromDate = fromDate;
    if (toDate) newFilters.toDate = toDate;
    if (technicianId.trim()) newFilters.technicianId = technicianId.trim();
    if (searchInput.trim()) newFilters.technicianId = searchInput.trim();

    setFilters(newFilters);
  }, [fromDate, toDate, technicianId, searchInput, filters.status, filters.pageSize]);

  const handleClearFilters = useCallback(() => {
    setFromDate('');
    setToDate('');
    setTechnicianId('');
    setSearchInput('');
    setFilters({ status: 'DEFERRED', page: 1, pageSize: 20 });
  }, []);

  const { data, isLoading, error } = useDeferredPaymentReport(filters);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    });
  };

  // Status badge color
  const getStatusBadge = (item: DeferredPaymentItem) => {
    const isOverdue = item.daysOverdue > 0;
    if (isOverdue) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          OVERDUE ({item.daysOverdue} hari)
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
        DEFERRED
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            💰 Laporan Pembayaran Tertunda
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Laporan transaksi pembayaran tertunda dengan filter tanggal dan teknisi
          </p>
        </div>

        {/* Summary Cards */}
        {summaryData && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Tertunda</p>
              <p className="text-2xl font-bold text-gray-900">{summaryData.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{summaryData.overdueCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Sisa Tagihan</p>
              <p className="text-lg font-bold text-orange-600">{formatCurrency(summaryData.totalRemainingAmount)}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Rata-rata</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(summaryData.averageDeferredAmount)}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* From Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Technician ID Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Teknisi
              </label>
              <input
                type="text"
                value={technicianId}
                onChange={(e) => setTechnicianId(e.target.value)}
                placeholder="UUID teknisi..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || 'DEFERRED'}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="DEFERRED">Tertunda</option>
                <option value="OVERDUE">Terlambat Bayar</option>
                <option value="COMPLETED">Selesai</option>
              </select>
            </div>

            {/* Apply Button */}
            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                🔍 Filter
              </button>
            </div>
          </div>

          {/* Clear Filters */}
          {(fromDate || toDate || technicianId || searchInput) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reset Filter
              </button>
            </div>
          )}
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
            <span className="ml-3 text-gray-600">Memuat data pembayaran...</span>
          </div>
        )}

        {/* Data Table */}
        {data && data.items.length > 0 && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Teknisi</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Lokasi</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Pelanggan</th>
                      <th className="text-right py-3 px-4 text-gray-500 font-medium">Sisa Tagihan</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Tgl Tertunda</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Tgl Jatuh Tempo</th>
                      <th className="text-center py-3 px-4 text-gray-500 font-medium">Status</th>
                      <th className="text-center py-3 px-4 text-gray-500 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item: DeferredPaymentItem) => (
                      <tr key={item.transactionId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{item.technicianName}</p>
                          <p className="text-xs text-gray-500">{item.technicianPhone || '-'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-700">{item.location}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-700">{item.customerName}</p>
                          <p className="text-xs text-gray-500">{item.customerPhone}</p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <p className="font-bold text-orange-600">{formatCurrency(item.remainingAmount)}</p>
                          {item.paidAmount > 0 && (
                            <p className="text-xs text-gray-500">Dibayar: {formatCurrency(item.paidAmount)}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{formatDate(item.deferredAt)}</td>
                        <td className="py-3 px-4 text-gray-700">{formatDate(item.dueDate)}</td>
                        <td className="py-3 px-4 text-center">{getStatusBadge(item)}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {item.followUpCount > 0 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full" title={`Follow up: ${item.followUpCount}x`}>
                                {item.followUpCount}x
                              </span>
                            )}
                            {item.escalated && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full" title="Escalated">
                                ⚠️
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

            {/* Results count */}
            <div className="mt-4 text-center text-sm text-gray-500">
              Menampilkan {data.items.length} dari {data.total} total transaksi
            </div>
          </>
        )}

        {/* Empty State */}
        {data && data.items.length === 0 && !isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-lg text-gray-500">Tidak ada data pembayaran tertunda</p>
            <p className="text-sm text-gray-400 mt-2">Coba ubah filter tanggal atau status</p>
          </div>
        )}
      </div>
    </div>
  );
}
