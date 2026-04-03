import { useState, useMemo, useEffect, useRef } from 'react';
import TimePicker24 from '@/components/ui/TimePicker24';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { User } from '@/modules/auth/types';
import type { User as ScheduleUser } from '@/shared/types/schedule';
import { urlParserService } from '@/services/urlParserService';
import { useScheduleSalesUsers } from '@/features/schedule/hooks/useSchedules';

export type SalesScheduleFormData = {
  /** ID user berperan SALES yang dijadwalkan (nama legacy dari field teknisi). */
  technicianId: string;
  locationId?: string;
  locationName: string;
  locationAddress: string;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  notes: string;
};

type Props = {
  formData: SalesScheduleFormData;
  setFormData: React.Dispatch<React.SetStateAction<SalesScheduleFormData>>;
  user: User | null;
  editingId: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSaving: boolean;
};

/** HR / admin / supervisor: boleh memilih sales lain; akun sales: hanya diri sendiri. */
function canPickSalesAssignee(role: string | undefined): boolean {
  const r = (role || '').toLowerCase();
  return r === 'admin' || r === 'supervisor' || r === 'hr';
}

/**
 * Form jadwal **sales** — pool user dari `useScheduleSalesUsers` (bukan teknisi).
 * Lokasi dari link Google Maps (parse koordinat).
 */
