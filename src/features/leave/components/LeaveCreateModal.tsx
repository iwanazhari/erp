import { useState, useEffect, useMemo, useRef } from 'react';
import type { CreateLeaveInput } from '@/shared/types/leave';
import ModalShell from '@/components/ui/ModalShell';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import { useLeaveTargetUsers } from '@/features/leave/hooks/useLeave';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateLeaveInput) => Promise<void>;
  isLoading?: boolean;
  /** ADMIN/HR: boleh mengajukan untuk karyawan lain via `targetUserId` */
  allowHrTarget?: boolean;
};

export default function LeaveCreateModal({
  isOpen,
  onClose,
  onCreate,
  isLoading = false,
  allowHrTarget = false,
}: Props) {
  const [status, setStatus] = useState<CreateLeaveInput['status']>('IZIN');
  const [date, setDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveFileUrl, setLeaveFileUrl] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  /** HR/Admin: ajukan untuk diri sendiri atau karyawan lain */
  const [hrMode, setHrMode] = useState<'self' | 'other'>('self');
  const [targetUserId, setTargetUserId] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const [targetListOpen, setTargetListOpen] = useState(false);
  const targetBoxRef = useRef<HTMLDivElement>(null);

  const { data: targetUsers = [], isLoading: loadingTargets } = useLeaveTargetUsers(
    isOpen && allowHrTarget
  );

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (targetBoxRef.current && !targetBoxRef.current.contains(e.target as Node)) {
        setTargetListOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStatus('IZIN');
      setDate('');
      setLeaveReason('');
      setLeaveFileUrl('');
      setLocalError(null);
      setHrMode('self');
      setTargetUserId('');
      setTargetSearch('');
      setTargetListOpen(false);
    }
  }, [isOpen]);

  const filteredTargets = useMemo(() => {
    const q = targetSearch.trim().toLowerCase();
    if (!q) return targetUsers;
    return targetUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [targetUsers, targetSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!date) {
      setLocalError('Tanggal wajib diisi.');
      return;
    }
    if (!leaveReason.trim()) {
      setLocalError('Alasan wajib diisi.');
      return;
    }
    if (allowHrTarget && hrMode === 'other') {
      if (!targetUserId) {
        setLocalError('Pilih karyawan yang diajukan izinnya.');
        return;
      }
    }

    const payload: CreateLeaveInput = {
      date,
      status,
      leaveReason: leaveReason.trim(),
    };
    const url = leaveFileUrl.trim();
    if (url) payload.leaveFileUrl = url;
    if (allowHrTarget && hrMode === 'other' && targetUserId) {
      payload.targetUserId = targetUserId;
    }

    await onCreate(payload);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Ajukan izin atau sakit"
      subtitle={
        allowHrTarget
          ? 'Satu tanggal per pengajuan. Default pemohon = akun login; HR/Admin dapat memilih karyawan lain (perusahaan sama).'
          : 'Satu tanggal per pengajuan. Pemohon mengikuti akun yang sedang login.'
      }
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" form="leave-create-form" disabled={isLoading}>
            {isLoading ? 'Mengirim…' : 'Kirim pengajuan'}
          </Button>
        </>
      }
    >
      <form id="leave-create-form" onSubmit={handleSubmit} className="space-y-4">
        {localError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {localError}
          </div>
        )}

        {allowHrTarget && (
          <div className="rounded-lg border border-border bg-muted p-4">
            <p className="mb-3 text-sm font-medium text-foreground">Pemohon</p>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="radio"
                  name="leave-applicant"
                  className="text-accent focus:ring-[var(--color-accent)]/30"
                  checked={hrMode === 'self'}
                  onChange={() => {
                    setHrMode('self');
                    setTargetUserId('');
                    setTargetSearch('');
                    setTargetListOpen(false);
                  }}
                />
                Saya sendiri (akun login)
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="radio"
                  name="leave-applicant"
                  className="text-accent focus:ring-[var(--color-accent)]/30"
                  checked={hrMode === 'other'}
                  onChange={() => {
                    setHrMode('other');
                    setTargetUserId('');
                    setTargetSearch('');
                    setTargetListOpen(true);
                  }}
                />
                Karyawan lain
              </label>
            </div>
            {hrMode === 'other' && (
              <div ref={targetBoxRef} className="relative">
                <label className="mb-1 block text-xs font-medium text-muted-foreground" htmlFor="leave-target-search">
                  Cari karyawan
                </label>
                <div className="relative">
                  <input
                    id="leave-target-search"
                    type="search"
                    autoComplete="off"
                    placeholder={loadingTargets ? 'Memuat daftar…' : 'Nama atau email…'}
                    value={targetSearch}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTargetSearch(v);
                      setTargetListOpen(true);
                      if (targetUserId) setTargetUserId('');
                    }}
                    onFocus={() => setTargetListOpen(true)}
                    disabled={loadingTargets}
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
                    aria-autocomplete="list"
                    aria-expanded={targetListOpen}
                    aria-controls="leave-target-listbox"
                  />
                  {targetUserId && (
                    <button
                      type="button"
                      onClick={() => {
                        setTargetUserId('');
                        setTargetSearch('');
                        setTargetListOpen(false);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      title="Hapus pilihan"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {targetListOpen && !loadingTargets && filteredTargets.length > 0 && (
                  <ul
                    id="leave-target-listbox"
                    role="listbox"
                    className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border bg-card py-1 shadow-lg"
                  >
                    {filteredTargets.map((u) => (
                      <li key={u.id} role="option">
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-accent)]/5"
                          onMouseDown={(ev) => ev.preventDefault()}
                          onClick={() => {
                            setTargetUserId(u.id);
                            setTargetSearch(`${u.name} (${u.email})`);
                            setTargetListOpen(false);
                          }}
                        >
                          <span className="font-medium text-foreground">{u.name}</span>
                          <span className="block text-xs text-muted-foreground">{u.email}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {targetListOpen && !loadingTargets && filteredTargets.length === 0 && targetSearch.trim() && (
                  <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card py-2 text-center text-sm text-muted-foreground shadow-lg">
                    Tidak ada karyawan ditemukan
                  </div>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Hanya Admin/HR yang dapat mengajukan untuk user lain; perusahaan harus sama dengan token Anda.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Jenis" required id="leave-create-type">
            <select
              id="leave-create-type"
              value={status}
              onChange={(e) => setStatus(e.target.value as CreateLeaveInput['status'])}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2364748B%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
              required
            >
              <option value="IZIN">Izin</option>
              <option value="SAKIT">Sakit</option>
            </select>
          </FormField>
          <FormField label="Tanggal" required id="leave-create-date">
            <input
              id="leave-create-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
              required
            />
          </FormField>
        </div>
        <FormField label="Alasan" required id="leave-create-reason">
          <textarea
            id="leave-create-reason"
            value={leaveReason}
            onChange={(e) => setLeaveReason(e.target.value)}
            placeholder="Jelaskan alasan pengajuan…"
            rows={4}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 resize-none"
            required
          />
        </FormField>
        <FormField
          label="URL lampiran"
          id="leave-create-file"
          hint="Opsional — tautan ke dokumen yang sudah diunggah ke storage."
        >
          <input
            id="leave-create-file"
            type="url"
            value={leaveFileUrl}
            onChange={(e) => setLeaveFileUrl(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
          />
        </FormField>
      </form>
    </ModalShell>
  );
}
