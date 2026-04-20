import { useState, useMemo, useEffect, useRef } from 'react';
import { useTechnicianAvailability, useScheduleTechnicians } from '../hooks/useSchedules';
import { locationApi } from '@/services/scheduleApi';
import { urlParserService } from '@/services/urlParserService';
import TimePicker24 from '@/components/ui/TimePicker24';
import Card from '@/components/ui/Card';
import type { CreateScheduleInput, UpdateScheduleInput, Schedule, AvailabilityData, User } from '@/shared/types/schedule';
import {
  getPrimaryTechnicianIdFromSchedule,
  getScheduleAssigneeDisplay,
} from '../utils/scheduleHelpers';
import Button from '@/components/ui/Button';

type Props = {
  initialData?: Schedule;
  onSubmit: (data: CreateScheduleInput | UpdateScheduleInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  initialDate?: Date;
};

/**
 * Form jadwal **teknisi** — pencarian user hanya dari pool teknisi (`useScheduleTechnicians`).
 * Tidak dipakai untuk jadwal sales (lihat `SalesScheduleForm`).
 */
export default function TechnicianScheduleForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  initialDate = new Date(),
}: Props) {
  const [formData, setFormData] = useState({
    technicianId: initialData ? getPrimaryTechnicianIdFromSchedule(initialData) : '',
    locationId: initialData?.location?.id || '',
    locationName: initialData?.location?.name || '',
    locationAddress: initialData?.location?.address || '',
    latitude: initialData?.location?.latitude ?? undefined as number | undefined,
    longitude: initialData?.location?.longitude ?? undefined as number | undefined,
    date: initialData
      ? initialData.date.split('T')[0]
      : initialDate.toISOString().split('T')[0],
    startTime: initialData ? initialData.startTime.split('T')[1].slice(0, 5) : '',
    endTime: initialData ? initialData.endTime.split('T')[1].slice(0, 5) : '',
    description: initialData?.description || '',
    notes: initialData?.notes || '',
  });

  // Google Maps URL parsing
  const [mapsUrl, setMapsUrl] = useState('');
  const [mapsError, setMapsError] = useState('');
  const [isParsingMaps, setIsParsingMaps] = useState(false);

  const { data: techniciansData } = useScheduleTechnicians();
  const techniciansDataRaw = techniciansData?.data as any;
  const technicians: User[] = Array.isArray(techniciansDataRaw)
    ? techniciansDataRaw
    : techniciansDataRaw && Array.isArray(techniciansDataRaw.users)
    ? techniciansDataRaw.users
    : [];

  const technicianUsers = useMemo(() => {
    const allowed = new Set(['TECHNICIAN', 'TECHNICIAN_PAYMENT']);
    return technicians.filter((u) => allowed.has((u.role || '').toUpperCase()));
  }, [technicians]);

  const [techSearch, setTechSearch] = useState('');
  const [techListOpen, setTechListOpen] = useState(false);
  const techSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (techSearchRef.current && !techSearchRef.current.contains(e.target as Node)) {
        setTechListOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (initialData) {
      const t = initialData.technician;
      if (t) {
        setTechSearch(`${t.name} · ${t.email}`);
      } else {
        const { name, email } = getScheduleAssigneeDisplay(initialData);
        setTechSearch(name && email ? `${name} · ${email}` : name || '');
      }
    } else {
      setTechSearch('');
    }
  }, [initialData?.id, initialData?.technician?.id]);

  const filteredTechnicians = useMemo(() => {
    const q = techSearch.trim().toLowerCase();
    if (!q) return technicianUsers;
    return technicianUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [technicianUsers, techSearch]);

  const { data: availabilityData } = useTechnicianAvailability(
    formData.technicianId || undefined,
    formData.date || undefined
  );

  const availability: AvailabilityData | undefined = availabilityData?.data;

  const hasCoords =
    formData.latitude != null &&
    formData.longitude != null &&
    !Number.isNaN(formData.latitude) &&
    !Number.isNaN(formData.longitude);

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
      console.log('[TECHNICIAN FORM] Parsed maps URL result:', data);
      setFormData((prev) => {
        const next = {
          ...prev,
          latitude: data.latitude,
          longitude: data.longitude,
          locationName: prev.locationName || `Lokasi ${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`,
          locationAddress: prev.locationAddress || 'Lokasi dari Google Maps',
          locationId: '',
        };
        console.log('[TECHNICIAN FORM] Updated form state:', { latitude: next.latitude, longitude: next.longitude });
        return next;
      });
      setMapsUrl('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memproses link.';
      setMapsError(message);
    } finally {
      setIsParsingMaps(false);
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setErrors({});
  }, [formData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.technicianId) newErrors.technicianId = 'Teknisi wajib dipilih';
    if (!formData.locationName.trim()) newErrors.locationName = 'Nama lokasi wajib diisi';
    if (!formData.locationAddress.trim()) newErrors.locationAddress = 'Alamat lokasi wajib diisi';
    if (!formData.date) newErrors.date = 'Tanggal wajib diisi';
    if (!formData.startTime) newErrors.startTime = 'Waktu mulai wajib diisi';
    if (!formData.endTime) newErrors.endTime = 'Waktu akhir wajib diisi';

    if (formData.startTime && formData.endTime) {
      const start = new Date(`${formData.date}T${formData.startTime}`);
      const end = new Date(`${formData.date}T${formData.endTime}`);

      if (end <= start) {
        newErrors.endTime = 'Waktu akhir harus lebih besar dari waktu mulai';
      }

      const durationMins = (end.getTime() - start.getTime()) / (1000 * 60);
      if (durationMins < 30) {
        newErrors.endTime = 'Durasi minimal 30 menit';
      }
      if (durationMins > 480) {
        newErrors.endTime = 'Durasi maksimal 8 jam';
      }
    }

    const today = new Date().toISOString().split('T')[0];
    if (formData.date < today) {
      newErrors.date = 'Tanggal tidak boleh di masa lalu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    let locationId = formData.locationId;

    // Create new location if no existing locationId
    if (!locationId) {
      console.log('[TECHNICIAN FORM] Creating location with data:', {
        name: formData.locationName.trim(),
        address: formData.locationAddress.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
        locationId: formData.locationId,
      });

      if (!formData.latitude || !formData.longitude) {
        setErrors((prev) => ({ ...prev, locationName: 'Lokasi harus diisi dari Google Maps. Tempel link Google Maps untuk mengisi koordinat.' }));
        return;
      }
      try {
        const locationData: any = {
          name: formData.locationName.trim(),
          address: formData.locationAddress.trim(),
          latitude: formData.latitude,
          longitude: formData.longitude,
          isActive: true,
        };
        console.log('[TECHNICIAN FORM] Sending to API:', locationData);
        const response = await locationApi.create(locationData);
        console.log('[TECHNICIAN FORM] Location created:', response.data);
        locationId = response.data.id;
      } catch (err) {
        console.error('[TECHNICIAN FORM] Failed to create location:', err);
        setErrors((prev) => ({ ...prev, locationName: 'Gagal membuat lokasi. Coba lagi.' }));
        return;
      }
    }

    const [startHour, startMinute] = formData.startTime.split(':').map(Number);
    const [endHour, endMinute] = formData.endTime.split(':').map(Number);
    const startDate = new Date(formData.date);
    startDate.setHours(startHour, startMinute, 0, 0);
    const endDate = new Date(formData.date);
    endDate.setHours(endHour, endMinute, 0, 0);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('[TECHNICIAN FORM] Invalid date/time values', {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        startHour, startMinute, endHour, endMinute,
      });
      setErrors((prev) => ({ ...prev, startTime: 'Waktu mulai/akhir tidak valid.' }));
      return;
    }

    const payload: CreateScheduleInput = {
      technicianId: formData.technicianId,
      locationId,
      date: formData.date, // Backend expects YYYY-MM-DD format, not ISO
      startTime: formData.startTime, // Backend expects HH:mm format
      endTime: formData.endTime, // Backend expects HH:mm format
      description: formData.description || undefined,
      notes: formData.notes || undefined,
    };

    onSubmit(payload);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card padding="md" className="p-4">
      <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-sm text-indigo-900">
        <span className="font-semibold">Jadwal teknisi</span>
        <span className="text-indigo-800"> — penugasan teknisi ke lokasi. Pencarian nama hanya dari akun berperan teknisi.</span>
      </div>
      <h3 className="mb-4 text-lg font-semibold">{initialData ? 'Edit jadwal' : 'Jadwal baru'}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Technician + Date */}
        <div className="grid grid-cols-2 gap-3">
          <div ref={techSearchRef} className="relative col-span-2 sm:col-span-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Teknisi <span className="text-red-500">*</span>
            </label>
            <input
              type="search"
              autoComplete="off"
              placeholder="Cari nama atau email teknisi…"
              value={techSearch}
              onChange={(e) => {
                const v = e.target.value;
                setTechSearch(v);
                setTechListOpen(true);
                if (formData.technicianId) {
                  handleChange('technicianId', '');
                }
              }}
              onFocus={() => setTechListOpen(true)}
              className="app-input w-full"
              aria-autocomplete="list"
              aria-expanded={techListOpen}
              aria-controls="technician-search-listbox"
            />
            {techListOpen && (
              <ul
                id="technician-search-listbox"
                role="listbox"
                className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
              >
                {filteredTechnicians.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-slate-500">Tidak ada teknisi yang cocok</li>
                ) : (
                  filteredTechnicians.map((tech) => (
                    <li key={tech.id} role="option">
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm text-slate-800 hover:bg-indigo-50"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          handleChange('technicianId', tech.id);
                          setTechSearch(`${tech.name} · ${tech.email}`);
                          setTechListOpen(false);
                        }}
                      >
                        <span className="font-medium">{tech.name}</span>
                        <span className="block text-xs text-slate-500">{tech.email}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
            <p className="mt-1 text-xs text-slate-500">Hanya peran teknisi — terpisah dari daftar sales.</p>
            {errors.technicianId && (
              <p className="mt-1 text-sm text-red-500">{errors.technicianId}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tanggal</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="app-input"
            />
            {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
          </div>
        </div>

        {/* Location Manual Input */}
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Lokasi <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={formData.locationName}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, locationName: e.target.value, locationId: '' }));
              }}
              className="app-input w-full"
              placeholder="Nama lokasi (cth: Kantor Client ABC)"
            />
            {errors.locationName && (
              <p className="text-sm text-red-500">{errors.locationName}</p>
            )}
            <input
              type="text"
              value={formData.locationAddress}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, locationAddress: e.target.value, locationId: '' }));
              }}
              className="app-input w-full"
              placeholder="Alamat lengkap lokasi"
            />
            {errors.locationAddress && (
              <p className="text-sm text-red-500">{errors.locationAddress}</p>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Ketik nama dan alamat lokasi secara manual, atau gunakan Google Maps untuk otomatis mengisi koordinat.
          </p>
        </div>

        {/* Google Maps Link */}
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
            onChange={(time) => handleChange('startTime', time)}
          />
          <TimePicker24
            label="Waktu selesai"
            value={formData.endTime}
            onChange={(time) => handleChange('endTime', time)}
          />
        </div>

        {/* Availability */}
        {availability && formData.technicianId && (
          <div
            className={`rounded-lg p-4 ${availability.isAvailable ? 'bg-emerald-50' : 'bg-amber-50'}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    availability.isAvailable ? 'text-emerald-800' : 'text-amber-800'
                  }`}
                >
                  {availability.isAvailable ? '✓ Teknisi tersedia' : '⚠ Teknisi tidak tersedia'}
                </p>
                <p
                  className={`mt-1 text-xs ${
                    availability.isAvailable ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  Kuota: {(availability as any).uniqueLocationsCount ?? 0}/{(availability as any).maxDailyLocations ?? 5} lokasi
                </p>
              </div>
              {availability.isAvailable && (availability as any).remainingQuota !== undefined && (
                <div className="text-xs text-emerald-700">
                  <p className="font-medium">Sisa kuota hari ini:</p>
                  <p>{(availability as any).remainingQuota} lokasi</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Deskripsi</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={2}
            className="app-input min-h-[4rem]"
            placeholder="Deskripsi pekerjaan teknisi…"
          />
          <p className="mt-1 text-xs text-slate-500">{(formData.description || '').length}/1000 karakter</p>
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Catatan</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={2}
            className="app-input min-h-[4rem]"
            placeholder="Catatan tambahan (opsional)"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan…' : initialData ? 'Perbarui' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
