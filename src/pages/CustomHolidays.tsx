import { useState, useMemo } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import { useToast } from '@/components/ui/ToastContext';
import { useCustomHolidays, useCreateCustomHoliday, useDeleteCustomHoliday } from '@/features/calendar/hooks/useCustomHolidays';
import { useHolidays } from '@/features/calendar/hooks/useHolidays';
import { customHolidayApi } from '@/services/calendarApi';
import type { CustomHoliday, CustomHolidayType, CustomHolidayTypeLabel, CreateCustomHolidayInputFull } from '@/shared/types/customHoliday';
import { CUSTOM_HOLIDAY_TYPE_VALUES, CUSTOM_HOLIDAY_TYPE_LABELS } from '@/shared/types/customHoliday';

export default function CustomHolidaysPage() {
  const toast = useToast();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [togglingDate, setTogglingDate] = useState<string | null>(null);
  const [toggleDateValue, setToggleDateValue] = useState<string>('');

  // Fetch national holidays for detection
  const { data: nationalHolidaysData } = useHolidays(selectedYear);
  const nationalHolidays = useMemo(() => {
    const holidays = nationalHolidaysData?.holidays || [];
    // Filter only national holidays (not custom)
    return holidays.filter(h => !h.isCustom);
  }, [nationalHolidaysData]);

  // Check if toggle date is national holiday
  const isNationalOnToggleDate = useMemo(() => {
    if (!toggleDateValue) return false;
    return nationalHolidays.some(h => h.date.startsWith(toggleDateValue));
  }, [toggleDateValue, nationalHolidays]);
  
  const toggleNationalHoliday = useMemo(() => {
    if (!toggleDateValue) return null;
    return nationalHolidays.find(h => h.date.startsWith(toggleDateValue));
  }, [toggleDateValue, nationalHolidays]);

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

  // Check if selected date is a national holiday
  const isNationalHoliday = useMemo(() => {
    return nationalHolidays.some(h => h.date.startsWith(formData.date));
  }, [nationalHolidays, formData.date]);

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

  const handleToggleNationalHolidayToWorkingDay = async () => {
    if (!formData.date) {
      toast.error('Pilih tanggal terlebih dahulu');
      return;
    }

    console.log('[Override Form] Date:', formData.date);
    console.log('[Override Form] National holidays:', nationalHolidays.length);
    
    const nationalHoliday = nationalHolidays.find(h => h.date.startsWith(formData.date));
    
    console.log('[Override Form] Found national holiday:', nationalHoliday);
    
    if (!nationalHoliday) {
      toast.error('Tanggal yang dipilih bukan hari libur nasional');
      return;
    }

    if (!confirm(`Ubah hari libur nasional "${nationalHoliday.nameId}" menjadi hari kerja?`)) {
      return;
    }

    setTogglingDate(formData.date);
    try {
      console.log('[Override Form] Calling API with isWorkingDayOverride: true');
      await customHolidayApi.toggleWorkingDay({
        date: formData.date,
        type: 'LIBUR_PERUSAHAAN',
        name: `Working Day: ${nationalHoliday.nameId}`,
        description: `${nationalHoliday.nameId} dijadikan hari kerja`,
        isWorkingDayOverride: true, // Flag khusus untuk working day override
      });

      toast.success('Tanggal berhasil diubah menjadi hari kerja (override libur nasional)');
      resetForm();
      refetch();
    } catch (error: any) {
      console.error('[Override Form] Error:', error.response?.data);
      toast.error(error.response?.data?.message || 'Gagal override libur nasional');
    } finally {
      setTogglingDate(null);
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

  const handleToggleWorkingDay = async (date: string, isHoliday: boolean, overrideNational: boolean = false) => {
    if (isHoliday) {
      // Convert holiday to working day (delete holiday)
      if (!confirm('Ubah tanggal ini menjadi hari kerja? Tanggal libur akan dihapus.')) return;
    } else {
      // Convert working day to holiday OR override national holiday
      if (overrideNational) {
        if (!confirm('Ubah hari libur nasional ini menjadi hari kerja?')) return;
      } else {
        if (!confirm('Ubah tanggal ini menjadi hari libur?')) return;
      }
    }

    setTogglingDate(date);
    try {
      await customHolidayApi.toggleWorkingDay({
        date,
        type: 'LIBUR_PERUSAHAAN',
        name: isHoliday ? undefined : 'Libur Perusahaan',
        description: isHoliday ? undefined : 'Libur perusahaan',
        isWorkingDayOverride: overrideNational, // Flag khusus untuk working day override
      });

      toast.success(
        overrideNational 
          ? 'Tanggal berhasil diubah menjadi hari kerja (override libur nasional)'
          : isHoliday 
            ? 'Tanggal berhasil diubah menjadi hari kerja' 
            : 'Tanggal berhasil diubah menjadi hari libur'
      );
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal toggle tanggal');
    } finally {
      setTogglingDate(null);
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
                  {isNationalHoliday && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      ⚠️ Tanggal ini adalah hari libur nasional
                    </div>
                  )}
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

              {/* National Holiday Override Section */}
              {isNationalHoliday && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-800 mb-2">
                        Override Libur Nasional
                      </p>
                      <p className="text-sm text-amber-700 mb-3">
                        Tanggal yang dipilih adalah hari libur nasional. Gunakan fitur ini untuk mengubahnya menjadi hari kerja.
                      </p>
                      <button
                        type="button"
                        onClick={handleToggleNationalHolidayToWorkingDay}
                        disabled={togglingDate === formData.date}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                      >
                        {togglingDate === formData.date ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Memproses...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Jadikan Hari Kerja (Override)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

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

        {/* Quick Toggle Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Toggle Tanggal Kerja ↔ Libur</h3>
          <div className="space-y-4">
            {/* National Holiday Warning */}
            {isNationalOnToggleDate && toggleNationalHoliday && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      🇮🇩 Libur Nasional Terdeteksi
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      <strong>{toggleNationalHoliday.nameId}</strong> - Klik tombol di bawah akan otomatis mengubah menjadi hari kerja
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <input
                type="date"
                id="toggleDate"
                min="2024-01-01"
                max="2030-12-31"
                onChange={(e) => setToggleDateValue(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={async () => {
                  if (!toggleDateValue) {
                    toast.error('Pilih tanggal terlebih dahulu');
                    return;
                  }

                  console.log('[Toggle] Selected date:', toggleDateValue);
                  console.log('[Toggle] National holidays loaded:', nationalHolidays.length);
                  console.log('[Toggle] Is national?', isNationalOnToggleDate);

                  if (isNationalOnToggleDate) {
                    // Override national holiday
                    if (!confirm(`Ubah hari libur nasional "${toggleNationalHoliday?.nameId}" menjadi hari kerja?`)) {
                      return;
                    }
                    await handleToggleWorkingDay(toggleDateValue, false, true);
                  } else {
                    // Regular toggle
                    await handleToggleWorkingDay(toggleDateValue, false);
                  }
                }}
                disabled={togglingDate !== null}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                {togglingDate ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span>Toggle Tanggal</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-slate-500 mt-3">
              💡 <strong>Cara kerja:</strong> Jika tanggal sudah libur → jadi hari kerja. Jika tanggal kerja → jadi libur. Jika libur nasional → jadi hari kerja (override).
            </p>
          </div>
        </div>

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
                          {holiday.override_national_holiday ? (
                            <>
                              <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                                🇮🇩 Working Day Override
                              </span>
                              <span className="text-xs text-slate-500 italic">
                                (bukan hari libur)
                              </span>
                            </>
                          ) : (
                            <span className="text-xs font-semibold text-amber-600">
                              • Custom
                            </span>
                          )}
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
                        {holiday.override_national_holiday ? (
                          // Button for working day override (delete override to restore national holiday)
                          <button
                            type="button"
                            onClick={() => handleToggleWorkingDay(holiday.date.split('T')[0], true)}
                            disabled={togglingDate === holiday.date || deleteMutation.isPending}
                            className="text-blue-600 hover:text-blue-800 p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            title="Hapus override, kembalikan menjadi libur nasional"
                          >
                            {togglingDate === holiday.date ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                                <span className="text-xs font-medium">Kembalikan ke Libur</span>
                              </>
                            )}
                          </button>
                        ) : (
                          // Button for regular custom holiday (delete to make it a working day)
                          <button
                            type="button"
                            onClick={() => handleToggleWorkingDay(holiday.date.split('T')[0], true)}
                            disabled={togglingDate === holiday.date || deleteMutation.isPending}
                            className="text-green-600 hover:text-green-800 p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            title="Ubah menjadi hari kerja"
                          >
                            {togglingDate === holiday.date ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs font-medium">Jadikan Hari Kerja</span>
                              </>
                            )}
                          </button>
                        )}
                        {holiday.id && (
                          <button
                            onClick={() => handleDelete(holiday)}
                            disabled={deleteMutation.isPending}
                            className="text-amber-600 hover:text-amber-800 p-1 transition-colors disabled:opacity-50"
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
                <li className="mt-2 pt-2 border-t border-blue-200">
                  <strong>🇮🇩 Override Libur Nasional:</strong> Fitur baru untuk mengubah hari libur nasional menjadi hari kerja
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
