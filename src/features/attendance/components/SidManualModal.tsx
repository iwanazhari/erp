import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { privateApi } from '@/services/authApi';
import { leaveApiErrorMessage } from '@/services/leaveApi';
import type { LeaveTargetUser } from '@/services/leaveApi';
import { todayDate } from '@/utils/date';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function SidManualModal({ isOpen, onClose, onSuccess }: Props) {
  const [type, setType] = useState<'SAKIT' | 'IZIN'>('SAKIT');
  const [date, setDate] = useState(todayDate);
  const [leaveReason, setLeaveReason] = useState('Sakit — surat dokter');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hrMode, setHrMode] = useState<'self' | 'other'>('self');
  const [targetUserId, setTargetUserId] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const [targetListOpen, setTargetListOpen] = useState(false);
  const [targetUsers, setTargetUsers] = useState<LeaveTargetUser[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(false);
  const targetBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setType('SAKIT');
      setDate(todayDate());
      setLeaveReason('Sakit — surat dokter');
      setFile(null);
      setPreview(null);
      setError(null);
      setIsSubmitting(false);
      setHrMode('self');
      setTargetUserId('');
      setTargetSearch('');
      setTargetListOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setLeaveReason(type === 'SAKIT' ? 'Sakit — surat dokter' : 'Izin — keperluan pribadi');
  }, [type]);

  useEffect(() => {
    if (isOpen) {
      setLoadingTargets(true);
      privateApi.get('/user', { params: { page: 1, limit: 100, isActive: 'true' } })
        .then((res) => {
          const raw = res.data?.data || res.data?.users || [];
          setTargetUsers(Array.isArray(raw) ? raw.map((u: any) => ({ id: u.id, name: u.name, email: u.email ?? '' })) : []);
        })
        .catch(() => setTargetUsers([]))
        .finally(() => setLoadingTargets(false));
    }
  }, [isOpen]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (targetBoxRef.current && !targetBoxRef.current.contains(e.target as Node)) setTargetListOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filteredTargets = useMemo(() => {
    const q = targetSearch.trim().toLowerCase();
    if (!q) return targetUsers;
    return targetUsers.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [targetUsers, targetSearch]);

  const handleSelectFile = useCallback((f: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setError('Hanya file gambar yang diizinkan (JPG, PNG, WebP)');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleSelectFile(f);
  }, [handleSelectFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleSelectFile(f);
  }, [handleSelectFile]);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) { setError('Tanggal wajib diisi.'); return; }
    if (hrMode === 'other' && !targetUserId) { setError('Pilih karyawan yang diajukan.'); return; }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('date', date);
      formData.append('type', type);
      formData.append('leaveReason', leaveReason.trim());
      if (file) formData.append('file', file);
      if (hrMode === 'other' && targetUserId) formData.append('targetUserId', targetUserId);

      await privateApi.post('/leave/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(leaveApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-1">SID Manual</h2>
        <p className="text-sm text-gray-500 mb-4">
          Input manual SID (Sakit/Izin/Dinas) dengan upload bukti surat dokter. Admin/HR: langsung APPROVED & potong jatah.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Target User */}
          <div ref={targetBoxRef}>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="sid-applicant"
                  className="text-purple-600"
                  checked={hrMode === 'self'}
                  onChange={() => { setHrMode('self'); setTargetUserId(''); setTargetSearch(''); setTargetListOpen(false); }}
                />
                Saya sendiri
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="sid-applicant"
                  className="text-purple-600"
                  checked={hrMode === 'other'}
                  onChange={() => { setHrMode('other'); setTargetUserId(''); setTargetSearch(''); setTargetListOpen(true); }}
                />
                Karyawan lain
              </label>
            </div>
            {hrMode === 'other' && (
              <div className="relative">
                <label className="mb-1 block text-xs font-medium text-gray-500">Cari karyawan</label>
                <input
                  type="search"
                  autoComplete="off"
                  placeholder={loadingTargets ? 'Memuat…' : 'Nama atau email…'}
                  value={targetSearch}
                  onChange={(e) => { setTargetSearch(e.target.value); setTargetListOpen(true); if (targetUserId) setTargetUserId(''); }}
                  onFocus={() => setTargetListOpen(true)}
                  disabled={loadingTargets}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                />
                {targetListOpen && !loadingTargets && filteredTargets.length > 0 && (
                  <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    {filteredTargets.map((u) => (
                      <li key={u.id}>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50"
                          onClick={() => { setTargetUserId(u.id); setTargetSearch(`${u.name} (${u.email})`); setTargetListOpen(false); }}
                        >
                          <span className="font-medium text-gray-900">{u.name}</span>
                          <span className="block text-xs text-gray-500">{u.email}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Jenis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'SAKIT' | 'IZIN')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="SAKIT">Sakit</option>
                <option value="IZIN">Izin</option>
              </select>
            </div>

            {/* Tanggal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          {/* Alasan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alasan</label>
            <textarea
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              rows={2}
              required
            />
          </div>

          {/* Dropzone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bukti Surat Dokter {!file && <span className="text-red-500">*</span>}
            </label>
            <div
              ref={dropRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !file && fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors ${
                dragOver ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
              }`}
            >
              {!file ? (
                <>
                  <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-500">Drag & drop foto surat dokter di sini</p>
                  <p className="text-xs text-gray-400 mt-1">atau klik untuk memilih file (JPG/PNG/WebP, maks 5MB)</p>
                </>
              ) : (
                <div className="relative w-full">
                  {preview && (
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg object-contain"
                    />
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                    className="absolute top-1 right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 shadow"
                  >
                    ✕
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">{file?.name}</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !file}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Mengirim…' : 'Kirim SID'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
