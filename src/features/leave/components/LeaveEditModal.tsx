import { useState, useEffect } from 'react';
import type { Leave, LeaveApprovalStatus, LeaveStatus } from '@/shared/types/leave';

type Props = {
  leave: Leave | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    status?: LeaveStatus;
    leaveReason?: string;
    leaveFileUrl?: string;
    leaveStatus?: LeaveApprovalStatus;
    date?: string;
    editReason: string;
  }) => Promise<void>;
  isLoading?: boolean;
};

/**
 * Leave Edit Modal Component
 *
 * Allows editing leave request data (ADMIN/MANAGER only)
 * All changes are logged in audit trail with edit reason
 */
export default function LeaveEditModal({
  leave,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: Props) {
  // Form state
  const [status, setStatus] = useState<LeaveStatus>('IZIN');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveFileUrl, setLeaveFileUrl] = useState('');
  const [leaveStatus, setLeaveStatus] = useState<LeaveApprovalStatus>('PENDING');
  const [date, setDate] = useState('');
  const [editReason, setEditReason] = useState('');

  // Reset form when modal opens with new leave
  useEffect(() => {
    if (leave && isOpen) {
      setStatus(leave.status);
      setLeaveReason(leave.leaveReason);
      setLeaveFileUrl(leave.leaveFileUrl);
      setLeaveStatus(leave.leaveStatus);
      
      // Extract date from ISO string
      const leaveDate = new Date(leave.date);
      const year = leaveDate.getFullYear();
      const month = (leaveDate.getMonth() + 1).toString().padStart(2, '0');
      const day = leaveDate.getDate().toString().padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
      
      // Reset edit reason
      setEditReason('');
    }
  }, [leave, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editReason.trim()) {
      alert('Alasan edit wajib diisi untuk audit trail');
      return;
    }

    await onSave({
      status,
      leaveReason,
      leaveFileUrl,
      leaveStatus,
      date: date ? new Date(date).toISOString() : undefined,
      editReason: editReason.trim(),
    });
  };

  if (!isOpen || !leave) return null;

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
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Edit Leave Request</h2>
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
          {/* Employee Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Karyawan</p>
            <p className="text-base font-semibold text-gray-900">{leave.user.name}</p>
            <p className="text-sm text-gray-600">{leave.user.email}</p>
            <div className="mt-2 flex gap-4">
              <p className="text-sm text-gray-500">
                Tipe: <span className="font-medium text-gray-900">{leave.status}</span>
              </p>
              <p className="text-sm text-gray-500">
                Tanggal: <span className="font-medium text-gray-900">{new Date(leave.date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Leave Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Cuti
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeaveStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="IZIN">Izin</option>
                <option value="SAKIT">Sakit</option>
                <option value="ALPA">Alpa</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Leave Reason */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alasan Cuti
            </label>
            <textarea
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
            />
          </div>

          {/* Document URL */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Dokumen Pendukung
            </label>
            <input
              type="url"
              value={leaveFileUrl}
              onChange={(e) => setLeaveFileUrl(e.target.value)}
              placeholder="https://minio.worksy.com/leave/document.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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

          {/* Edit Reason - Required for audit trail */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alasan Edit <span className="text-red-500">*</span>
            </label>
            <textarea
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="Contoh: Approve leave request, Update status per HR request, Koreksi data, dll."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Alasan edit akan dicatat dalam audit trail untuk tracking
            </p>
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
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
