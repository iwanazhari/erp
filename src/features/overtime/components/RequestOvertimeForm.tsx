import React, { useState } from 'react';
import overtimeApi from '../../../services/overtimeApi';
import { useAuth } from '../../../shared/AuthContext';
import UserSearchInput from '../../../components/ui/UserSearchInput';

interface RequestOvertimeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  requestForOthers?: boolean;
}

export const RequestOvertimeForm: React.FC<RequestOvertimeFormProps> = ({
  onSuccess,
  onCancel,
  requestForOthers = false,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    userId: user?.id || '',
    date: new Date().toISOString().split('T')[0],
    hours: '1:00',
    reason: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await overtimeApi.requestOvertime(formData);
      setSuccess('Permintaan lembur berhasil diajukan!');

      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }

      // Reset form
      setFormData({
        userId: requestForOthers ? '' : user?.id || '',
        date: new Date().toISOString().split('T')[0],
        hours: '1:00',
        reason: '',
        note: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengajukan lembur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {requestForOthers && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Karyawan <span className="text-red-500">*</span>
          </label>
          <UserSearchInput
            onChange={(userId) => setFormData({ ...formData, userId })}
            placeholder="Ketik nama atau email karyawan..."
          />
          <p className="text-xs text-gray-500 mt-1">Cari dan pilih karyawan yang akan diajukan lembur</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tanggal Lembur
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Durasi Lembur <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={formData.hours}
          onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Contoh: 6:30 (6 jam 30 menit)"
          pattern="^\d{1,2}(:\d{1,2})?$"
          title="Format jam:menit, contoh 6:30 atau 6"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Tulis jam:menit — 6:30 berarti 6 jam 30 menit</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alasan Lembur
        </label>
        <textarea
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Jelaskan alasan dan tujuan lembur..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catatan Tambahan
        </label>
        <textarea
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Opsional — contoh: Supri / tgl 30 September 2026 / lembur 6 jam"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Mengajukan...' : 'Ajukan Lembur'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
};

export default RequestOvertimeForm;
