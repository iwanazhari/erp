import { useState, useMemo, useEffect } from 'react';
import { useLocations, useTechnicianAvailability, useTechnicians } from '../hooks/useSchedules';
import MapPicker from '@/components/ui/MapPicker';
import TimePicker24 from '@/components/ui/TimePicker24';
import type { CreateScheduleInput, UpdateScheduleInput, Schedule, AvailabilityData, User } from '@/shared/types/schedule';
import { calculateDuration } from '../utils/scheduleHelpers';

type Props = {
  initialData?: Schedule;
  onSubmit: (data: CreateScheduleInput | UpdateScheduleInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  initialDate?: Date;
};

export default function ScheduleForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  initialDate = new Date(),
}: Props) {
  const [formData, setFormData] = useState({
    technicianId: initialData?.technician.id || '',
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

  const { data: techniciansData } = useTechnicians();
  const technicians: User[] = techniciansData?.data || [];

  const { data: availabilityData } = useTechnicianAvailability(
    formData.technicianId || undefined,
    formData.date || undefined
  );

  const availability: AvailabilityData | undefined = availabilityData?.data;

  // State for technician location coordinates
  const [techLatitude, setTechLatitude] = useState<number | undefined>();
  const [techLongitude, setTechLongitude] = useState<number | undefined>();
  const [techAddress, setTechAddress] = useState('');

  const duration = useMemo(() => {
    if (!formData.date || !formData.startTime || !formData.endTime) {
      return { hours: 0, minutes: 0 };
    }
    const start = new Date(`${formData.date}T${formData.startTime}`);
    const end = new Date(`${formData.date}T${formData.endTime}`);
    return calculateDuration(start.toISOString(), end.toISOString());
  }, [formData.date, formData.startTime, formData.endTime]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset errors when form changes
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

    const payload: CreateScheduleInput & { latitude?: number; longitude?: number; address?: string } = {
      technicianId: formData.technicianId,
      locationId: formData.locationId,
      date: new Date(formData.date).toISOString(),
      startTime: new Date(`${formData.date}T${formData.startTime}`).toISOString(),
      endTime: new Date(`${formData.date}T${formData.endTime}`).toISOString(),
      description: formData.description || undefined,
      notes: formData.notes || undefined,
      // Add technician location coordinates if available
      ...(techLatitude !== undefined && techLongitude !== undefined && {
        latitude: techLatitude,
        longitude: techLongitude,
        address: techAddress || undefined,
      }),
    };

    onSubmit(payload);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Technician Select */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Teknisi <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.technicianId}
          onChange={(e) => handleChange('technicianId', e.target.value)}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.technicianId ? 'border-red-500' : 'border-slate-300'
          }`}
        >
          <option value="">Pilih Teknisi</option>
          {technicians.map((tech) => (
            <option key={tech.id} value={tech.id}>
              {tech.name}
            </option>
          ))}
        </select>
        {errors.technicianId && (
          <p className="mt-1 text-sm text-red-500">{errors.technicianId}</p>
        )}
      </div>

      {/* Location Select */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Lokasi <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.locationId}
          onChange={(e) => handleChange('locationId', e.target.value)}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.locationId ? 'border-red-500' : 'border-slate-300'
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

      {/* Date Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Tanggal <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.date ? 'border-red-500' : 'border-slate-300'
          }`}
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-500">{errors.date}</p>
        )}
      </div>

      {/* Time Inputs */}
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

      {/* Duration Display */}
      {formData.startTime && formData.endTime && (
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Durasi:</span>
            <span className="text-sm font-medium text-slate-800">
              {duration.hours}j {duration.minutes}m
            </span>
          </div>
        </div>
      )}

      {/* Availability Info */}
      {availability && formData.technicianId && (
        <div className={`rounded-lg p-4 ${
          availability.isAvailable ? 'bg-emerald-50' : 'bg-amber-50'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm font-medium ${
                availability.isAvailable ? 'text-emerald-800' : 'text-amber-800'
              }`}>
                {availability.isAvailable ? '✓ Teknisi tersedia' : '⚠ Teknisi tidak tersedia'}
              </p>
              <p className={`text-xs mt-1 ${
                availability.isAvailable ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                Kuota: {availability.quotaUsed}/{availability.quotaMax} lokasi
              </p>
            </div>
            {availability.availableSlots.length > 0 && availability.isAvailable && (
              <div className="text-xs text-emerald-700">
                <p className="font-medium">Slot tersedia:</p>
                {availability.availableSlots.slice(0, 2).map((slot, idx) => (
                  <p key={idx}>
                    {slot.startTime.split('T')[1].slice(0, 5)} - {slot.endTime.split('T')[1].slice(0, 5)}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Technician Location Map Picker */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Lokasi Teknisi (Opsional)
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Pilih lokasi teknisi menggunakan input manual (autocomplete) atau link Google Maps untuk akurasi lebih baik.
        </p>
        <MapPicker
          latitude={techLatitude}
          longitude={techLongitude}
          onChange={(lat, lng, addr) => {
            setTechLatitude(lat);
            setTechLongitude(lng);
            setTechAddress(addr);
          }}
        />
        {techAddress && (
          <div className="mt-2 text-xs text-slate-600">
            <strong>Lokasi terpilih:</strong> {techAddress}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Deskripsi
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Deskripsi pekerjaan"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-xs text-slate-500 mt-1">
          {formData.description.length}/1000 karakter
        </p>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Catatan Tambahan
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          maxLength={1000}
          rows={2}
          placeholder="Catatan tambahan (opsional)"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Menyimpan...' : initialData ? 'Perbarui' : 'Buat Jadwal'}
        </button>
      </div>
    </form>
  );
}
