import React, { useState } from 'react';
import overtimeApi from '../../../services/overtimeApi';
import type { OvertimeRequest } from '../../../services/overtimeApi';

interface OvertimeApprovalCardProps {
  request: OvertimeRequest;
  onApproved?: () => void;
  onRejected?: () => void;
}

export const OvertimeApprovalCard: React.FC<OvertimeApprovalCardProps> = ({
  request,
  onApproved,
  onRejected,
}) => {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState('');

  const handleApprove = async () => {
    if (!confirm('Apakah Anda yakin ingin menyetujui permintaan lembur ini?')) return;
    
    setLoading('approve');
    setError('');
    
    try {
      await overtimeApi.approveOvertime(request.id);
      onApproved?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyetujui lembur');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    if (!confirm('Apakah Anda yakin ingin menolak permintaan lembur ini?')) return;
    
    setLoading('reject');
    setError('');
    
    try {
      await overtimeApi.rejectOvertime(request.id);
      onRejected?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menolak lembur');
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    
    const statusLabels = {
      PENDING: 'Menunggu Persetujuan',
      APPROVED: 'Disetujui',
      REJECTED: 'Ditolak',
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{request.user?.name || 'Unknown User'}</h3>
          <p className="text-sm text-gray-500">{request.user?.email}</p>
        </div>
        {getStatusBadge(request.status)}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Tanggal:</span>
          <span className="font-medium">{new Date(request.date).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Durasi:</span>
          <span className="font-medium">{request.hours} jam</span>
        </div>
        <div>
          <span className="text-gray-500 text-sm">Alasan:</span>
          <p className="text-gray-700 text-sm mt-1">{request.reason}</p>
        </div>
      </div>

      {request.status === 'APPROVED' && request.approvedAt && (
        <div className="text-xs text-gray-500">
          Disetujui pada: {new Date(request.approvedAt).toLocaleString('id-ID')}
        </div>
      )}

      {request.status === 'REJECTED' && request.rejectedAt && (
        <div className="text-xs text-gray-500">
          Ditolak pada: {new Date(request.rejectedAt).toLocaleString('id-ID')}
        </div>
      )}

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {request.status === 'PENDING' && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleApprove}
            disabled={loading !== null}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {loading === 'approve' ? 'Menyetujui...' : 'Setujui'}
          </button>
          <button
            onClick={handleReject}
            disabled={loading !== null}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {loading === 'reject' ? 'Menolak...' : 'Tolak'}
          </button>
        </div>
      )}
    </div>
  );
};

export default OvertimeApprovalCard;
