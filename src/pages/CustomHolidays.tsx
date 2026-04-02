import { useState, useMemo } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import { useToast } from '@/components/ui/ToastContext';
import { useCustomHolidays, useCreateCustomHoliday, useDeleteCustomHoliday } from '@/features/calendar/hooks/useCustomHolidays';
import type { CustomHoliday, CustomHolidayType, CustomHolidayTypeLabel, CreateCustomHolidayInputFull } from '@/shared/types/customHoliday';
import { CUSTOM_HOLIDAY_TYPE_VALUES, CUSTOM_HOLIDAY_TYPE_LABELS } from '@/shared/types/customHoliday';

export default function CustomHolidaysPage() {
  const toast = useToast();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
    name_id: '',
    description: '',
    description_id: '',
    typeLabel: 'Cuti Bersama' as CustomHolidayTypeLabel,
  });

  const { data: holidays = [], isLoading, refetch } = useCustomHolidays(selectedYear);
  const createMutation = useCreateCustomHoliday();
  const deleteMutation = useDeleteCustomHoliday();

  // Filter holidays by year
  const filteredHolidays = useMemo(() => {
    return holidays.filter(h => new Date(h.date).getFullYear() === selectedYear);
  }, [holidays, selectedYear]);

  // Group by month
  const holidaysByMonth = useMemo(() => {
    const grouped: Record<number, CustomHoliday[]> = {};
    filteredHolidays.forEach(holiday => {
      const month = new Date(holiday.date).getMonth();
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(holiday);
    });
    return grouped;
  }, [filteredHolidays]);

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      name: '',
      name_id: '',
      description: '',
      description_id: '',
      typeLabel: 'Cuti Bersama',
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.date) {
      toast.error('Tanggal, nama, dan deskripsi wajib diisi');
      return;
    }

    const payload: CreateCustomHolidayInputFull = {
      date: formData.date,
      name: formData.name,
      name_id: formData.name_id || formData.name,
      description: formData.description,
      description_id: formData.description_id || formData.description,
      type: CUSTOM_HOLIDAY_TYPE_VALUES[formData.typeLabel],
    };

    try {
      if (editingId) {
        // TODO: Implement update when backend supports it
        toast.error('Update belum tersedia');
      } else {
        await createMutation.mutateAsync(payload);
        resetForm();
        refetch();
      }
    } catch (error: any) {
      // Error already handled by mutation
    }
  };

  const handleDelete = async (holiday: CustomHoliday) => {
    if (!holiday.id) return;
    
    if (!confirm(`Hapus hari libur "${holiday.name}"?`)) return;
    
    try {
      await deleteMutation.mutateAsync(holiday.id);
      refetch();
    } catch (error: any) {
      // Error already handled by mutation
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <PageContainer title="Custom Holidays">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-slate-600">Kelola hari libur custom perusahaan Anda</p>
          <div className="flex items-center gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[2024, 2025, 2026, 2027, 2028].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showAddForm ? 'Batal' : 'Tambah Hari Libur'}
            </button>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Tambah Hari Libur Custom</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tipe <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.typeLabel}
                    onChange={(e) => setFormData({ ...formData, typeLabel: e.target.value as CustomHolidayTypeLabel })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {Object.entries(CUSTOM_HOLIDAY_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={label}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Hari Libur <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value, name_id: e.target.value })}
                  placeholder="Contoh: Cuti Bersama Lebaran"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Alasan / Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value, description_id: e.target.value })}
                  placeholder="Jelaskan alasan hari libur ini"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Menyimpan...' : 'Simpan Hari Libur'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Holidays List */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-800">
              Daftar Hari Libur {selectedYear}
            </h3>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredHolidays.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Belum ada hari libur custom untuk tahun {selectedYear}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {Object.entries(holidaysByMonth).map(([monthIndex, holidays]) => (
                <div key={monthIndex}>
                  <div className="px-6 py-3 bg-slate-50 font-semibold text-slate-700">
                    {monthNames[parseInt(monthIndex)]}
                  </div>
                  {holidays.map((holiday) => (
                    <div
                      key={holiday.id || holiday.date}
                      className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-3 h-3 bg-amber-500 rounded-full flex-shrink-0 mt-1.5"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="font-bold text-amber-800 text-base">
                            {holiday.name}
                          </p>
                          <span className="text-xs font-semibold text-amber-600">
                            • Custom
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {formatDate(holiday.date)}
                        </p>
                        {holiday.description && (
                          <p className="text-sm text-slate-500 mt-1 italic">
                            {holiday.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 text-sm font-semibold bg-amber-100 text-amber-700 rounded-full whitespace-nowrap">
                          {CUSTOM_HOLIDAY_TYPE_LABELS[holiday.type as CustomHolidayType] || holiday.type}
                        </span>
                        {holiday.id && (
                          <button
                            onClick={() => handleDelete(holiday)}
                            disabled={deleteMutation.isPending}
                            className="text-amber-600 hover:text-amber-800 p-1 transition-colors"
                            title="Hapus hari libur custom"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Informasi:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Hari libur custom dapat diakses dari semua device</li>
                <li>Hanya Anda yang dapat menghapus hari libur yang Anda buat</li>
                <li>Admin/HR dapat mengelola semua hari libur custom</li>
                <li>Tanggal tidak boleh duplikat dengan hari libur yang sudah ada</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
