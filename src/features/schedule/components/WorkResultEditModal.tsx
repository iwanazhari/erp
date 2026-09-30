import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastContext';
import { resolveBackendUrl } from '@/utils/resolveBackendUrl';
import { attendanceApi } from '@/services/attendanceApi';
import { handleScheduleError } from '@/features/schedule/utils/scheduleHelpers';

interface WorkResultEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: {
    id: string;
    workReport: string | null;
    jobCompletionPhotos: string | string[] | null;
  } | null;
  onSaved?: () => void;
}

const parsePhotos = (photos: string | string[] | null | undefined): string[] => {
  if (!photos) return [];
  if (Array.isArray(photos)) return photos;
  try {
    const parsed = JSON.parse(photos as string);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [photos as string];
  }
};

const WorkResultEditModal: React.FC<WorkResultEditModalProps> = ({
  isOpen,
  onClose,
  attendance,
  onSaved,
}) => {
  const toast = useToast();
  const [description, setDescription] = useState('');
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && attendance) {
      setDescription(attendance.workReport || '');
      setExistingPhotos(parsePhotos(attendance.jobCompletionPhotos));
      setNewPhotos([]);
    }
  }, [isOpen, attendance]);

  if (!isOpen || !attendance) return null;

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewPhotos((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const removeExisting = (url: string) =>
    setExistingPhotos((prev) => prev.filter((p) => p !== url));

  const removeNew = (i: number) => setNewPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('workReport', description.trim());
    formData.append('editReason', 'Edit hasil kerja via ERP');
    formData.append('jobCompletionPhotos', JSON.stringify(existingPhotos));
    newPhotos.forEach((f) => formData.append('jobCompletionPhotos', f));

    setSaving(true);
    try {
      const res = await attendanceApi.updateWorkResult(attendance.id, formData);
      if (res.success) {
        toast.success('Hasil kerja berhasil disimpan!');
        onSaved?.();
        onClose();
      } else {
        toast.error(res.message || 'Gagal menyimpan hasil kerja');
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
            <h2 className="text-xl font-bold text-gray-900">Edit Hasil Kerja</h2>
            <p className="text-sm text-gray-500 mt-1">Unggah foto dokumentasi dan deskripsi pekerjaan</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Deskripsi */}
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

          {/* Foto existing */}
          {existingPhotos.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">📸 Foto Saat Ini</p>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {existingPhotos.map((url, idx) => (
                  <div key={idx} className="relative aspect-square group">
                    <img
                      src={resolveBackendUrl(url)}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeExisting(url)}
                      className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Hapus foto"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Foto baru */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">🆕 Foto Baru</p>
            {newPhotos.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                {newPhotos.map((file, idx) => (
                  <div key={idx} className="relative aspect-square group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Baru ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeNew(idx)}
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

export default WorkResultEditModal;
