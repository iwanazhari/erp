import { useState, useEffect } from 'react';
import type { Location, CreateLocationInput, UpdateLocationInput } from '@/shared/types/schedule';
import Button from '@/components/ui/Button';

type Props = {
  initialData?: Location;
  onSubmit: (data: CreateLocationInput | UpdateLocationInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

export default function LocationForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: Props) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    latitude: initialData?.latitude?.toString() || '',
    longitude: initialData?.longitude?.toString() || '',
    radius: initialData?.radius?.toString() || '50',
    description: initialData?.description || '',
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setErrors({});
  }, [formData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nama lokasi wajib diisi';
    if (!formData.address.trim()) newErrors.address = 'Alamat wajib diisi';
    
    if (!formData.latitude) {
      newErrors.latitude = 'Latitude wajib diisi';
    } else {
      const lat = parseFloat(formData.latitude);
      if (lat < -90 || lat > 90) {
        newErrors.latitude = 'Latitude harus antara -90 hingga 90';
      }
    }

    if (!formData.longitude) {
      newErrors.longitude = 'Longitude wajib diisi';
    } else {
      const lng = parseFloat(formData.longitude);
      if (lng < -180 || lng > 180) {
        newErrors.longitude = 'Longitude harus antara -180 hingga 180';
      }
    }

    if (formData.radius) {
      const radius = parseFloat(formData.radius);
      if (radius < 10 || radius > 1000) {
        newErrors.radius = 'Radius harus antara 10-1000 meter';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const payload: CreateLocationInput | UpdateLocationInput = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      radius: formData.radius ? parseFloat(formData.radius) : undefined,
      description: formData.description.trim() || undefined,
      isActive: formData.isActive,
    };

    onSubmit(payload);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Nama Lokasi <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.name ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="Contoh: Kantor Cabang Jakarta"
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Alamat <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          rows={3}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
            errors.address ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="Alamat lengkap lokasi"
        />
        {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Latitude <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => handleChange('latitude', e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.latitude ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="-6.2088"
          />
          {errors.latitude && <p className="mt-1 text-sm text-red-500">{errors.latitude}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Longitude <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => handleChange('longitude', e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.longitude ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="106.8456"
          />
          {errors.longitude && <p className="mt-1 text-sm text-red-500">{errors.longitude}</p>}
        </div>
      </div>

      {/* Radius */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Radius (meter)
        </label>
        <input
          type="number"
          value={formData.radius}
          onChange={(e) => handleChange('radius', e.target.value)}
          min={10}
          max={1000}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.radius ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="50"
        />
        {errors.radius && <p className="mt-1 text-sm text-red-500">{errors.radius}</p>}
        <p className="text-xs text-slate-500 mt-1">Range: 10-1000 meter (default: 50)</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Deskripsi
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          maxLength={1000}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Deskripsi lokasi (opsional)"
        />
        <p className="text-xs text-slate-500 mt-1">
          {formData.description.length}/1000 karakter
        </p>
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => handleChange('isActive', e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="isActive" className="text-sm text-slate-700">
          Lokasi Aktif
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : initialData ? 'Perbarui' : 'Buat lokasi'}
        </Button>
      </div>
    </form>
  );
}
