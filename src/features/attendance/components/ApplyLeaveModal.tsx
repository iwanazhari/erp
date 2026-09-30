import { useState, useEffect, useMemo, useRef } from 'react';
import { privateApi } from '@/services/authApi';
import { leaveApiErrorMessage } from '@/services/leaveApi';
import type { LeaveTargetUser } from '@/services/leaveApi';
import { todayDate } from '@/utils/date';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ApplyLeaveModal({ isOpen, onClose, onSuccess }: Props) {
  const [type, setType] = useState<'CUTI_TAHUNAN' | 'CUTI_BESAR'>('CUTI_TAHUNAN');
  const [date, setDate] = useState(todayDate);
  const [leaveReason, setLeaveReason] = useState('Cuti Tahunan');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hrMode, setHrMode] = useState<'self' | 'other'>('self');
  const [targetUserId, setTargetUserId] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const [targetListOpen, setTargetListOpen] = useState(false);
  const [targetUsers, setTargetUsers] = useState<LeaveTargetUser[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(false);
  const targetBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setType('CUTI_TAHUNAN');
      setDate(todayDate());
      setLeaveReason('Cuti Tahunan');
      setError(null);
      setIsSubmitting(false);
      setHrMode('self');
      setTargetUserId('');
      setTargetSearch('');
      setTargetListOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setLeaveReason(type === 'CUTI_TAHUNAN' ? 'Cuti Tahunan' : 'Cuti Besar');
  }, [type]);

  useEffect(() => {
    if (isOpen) {
      setLoadingTargets(true);
      privateApi.get('/user', { params: { page: 1, limit: 100, isActive: 'true' } })
        .then((res) => {
          const raw = res.data?.data || res.data?.users || [];
          const list: LeaveTargetUser[] = Array.isArray(raw)
            ? raw.map((u: any) => ({ id: u.id, name: u.name, email: u.email ?? '' }))
            : [];
          setTargetUsers(list);
        })
        .catch(() => setTargetUsers([]))
        .finally(() => setLoadingTargets(false));
    }
  }, [isOpen]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (targetBoxRef.current && !targetBoxRef.current.contains(e.target as Node)) {
        setTargetListOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filteredTargets = useMemo(() => {
    const q = targetSearch.trim().toLowerCase();
    if (!q) return targetUsers;
    return targetUsers.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [targetUsers, targetSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) { setError('Tanggal wajib diisi.'); return; }
    if (hrMode === 'other' && !targetUserId) { setError('Pilih karyawan yang diajukan cuti.'); return; }

    setIsSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        date,
        status: 'IZIN',
        leaveReason: leaveReason.trim(),
      };
      if (hrMode === 'other' && targetUserId) {
        body.targetUserId = targetUserId;
      }

      const { privateApi: api } = await import('@/services/authApi');
      await api.post('/leave', body);
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
        <h2 className="text-xl font-bold mb-1">Ajukan Cuti</h2>
        <p className="text-sm text-gray-500 mb-4">
          Satu tanggal per pengajuan. Admin/HR: langsung APPROVED & potong jatah.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Target User (HR/Admin) */}
          <div ref={targetBoxRef}>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="cuti-applicant"
                  className="text-indigo-600"
                  checked={hrMode === 'self'}
                  onChange={() => { setHrMode('self'); setTargetUserId(''); setTargetSearch(''); setTargetListOpen(false); }}
                />
                Saya sendiri
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="cuti-applicant"
                  className="text-indigo-600"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
                {targetListOpen && !loadingTargets && filteredTargets.length > 0 && (
                  <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    {filteredTargets.map((u) => (
                      <li key={u.id}>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50"
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

          {/* Jenis Cuti */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Cuti</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'CUTI_TAHUNAN' | 'CUTI_BESAR')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="CUTI_TAHUNAN">Cuti Tahunan</option>
              <option value="CUTI_BESAR">Cuti Besar</option>
            </select>
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Alasan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alasan</label>
            <textarea
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              rows={3}
              required
            />
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
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Mengirim…' : 'Kirim Pengajuan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
