import { useState, useMemo, useEffect, useRef } from 'react';
import { useScheduleTechnicians, useScheduleSalesUsers } from '../hooks/useSchedules';
import { locationApi } from '@/services/scheduleApi';
import { urlParserService } from '@/services/urlParserService';
import TimePicker24 from '@/components/ui/TimePicker24';
import Card from '@/components/ui/Card';
import type { CreateScheduleInput, UpdateScheduleInput, Schedule, User } from '@/shared/types/schedule';
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
  const initialTechIds: string[] = useMemo(() => {
    if (!initialData) return [];
    const ids = initialData.participants
      ?.filter((p) => (p.role || '').toUpperCase() === 'TECHNICIAN')
      .map((p) => p.user?.id || p.userId)
      .filter(Boolean) as string[];
    return ids.length > 0 ? ids : initialData.technician?.id ? [initialData.technician.id] : [];
  }, [initialData?.id]);

  const [technicianIds, setTechnicianIds] = useState<string[]>(initialTechIds);
  const [formData, setFormData] = useState({
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
    scheduleType: initialData?.scheduleType ?? '',
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

  // Sales observer state
  const [salesObserverIds, setSalesObserverIds] = useState<string[]>([]);
  const [salesSearch, setSalesSearch] = useState('');
  const [salesListOpen, setSalesListOpen] = useState(false);
  const salesSearchRef = useRef<HTMLDivElement>(null);
  const { data: salesUsersRes } = useScheduleSalesUsers();
  const salesUsers: User[] = salesUsersRes?.data ?? [];

  const filteredSalesUsers = useMemo(() => {
    const q = salesSearch.trim().toLowerCase();
    if (!q) return salesUsers;
    return salesUsers.filter(
      (s) => s.name.toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q)
    );
  }, [salesUsers, salesSearch]);

  const toggleSalesObserver = (id: string) => {
    setSalesObserverIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Populate sales observers saat edit
  useEffect(() => {
    if (initialData?.participants) {
      const observerIds = initialData.participants
        .filter((p: any) => p.role === 'SALES_OBSERVER')
        .map((p: any) => p.user?.id || p.userId)
        .filter(Boolean);
      if (observerIds.length > 0) {
        setSalesObserverIds(observerIds);
      }
    }
  }, [initialData?.id]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (techSearchRef.current && !techSearchRef.current.contains(e.target as Node)) {
        setTechListOpen(false);
      }
      if (salesSearchRef.current && !salesSearchRef.current.contains(e.target as Node)) {
        setSalesListOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (!initialData) {
      setTechSearch('');
    }
  }, [initialData?.id]);

  const toggleTechnician = (id: string) => {
    setTechnicianIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredTechnicians = useMemo(() => {
    const q = techSearch.trim().toLowerCase();
    if (!q) return technicianUsers;
    return technicianUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [technicianUsers, techSearch]);

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

    if (technicianIds.length === 0) newErrors.technicianId = 'Pilih minimal satu teknisi';
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
      technicianIds,
      salesObserverIds: salesObserverIds.length > 0 ? salesObserverIds : undefined,
      locationId,
      date: formData.date, // Backend expects YYYY-MM-DD format, not ISO
      startTime: formData.startTime, // Backend expects HH:mm format
      endTime: formData.endTime, // Backend expects HH:mm format
      description: formData.description || undefined,
      notes: formData.notes || undefined,
      scheduleType: formData.scheduleType
        ? (formData.scheduleType as CreateScheduleInput['scheduleType'])
        : undefined,
    };

    onSubmit(payload);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card padding="md" className="p-4">
      <div className="mb-4 rounded-lg border border-[var(--color-accent)]/10 bg-[var(--color-accent)]/5 px-3 py-2 text-sm text-accent">
         <span className="font-semibold">Jadwal teknisi</span>
         <span className="text-accent"> — penugasan teknisi ke lokasi. Pencarian nama hanya dari akun berperan teknisi.</span>
      </div>
      <h3 className="mb-4 text-lg font-semibold">{initialData ? 'Edit jadwal' : 'Jadwal baru'}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Schedule Type */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">
            Tipe jadwal <span className="text-xs font-normal text-muted-foreground/70">(opsional)</span>
          </label>
          <select
            value={formData.scheduleType}
            onChange={(e) => handleChange('scheduleType', e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
          >
            <option value="">Pilih tipe jadwal…</option>
            <option value="SURVEY">Survey</option>
            <option value="INSTALLATION">Instalasi</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            Tandai jadwal sebagai survey, instalasi, atau maintenance.
          </p>
        </div>
        {/* Technician + Date */}
        <div className="grid grid-cols-2 gap-3">
          <div ref={techSearchRef} className="relative col-span-2 sm:col-span-1">
            <label className="mb-1 block text-sm font-medium text-muted-foreground">
               Teknisi <span className="text-red-500">*</span>
             </label>
             <input
               type="search"
               autoComplete="off"
               placeholder="Cari nama atau email teknisi…"
               value={techSearch}
               onChange={(e) => { setTechSearch(e.target.value); setTechListOpen(true); }}
               onFocus={() => setTechListOpen(true)}
               className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
              aria-autocomplete="list"
              aria-expanded={techListOpen}
              aria-controls="technician-search-listbox"
            />
            {techListOpen && (
              <ul
                id="technician-search-listbox"
                role="listbox"
                className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-card py-1 shadow-lg"
               >
                 {filteredTechnicians.length === 0 ? (
                   <li className="px-3 py-2 text-sm text-muted-foreground">Tidak ada teknisi yang cocok</li>
                ) : (
                  filteredTechnicians.map((tech) => (
                    <li key={tech.id} role="option">
                      <button
                        type="button"
                        className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                          technicianIds.includes(tech.id) ? 'bg-indigo-50' : 'hover:bg-gray-50'
                        }`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => toggleTechnician(tech.id)}
                      >
                        <input
                          type="checkbox"
                          checked={technicianIds.includes(tech.id)}
                          readOnly
                          className="accent-indigo-600"
                        />
                        <div>
                          <span className="font-medium">{tech.name}</span>
                          <span className="block text-xs text-muted-foreground">{tech.email}</span>
                        </div>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
            {technicianIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {technicianUsers.filter((u) => technicianIds.includes(u.id)).map((u) => (
                  <span
                    key={u.id}
                    className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-800"
                  >
                    {u.name}
                    <button
                      type="button"
                      onClick={() => toggleTechnician(u.id)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">Pilih satu atau lebih teknisi untuk ditugaskan ke lokasi ini.</p>
            {errors.technicianId && (
              <p className="mt-1 text-sm text-red-500">{errors.technicianId}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Tanggal</label>
             <input
               type="date"
               value={formData.date}
               onChange={(e) => handleChange('date', e.target.value)}
               className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
            />
            {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
          </div>
        </div>

        {/* Location Manual Input */}
        <div className="rounded-lg border border-[var(--color-accent)]/10 bg-[var(--color-accent)]/5 p-3">
           <label className="mb-1 block text-sm font-medium text-muted-foreground">
            Lokasi <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={formData.locationName}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, locationName: e.target.value, locationId: '' }));
              }}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
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
               className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
              placeholder="Alamat lengkap lokasi"
            />
            {errors.locationAddress && (
              <p className="text-sm text-red-500">{errors.locationAddress}</p>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
             Ketik nama dan alamat lokasi secara manual, atau gunakan Google Maps untuk otomatis mengisi koordinat.
           </p>
        </div>

        {/* Google Maps Link */}
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
          <label className="mb-1 block text-sm font-medium text-muted-foreground">
             📍 Buat Lokasi Baru dari Google Maps
           </label>
           <p className="mb-2 text-xs text-muted-foreground">
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
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 min-w-0 flex-1"
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
              <div className="mt-3 rounded-md bg-card p-3 border border-emerald-200">
                 <p className="text-sm font-medium text-emerald-800">✓ Lokasi baru akan dibuat:</p>
                 <div className="mt-2 text-xs text-muted-foreground space-y-1">
                <p><span className="font-medium">Nama:</span> {formData.locationName}</p>
                <p><span className="font-medium">Alamat:</span> {formData.locationAddress}</p>
                <p><span className="font-medium">Koordinat:</span> {formData.latitude?.toFixed(6)}, {formData.longitude?.toFixed(6)}</p>
              </div>
              <a
                href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-accent hover:text-[var(--color-accent-secondary)]"
              >
                Cek di Google Maps →
              </a>
            </div>
          )}
        </div>

        {/* Sales Observer */}
        <Card padding="md" className="border border-dashed border-emerald-300 bg-emerald-50/30 p-3">
          <label className="mb-2 block text-sm font-medium text-emerald-800">
            👥 Sales penerima laporan <span className="text-xs font-normal text-emerald-600">(opsional)</span>
          </label>
          <div ref={salesSearchRef} className="relative">
            <input
              type="search"
              autoComplete="off"
              placeholder="Cari nama sales…"
              value={salesSearch}
              onChange={(e) => { setSalesSearch(e.target.value); setSalesListOpen(true); }}
              onFocus={() => setSalesListOpen(true)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
            />
            {salesListOpen && (
              <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border bg-card py-1 shadow-lg">
                {filteredSalesUsers.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-muted-foreground">Tidak ada sales yang cocok</li>
                ) : filteredSalesUsers.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                        salesObserverIds.includes(s.id) ? 'bg-emerald-50' : 'hover:bg-gray-50'
                      }`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggleSalesObserver(s.id)}
                    >
                      <input
                        type="checkbox"
                        checked={salesObserverIds.includes(s.id)}
                        readOnly
                        className="accent-emerald-600"
                      />
                      <div>
                        <span className="font-medium">{s.name}</span>
                        <span className="block text-xs text-muted-foreground">{s.email}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {salesObserverIds.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {salesUsers.filter((s) => salesObserverIds.includes(s.id)).map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800"
                >
                  {s.name}
                  <button
                    type="button"
                    onClick={() => toggleSalesObserver(s.id)}
                    className="text-emerald-600 hover:text-emerald-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Sales yang dipilih akan menerima laporan PDF saat teknisi menyelesaikan pekerjaan.
          </p>
        </Card>

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

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">Deskripsi</label>
           <textarea
             value={formData.description}
             onChange={(e) => handleChange('description', e.target.value)}
             rows={2}
             className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 min-h-[4rem]"
            placeholder="Deskripsi pekerjaan teknisi…"
          />
          <p className="mt-1 text-xs text-muted-foreground">{(formData.description || '').length}/1000 karakter</p>
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">Catatan</label>
           <textarea
             value={formData.notes}
             onChange={(e) => handleChange('notes', e.target.value)}
             rows={2}
             className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 min-h-[4rem]"
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
