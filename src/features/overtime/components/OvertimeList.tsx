import React, { useState, useEffect } from 'react';
import overtimeApi, { type OvertimeRequest } from '../../../services/overtimeApi';
import { OvertimeApprovalCard } from './OvertimeApprovalCard';

export const OvertimeList: React.FC = () => {
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');

  const fetchOvertimeRequests = async () => {
    try {
      setLoading(true);
      const response = await overtimeApi.getOvertimeRequests();
      setOvertimeRequests(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengambil data lembur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOvertimeRequests();
  }, []);

  const filteredRequests = overtimeRequests.filter((request) => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const stats = {
    total: overtimeRequests.length,
    pending: overtimeRequests.filter(r => r.status === 'PENDING').length,
    approved: overtimeRequests.filter(r => r.status === 'APPROVED').length,
    rejected: overtimeRequests.filter(r => r.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Permintaan Lembur</h1>
          <p className="text-gray-500 mt-1">Kelola permintaan lembur karyawan</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-600">Menunggu</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600">Disetujui</div>
          <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600">Ditolak</div>
          <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['all', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === status
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {status === 'all' ? 'Semua' : status}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Memuat data...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Tidak ada permintaan lembur</p>
        </div>
      ) : (
        /* Overtime Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((request) => (
            <OvertimeApprovalCard
              key={request.id}
              request={request}
              onApproved={fetchOvertimeRequests}
              onRejected={fetchOvertimeRequests}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OvertimeList;
