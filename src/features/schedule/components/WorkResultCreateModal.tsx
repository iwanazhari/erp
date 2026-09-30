import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastContext';
import { attendanceApi } from '@/services/attendanceApi';
import { handleScheduleError } from '../utils/scheduleHelpers';

interface WorkResultCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
  onSaved?: () => void;
}

const WorkResultCreateModal: React.FC<WorkResultCreateModalProps> = ({
  isOpen,
  onClose,
  scheduleId,
  onSaved,
}) => {
  const toast = useToast();
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const removePhoto = (i: number) => setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!description.trim() && photos.length === 0) {
      toast.error('Isi deskripsi atau unggah foto minimal satu.');
      return;
    }

    const formData = new FormData();
    formData.append('scheduleId', scheduleId);
    formData.append('workReport', description.trim());
    photos.forEach((f) => formData.append('jobCompletionPhotos', f));

    setSaving(true);
    try {
      const res = await attendanceApi.createWorkResultBySchedule(formData);
      if (res.success) {
        toast.success('Hasil kerja berhasil dibuat!');
        onSaved?.();
        onClose();
      } else {
        toast.error(res.message || 'Gagal membuat hasil kerja');
      }
    } catch (error) {
      toast.error(handleScheduleError(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Buat Hasil Kerja</h2>
            <p className="text-sm text-gray-500 mt-1">Isi manual hasil kerja teknisi oleh admin</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📝 Deskripsi / Laporan Kerja</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Tuliskan hasil pekerjaan yang dilakukan..."
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">📸 Foto Dokumentasi</p>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                {photos.map((file, idx) => (
                  <div key={idx} className="relative aspect-square group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Hapus foto"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Tambah Foto
              <input type="file" accept="image/*" multiple onChange={handleAddFiles} className="hidden" />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Hasil Kerja'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkResultCreateModal;
