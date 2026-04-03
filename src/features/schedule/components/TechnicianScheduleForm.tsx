import { useState, useMemo, useEffect, useRef } from 'react';
import { useLocations, useTechnicianAvailability, useScheduleTechnicians } from '../hooks/useSchedules';
import TimePicker24 from '@/components/ui/TimePicker24';
import type { CreateScheduleInput, UpdateScheduleInput, Schedule, AvailabilityData, User } from '@/shared/types/schedule';
import {
  calculateDuration,
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
    locationId: initialData?.location.id || '',
    date: initialData
      ? initialData.date.split('T')[0]
      : initialDate.toISOString().split('T')[0],
    startTime: initialData ? initialData.startTime.split('T')[1].slice(0, 5) : '',
    endTime: initialData ? initialData.endTime.split('T')[1].slice(0, 5) : '',
    description: initialData?.description || '',
    notes: initialData?.notes || '',
  });

  const { data: locationsData } = useLocations({ isActive: true, limit: 100 });
  const locations = locationsData?.data || [];

  const { data: techniciansData } = useScheduleTechnicians();
  const technicians: User[] = techniciansData?.data || [];

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

  const duration = useMemo(() => {
    if (!formData.date || !formData.startTime || !formData.endTime) {
      return { hours: 0, minutes: 0 };
    }
    const start = new Date(`${formData.date}T${formData.startTime}`);
    const end = new Date(`${formData.date}T${formData.endTime}`);
    return calculateDuration(start.toISOString(), end.toISOString());
  }, [formData.date, formData.startTime, formData.endTime]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setErrors({});
  }, [formData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.technicianId) newErrors.technicianId = 'Teknisi wajib dipilih';
    if (!formData.locationId) newErrors.locationId = 'Lokasi wajib dipilih';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const payload: CreateScheduleInput = {
      technicianId: formData.technicianId,
      locationId: formData.locationId,
      date: new Date(formData.date).toISOString(),
      startTime: new Date(`${formData.date}T${formData.startTime}`).toISOString(),
      endTime: new Date(`${formData.date}T${formData.endTime}`).toISOString(),
      description: formData.description || undefined,
      notes: formData.notes || undefined,
    };

    onSubmit(payload);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-sm text-indigo-900">
        <span className="font-semibold">Jadwal teknisi</span>
        <span className="text-indigo-800"> — penugasan teknisi ke lokasi. Pencarian nama hanya dari akun berperan teknisi.</span>
      </div>

      <div ref={techSearchRef} className="relative">
        <label className="mb-2 block text-sm font-medium text-slate-700">
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
          className={`app-input px-4 py-2.5 ${
            errors.technicianId ? 'border-red-500 focus:ring-red-500/30' : ''
          }`}
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
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Lokasi <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.locationId}
          onChange={(e) => handleChange('locationId', e.target.value)}
          className={`app-select px-4 py-2.5 ${
            errors.locationId ? 'border-red-500 focus:ring-red-500/30' : ''
          }`}
        >
          <option value="">Pilih Lokasi</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name} - {loc.address}
            </option>
          ))}
        </select>
        {errors.locationId && (
          <p className="mt-1 text-sm text-red-500">{errors.locationId}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Tanggal <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className={`app-input px-4 py-2.5 ${errors.date ? 'border-red-500 focus:ring-red-500/30' : ''}`}
        />
        {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <TimePicker24
            label="Waktu Mulai"
            value={formData.startTime}
            onChange={(time) => handleChange('startTime', time)}
          />
          {errors.startTime && (
            <p className="mt-1 text-sm text-red-500">{errors.startTime}</p>
          )}
        </div>

        <div>
          <TimePicker24
            label="Waktu Akhir"
            value={formData.endTime}
            onChange={(time) => handleChange('endTime', time)}
          />
          {errors.endTime && (
            <p className="mt-1 text-sm text-red-500">{errors.endTime}</p>
          )}
        </div>
      </div>

      {formData.startTime && formData.endTime && (
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Durasi:</span>
            <span className="text-sm font-medium text-slate-800">
              {duration.hours}j {duration.minutes}m
            </span>
          </div>
        </div>
      )}

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
                Kuota: {availability.quotaUsed}/{availability.quotaMax} lokasi
              </p>
            </div>
            {availability.availableSlots.length > 0 && availability.isAvailable && (
              <div className="text-xs text-emerald-700">
                <p className="font-medium">Slot tersedia:</p>
                {availability.availableSlots.slice(0, 2).map((slot, idx) => (
                  <p key={idx}>
                    {slot.startTime.split('T')[1].slice(0, 5)} -{' '}
                    {slot.endTime.split('T')[1].slice(0, 5)}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Deskripsi</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Deskripsi pekerjaan"
          className="app-input resize-none px-4 py-2.5"
        />
        <p className="mt-1 text-xs text-slate-500">{formData.description.length}/1000 karakter</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Catatan Tambahan</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          maxLength={1000}
          rows={2}
          placeholder="Catatan tambahan (opsional)"
          className="app-input resize-none px-4 py-2.5"
        />
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : initialData ? 'Perbarui' : 'Buat jadwal'}
        </Button>
      </div>
    </form>
  );
}
