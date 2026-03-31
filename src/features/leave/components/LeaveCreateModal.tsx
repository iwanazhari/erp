import { useState, useEffect } from 'react';
import type { LeaveStatus, LeaveApprovalStatus } from '@/shared/types/leave';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    userId: string;
    status: LeaveStatus;
    date: string;
    leaveReason: string;
    leaveFileUrl?: string;
    leaveStatus?: LeaveApprovalStatus;
  }) => Promise<void>;
  isLoading?: boolean;
};

/**
 * Leave Create Modal Component
 *
 * Allows creating new leave request (ADMIN/MANAGER only)
 */
export default function LeaveCreateModal({
  isOpen,
  onClose,
  onCreate,
  isLoading = false,
}: Props) {
  // Form state
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState<LeaveStatus>('IZIN');
  const [date, setDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveFileUrl, setLeaveFileUrl] = useState('');
  const [leaveStatus, setLeaveStatus] = useState<LeaveApprovalStatus>('PENDING');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setUserId('');
      setStatus('IZIN');
      setDate('');
      setLeaveReason('');
      setLeaveFileUrl('');
      setLeaveStatus('PENDING');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim()) {
      alert('User ID wajib diisi');
      return;
    }

    if (!date) {
      alert('Tanggal wajib diisi');
      return;
    }

    if (!leaveReason.trim()) {
      alert('Alasan cuti wajib diisi');
      return;
    }

    await onCreate({
      userId: userId.trim(),
      status,
      date: new Date(date).toISOString(),
      leaveReason: leaveReason.trim(),
      leaveFileUrl: leaveFileUrl.trim() || undefined,
      leaveStatus,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Create Leave Request</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* User ID */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user UUID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Masukkan User ID karyawan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Leave Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Cuti <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeaveStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="IZIN">Izin</option>
                <option value="SAKIT">Sakit</option>
                <option value="ALPA">Alpa</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
          </div>

          {/* Approval Status */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Approval
            </label>
            <select
              value={leaveStatus}
              onChange={(e) => setLeaveStatus(e.target.value as LeaveApprovalStatus)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Default: Pending
            </p>
          </div>

          {/* Leave Reason */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alasan Cuti <span className="text-red-500">*</span>
            </label>
            <textarea
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="Jelaskan alasan pengajuan cuti..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              required
            />
          </div>

          {/* Document URL */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Dokumen Pendukung (Opsional)
            </label>
            <input
              type="url"
              value={leaveFileUrl}
              onChange={(e) => setLeaveFileUrl(e.target.value)}
              placeholder="https://minio.worksy.com/leave/document.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {leaveFileUrl && (
              <div className="mt-2">
                <a
                  href={leaveFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Preview Dokumen →
                </a>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
