import { useState, useMemo, useEffect, useRef } from 'react';
import TimePicker24 from '@/components/ui/TimePicker24';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { User } from '@/modules/auth/types';
import type { User as ScheduleUser, Location } from '@/shared/types/schedule';
import { urlParserService } from '@/services/urlParserService';
import { useScheduleSalesUsers, useLocations } from '@/features/schedule/hooks/useSchedules';

export type SalesScheduleFormData = {
  /** IDs user berperan SALES yang dijadwalkan (support multiple). */
  salesIds: string[];
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
 * Form jadwal **sales** — mendukung multiple sales selection dan location dropdown.
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

  const { data: salesUsersRes, isLoading: loadingSales } = useScheduleSalesUsers();
  const salesUsers: ScheduleUser[] = salesUsersRes?.data ?? [];

  const { data: locationsRes, isLoading: loadingLocations } = useLocations({ isActive: true });
  const locations: Location[] = locationsRes?.data ?? [];

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
    if (!pickSales && user && formData.salesIds.length === 0) {
      setFormData((prev) => ({ ...prev, salesIds: [user.id] }));
    }
  }, [pickSales, user, formData.salesIds.length]);

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
        locationName: prev.locationName || `Lokasi ${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`,
        locationAddress: prev.locationAddress || 'Lokasi dari Google Maps',
        locationAccuracy: undefined,
      }));
      setMapsUrl('');
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

  const toggleSalesSelection = (salesId: string) => {
    setFormData((prev) => {
      const isSelected = prev.salesIds.includes(salesId);
      return {
        ...prev,
        salesIds: isSelected
          ? prev.salesIds.filter((id) => id !== salesId)
          : [...prev.salesIds, salesId],
      };
    });
  };

  const handleLocationSelect = (locationId: string) => {
    const selectedLocation = locations.find((loc) => loc.id === locationId);
    if (selectedLocation) {
      setFormData((prev) => ({
        ...prev,
        locationId: selectedLocation.id,
        locationName: selectedLocation.name,
        locationAddress: selectedLocation.address,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      }));
    }
  };

  const selectedSalesCount = formData.salesIds.length;
  const selectedSalesNames = salesUsers
    .filter((s) => formData.salesIds.includes(s.id))
    .map((s) => s.name)
    .join(', ');

  // Update search label when sales selected
  useEffect(() => {
    if (formData.salesIds.length > 0 && salesUsers.length > 0) {
      const selectedUsers = salesUsers.filter((s) => formData.salesIds.includes(s.id));
      if (selectedUsers.length > 0) {
        const labels = selectedUsers.map((s) => `${s.name} · ${s.email}`);
        setSalesSearch(labels.join(', '));
      }
    }
  }, [formData.salesIds, salesUsers]);

  return (
    <Card padding="md" className="p-4">
      <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-sm text-emerald-900">
        <span className="font-semibold">Jadwal sales</span>
        <span className="text-emerald-800">
          {' '}
          — penugasan untuk peran <strong>sales</strong> (bisa multiple). Admin/HR dapat memilih beberapa sales.
        </span>
      </div>
      <h3 className="mb-4 text-lg font-semibold">{editingId ? 'Edit jadwal' : 'Jadwal baru'}</h3>
      <form onSubmit={onSubmit} className="space-y-3">
        {/* Sales Selection */}
        <div className="grid grid-cols-2 gap-3">
          {pickSales ? (
            <div ref={salesSearchRef} className="relative col-span-2 sm:col-span-1">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Sales <span className="text-red-500">*</span>
                {selectedSalesCount > 0 && (
                  <span className="ml-2 text-xs text-emerald-600">
                    ({selectedSalesCount} dipilih)
                  </span>
                )}
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
                  aria-multiselectable="true"
                >
                  {loadingSales ? (
                    <li className="px-3 py-2 text-sm text-slate-500">Loading...</li>
                  ) : filteredSalesUsers.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-slate-500">Tidak ada sales yang cocok</li>
                  ) : (
                    filteredSalesUsers.map((s) => {
                      const isSelected = formData.salesIds.includes(s.id);
                      return (
                        <li key={s.id} role="option" aria-selected={isSelected}>
                          <button
                            type="button"
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-emerald-50 ${
                              isSelected ? 'bg-emerald-100 font-medium' : 'text-slate-800'
                            }`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => toggleSalesSelection(s.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">{s.name}</span>
                                <span className="block text-xs text-slate-500">{s.email}</span>
                              </div>
                              {isSelected && (
                                <span className="text-emerald-600 text-lg">✓</span>
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              )}
              {selectedSalesCount > 0 && (
                <p className="mt-1 text-xs text-emerald-700">
                  Terpilih: {selectedSalesNames}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">Klik untuk memilih/deselect multiple sales.</p>
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

        {/* Location Selection */}
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Lokasi <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.locationId || ''}
            onChange={(e) => handleLocationSelect(e.target.value)}
            className="app-input w-full"
            required
          >
            <option value="">Pilih lokasi yang sudah ada...</option>
            {loadingLocations ? (
              <option disabled>Loading...</option>
            ) : (
              locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} — {loc.address}
                </option>
              ))
            )}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Pilih lokasi existing atau gunakan Google Maps untuk membuat lokasi baru.
          </p>
        </div>

        {/* Google Maps Link (optional for new locations) */}
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            📍 Buat Lokasi Baru dari Google Maps
          </label>
          <p className="mb-2 text-xs text-slate-600">
            Jika lokasi belum ada di sistem, tempel link Google Maps untuk otomatis mengambil koordinat.
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
          {hasCoords && !formData.locationId && (
            <div className="mt-3 rounded-md bg-white p-3 border border-emerald-200">
              <p className="text-sm font-medium text-emerald-800">✓ Lokasi baru akan dibuat:</p>
              <div className="mt-2 text-xs text-slate-700 space-y-1">
                <p><span className="font-medium">Nama:</span> {formData.locationName}</p>
                <p><span className="font-medium">Alamat:</span> {formData.locationAddress}</p>
                <p><span className="font-medium">Koordinat:</span> {formData.latitude?.toFixed(6)}, {formData.longitude?.toFixed(6)}</p>
              </div>
              <a
                href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-800"
              >
                Cek di Google Maps →
              </a>
            </div>
          )}
        </div>

        {/* Time */}
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

        {/* Description */}
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

        {/* Notes */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Catatan</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="app-input min-h-[4rem]"
            placeholder="Catatan tambahan untuk sales…"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSaving || (pickSales && formData.salesIds.length === 0)}
          >
            {isSaving ? 'Menyimpan…' : editingId ? 'Perbarui' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
