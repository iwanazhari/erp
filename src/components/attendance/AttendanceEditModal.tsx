import { useState, useEffect, useMemo } from 'react';
import type { AttendanceRecord } from '@/shared/types/attendance';
import { MAX_CLOCK_IN_CUTOFF_MINUTES, MAX_CLOCK_IN_DISPLAY } from '@/utils/attendanceCheckIn';

type Props = {
  record: AttendanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { checkIn: string; checkOut: string; status: string; editReason: string }) => Promise<void>;
  isLoading?: boolean;
};

/**
 * Attendance Edit Modal Component
 * 
 * Allows editing check-in and check-out times with automatic status calculation
 * based on check-in time validation using 09:15 AM absolute cutoff
 * 
 * Status validation (NEW RULE 2026-03-29):
 * - HADIR: checkIn ≤ 09:15 AM (absolute cutoff for all shifts)
 * - TERLAMBAT: checkIn > 09:15 AM
 * 
 * Reference: Validasi Keterlambatan Absensi Setelah 09:15 AM
 */
export default function AttendanceEditModal({
  record,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: Props) {
  // Debug logging
  useEffect(() => {
    console.log('AttendanceEditModal - isOpen:', isOpen, 'record:', record?.id);
  }, [isOpen, record]);

  // Form state
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [calculatedStatus, setCalculatedStatus] = useState('');
  const [editReason, setEditReason] = useState('');

  // Reset form when modal opens with new record
  useEffect(() => {
    if (record && isOpen) {
      // Extract time from datetime string (HH:MM format)
      const checkInDate = new Date(record.clockIn);
      const checkOutDate = record.clockOut ? new Date(record.clockOut) : null;

      const checkInHours = checkInDate.getHours().toString().padStart(2, '0');
      const checkInMinutes = checkInDate.getMinutes().toString().padStart(2, '0');
      setCheckInTime(`${checkInHours}:${checkInMinutes}`);

      if (checkOutDate) {
        const checkOutHours = checkOutDate.getHours().toString().padStart(2, '0');
        const checkOutMinutes = checkOutDate.getMinutes().toString().padStart(2, '0');
        setCheckOutTime(`${checkOutHours}:${checkOutMinutes}`);
      } else {
        setCheckOutTime('');
      }
      
      // Reset edit reason
      setEditReason('');
    }
  }, [record, isOpen]);

  // Calculate status based on check-in time using 09:15 AM absolute cutoff
  const statusInfo = useMemo(() => {
    if (!checkInTime) {
      return { status: '', label: '', color: '' };
    }

    const [checkInHours, checkInMinutes] = checkInTime.split(':').map(Number);

    const checkInTotalMinutes = checkInHours * 60 + checkInMinutes;

    if (checkInTotalMinutes <= MAX_CLOCK_IN_CUTOFF_MINUTES) {
      return {
        status: 'HADIR',
        label: `HADIR (Tepat Waktu ≤ ${MAX_CLOCK_IN_DISPLAY})`,
        color: 'text-green-600 bg-green-50 border-green-200',
      };
    } else {
      return {
        status: 'TERLAMBAT',
        label: `TERLAMBAT (Lewat ${MAX_CLOCK_IN_DISPLAY})`,
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      };
    }
  }, [checkInTime]);

  useEffect(() => {
    setCalculatedStatus(statusInfo.status);
  }, [statusInfo.status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkInTime) {
      alert('Jam masuk wajib diisi');
      return;
    }

    if (!editReason.trim()) {
      alert('Alasan edit wajib diisi untuk audit trail');
      return;
    }

    // Validate check-out time is after check-in time
    if (checkOutTime && checkOutTime <= checkInTime) {
      alert('Jam keluar harus lebih besar dari jam masuk');
      return;
    }

    await onSave({
      checkIn: checkInTime,
      checkOut: checkOutTime || '',
      status: calculatedStatus,
      editReason: editReason.trim(),
    });
  };

  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div
        className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal - Larger size */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
      <div className="bg-linear-to-r from-red-600 to-red-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Edit Attendance</h2>
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

        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          {/* Employee Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Karyawan</p>
            <p className="text-base font-semibold text-gray-900">{record.user.name}</p>
            <p className="text-sm text-gray-600">{record.user.email}</p>
            <p className="text-sm text-gray-500 mt-2">
              Tanggal: <span className="font-medium">{new Date(record.clockIn).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</span>
            </p>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Validasi Keterlambatan</p>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700">Batas tepat waktu: <span className="font-bold text-red-600 text-base">{MAX_CLOCK_IN_DISPLAY}</span></span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Aturan baru: Check-in ≤ {MAX_CLOCK_IN_DISPLAY} = HADIR | Check-in &gt; {MAX_CLOCK_IN_DISPLAY} = TERLAMBAT
              </p>
            </div>
          </div>

          {/* Check-in Time */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jam Masuk <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Masuk ≤ <span className="font-semibold text-red-600">{MAX_CLOCK_IN_DISPLAY}</span> = HADIR | Masuk &gt; <span className="font-semibold text-red-600">{MAX_CLOCK_IN_DISPLAY}</span> = TERLAMBAT
            </p>
          </div>

          {/* Check-out Time */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jam Keluar
            </label>
            <input
              type="time"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
            />
          </div>

          {/* Auto-calculated Status */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status (Otomatis)
            </label>
            <div className={`p-3 rounded-lg border-2 ${statusInfo.color}`}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">{statusInfo.label}</span>
              </div>
              <p className="text-xs mt-1 opacity-80">
                Status dihitung otomatis berdasarkan jam masuk
              </p>
            </div>
          </div>

          {/* Edit Reason - Required for audit trail */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alasan Edit <span className="text-red-500">*</span>
            </label>
            <textarea
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="Contoh: Koreksi data karena kesalahan sistem, User hadir tapi tertera ALPA, dll."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Alasan edit akan dicatat dalam audit trail untuk tracking
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
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