export default function SalesScheduleForm({
  formData,
  setFormData,
  user,
  editingId,
  onSubmit,
  onCancel,
  isSaving,
}: Props) {
  const pickSales = canPickSalesAssignee(user?.role);

  const { data: salesUsersRes } = useScheduleSalesUsers();
  const salesUsers: ScheduleUser[] = salesUsersRes?.data ?? [];

  const [salesSearch, setSalesSearch] = useState('');
  const [salesListOpen, setSalesListOpen] = useState(false);
  const salesSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (salesSearchRef.current && !salesSearchRef.current.contains(e.target as Node)) {
        setSalesListOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (!pickSales && user) {
      setSalesSearch(`${user.name} · ${user.email}`);
    }
  }, [pickSales, user]);

  /** Sinkronkan label pencarian saat ID sales terpilih (bukan saat dikosongkan saat mengetik). */
  useEffect(() => {
    if (!pickSales || !formData.technicianId) return;
    const su = salesUsers.find((s) => s.id === formData.technicianId);
    if (su) setSalesSearch(`${su.name} · ${su.email}`);
  }, [pickSales, formData.technicianId, salesUsers]);

  const filteredSalesUsers = useMemo(() => {
    const q = salesSearch.trim().toLowerCase();
    if (!q) return salesUsers;
    return salesUsers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q)
    );
  }, [salesUsers, salesSearch]);

  const [mapsUrl, setMapsUrl] = useState('');
  const [mapsError, setMapsError] = useState('');
  const [isParsingMaps, setIsParsingMaps] = useState(false);

  const handleParseMapsLink = async () => {
    setMapsError('');
    const url = mapsUrl.trim();
    if (!url) {
      setMapsError('Tempel link Google Maps terlebih dahulu.');
      return;
    }
    if (!urlParserService.isValidGoogleMapsUrl(url)) {
      setMapsError('URL tidak valid. Gunakan link dari Google Maps (maps.app.goo.gl, google.com/maps, dll.).');
      return;
    }
    setIsParsingMaps(true);
    try {
      const data = await urlParserService.parseMapsUrl(url);
      setFormData((prev) => ({
        ...prev,
        latitude: data.latitude,
        longitude: data.longitude,
        locationAddress: prev.locationAddress || 'Lokasi dari Google Maps',
        locationAccuracy: undefined,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memproses link.';
      setMapsError(message);
    } finally {
      setIsParsingMaps(false);
    }
  };

  const hasCoords =
    formData.latitude != null &&
    formData.longitude != null &&
    !Number.isNaN(formData.latitude) &&
    !Number.isNaN(formData.longitude);

  return (
    <Card padding="md" className="p-4">
      <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-sm text-emerald-900">
        <span className="font-semibold">Jadwal sales</span>
        <span className="text-emerald-800">
          {' '}
          — penugasan hanya untuk peran <strong>sales</strong> (bukan teknisi). Pool user terpisah dari halaman Jadwal
          Teknisi.
        </span>
      </div>
      <h3 className="mb-4 text-lg font-semibold">{editingId ? 'Edit jadwal' : 'Jadwal baru'}</h3>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {pickSales ? (
            <div ref={salesSearchRef} className="relative col-span-2 sm:col-span-1">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Sales <span className="text-red-500">*</span>
              </label>
              <input
                type="search"
                autoComplete="off"
                placeholder="Cari nama atau email sales…"
                value={salesSearch}
                onChange={(e) => {
                  const v = e.target.value;
                  setSalesSearch(v);
                  setSalesListOpen(true);
                  if (formData.technicianId) {
                    setFormData((prev) => ({ ...prev, technicianId: '' }));
                  }
                }}
                onFocus={() => setSalesListOpen(true)}
                className="app-input w-full"
                aria-autocomplete="list"
                aria-expanded={salesListOpen}
              />
              {salesListOpen && (
                <ul
                  role="listbox"
                  className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                >
                  {filteredSalesUsers.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-slate-500">Tidak ada sales yang cocok</li>
                  ) : (
                    filteredSalesUsers.map((s) => (
                      <li key={s.id} role="option">
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm text-slate-800 hover:bg-emerald-50"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, technicianId: s.id }));
                            setSalesSearch(`${s.name} · ${s.email}`);
                            setSalesListOpen(false);
                          }}
                        >
                          <span className="font-medium">{s.name}</span>
                          <span className="block text-xs text-slate-500">{s.email}</span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
              <p className="mt-1 text-xs text-slate-500">Hanya akun berperan sales — terpisah dari pencarian teknisi di Jadwal Teknisi.</p>
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Sales <span className="text-slate-400">(Anda)</span>
              </label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2"
              />
            </div>
          )}

          <div className={pickSales ? 'col-span-2 sm:col-span-1' : ''}>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tanggal</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="app-input"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nama lokasi</label>
          <input
            type="text"
            value={formData.locationName}
            onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
            placeholder="Contoh: Kantor klien, Toko ABC, Cabang Jakarta"
            className="app-input"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Link Google Maps <span className="text-red-500">*</span>
          </label>
          <p className="mb-2 text-xs text-slate-500">
            Tempel link lokasi dari Google Maps, lalu klik ambil koordinat. Tanpa peta interaktif atau isi latitude/longitude
            manual.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <input
              type="url"
              value={mapsUrl}
              onChange={(e) => {
                setMapsUrl(e.target.value);
                setMapsError('');
              }}
              placeholder="https://maps.app.goo.gl/... atau https://www.google.com/maps/..."
              className="app-input min-w-0 flex-1"
              autoComplete="off"
            />
            <Button
              type="button"
              variant="secondary"
              className="shrink-0"
              disabled={isParsingMaps}
              onClick={handleParseMapsLink}
            >
              {isParsingMaps ? 'Memproses…' : 'Ambil koordinat'}
            </Button>
          </div>
          {mapsError && <p className="mt-1 text-sm text-red-600">{mapsError}</p>}
          {hasCoords && (
            <p className="mt-2 text-sm text-emerald-800">
              Koordinat lokasi siap dipakai.{' '}
              <a
                href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 underline hover:text-indigo-800"
              >
                Buka di Google Maps
              </a>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TimePicker24
            label="Waktu mulai"
            value={formData.startTime}
            onChange={(time) => setFormData({ ...formData, startTime: time })}
          />
          <TimePicker24
            label="Waktu selesai"
            value={formData.endTime}
            onChange={(time) => setFormData({ ...formData, endTime: time })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Deskripsi</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="app-input min-h-[4rem]"
            placeholder="Deskripsi kunjungan sales…"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving || (pickSales && !formData.technicianId)}>
            {isSaving ? 'Menyimpan…' : editingId ? 'Perbarui' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
