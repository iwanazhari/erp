import { useState, useEffect } from 'react';
import {
  formatScheduleDate,
  formatScheduleTime,
  calculateDuration,
  getScheduleAssigneeDisplay,
  getStatusBadgeClasses,
  scheduleKindBadgeClasses,
  scheduleKindLabel,
} from '../utils/scheduleHelpers';
import type { Schedule } from '@/shared/types/schedule';
import type { AttendanceRecord as AttendanceRecordType } from '@/shared/types/attendance';
import Button from '@/components/ui/Button';
import { attendanceApi } from '@/services/attendanceApi';

type Props = {
  schedule: Schedule;
  onEdit?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
};

type TabType = 'details' | 'attendance' | 'work-result';

// Extended attendance record with technician-specific fields
interface TechnicianAttendance extends AttendanceRecordType {
  jobLatitude?: number | null;
  jobLongitude?: number | null;
  jobCompletionPhotos?: string | string[] | null; // Can be JSON string or array
  customerSignature?: string | null;
  airWaterPhoto?: string | null;
  workReport?: string | null;
  paymentAmount?: number | null;
  paymentStatus?: string | null;
}

// Helper to parse jobCompletionPhotos (can be JSON string or array)
const parseJobCompletionPhotos = (photos: string | string[] | null | undefined): string[] => {
  if (!photos) return [];
  if (Array.isArray(photos)) return photos;
  if (typeof photos === 'string') {
    try {
      const parsed = JSON.parse(photos);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [photos]; // Treat as single URL if not valid JSON
    }
  }
  return [];
};

// Helper to build full image URL
const getImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  // If path already starts with http, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Otherwise prepend backend URL - use hardcoded production URL
  const backendUrl = 'http://157.66.34.174:15320';
  return `${backendUrl}${path.startsWith('/') ? path : '/' + path}`;
};

export default function ScheduleDetails({ schedule, onEdit, onCancel, onDelete }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [attendances, setAttendances] = useState<TechnicianAttendance[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const duration = calculateDuration(schedule.startTime, schedule.endTime);
  const assignee = getScheduleAssigneeDisplay(schedule);

  // Fetch attendance data when tab is switched to attendance or work-result
  useEffect(() => {
    if ((activeTab === 'attendance' || activeTab === 'work-result') && !attendances.length && schedule.id) {
      const fetchAttendance = async () => {
        setLoadingAttendance(true);
        try {
          console.log('Fetching attendance for schedule:', schedule.id);

          // Use new endpoint: get attendance by schedule ID
          const response = await attendanceApi.getHistory({
            userId: schedule.technician?.id || schedule.technicianId || undefined,
            startDate: new Date(schedule.date).toISOString().split('T')[0],
            endDate: new Date(schedule.date).toISOString().split('T')[0],
          });

          console.log('Attendance response:', response);

          let attendanceData: TechnicianAttendance[] = [];

          if (response.success) {
            if ('attendances' in response.data && Array.isArray((response.data as any).attendances)) {
              attendanceData = (response.data as any).attendances;
            } else if ('records' in response.data && Array.isArray((response.data as any).records)) {
              attendanceData = (response.data as any).records;
            } else if (Array.isArray(response.data)) {
              attendanceData = response.data;
            }

            console.log('Parsed attendance data:', attendanceData);

            if (attendanceData.length > 0) {
              console.log('Found attendances:', attendanceData);
              setAttendances(attendanceData as TechnicianAttendance[]);
            } else {
              console.log('No attendance data found for this schedule');
              setAttendances([]);
            }
          } else {
            console.log('API returned non-success');
            setAttendances([]);
          }
        } catch (error) {
          console.error('Failed to fetch attendance:', error);
          setAttendances([]);
        } finally {
          setLoadingAttendance(false);
        }
      };

      fetchAttendance();
    }
  }, [activeTab, schedule?.id, attendances.length]);

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${scheduleKindBadgeClasses(assignee.kind)}`}
            >
              {scheduleKindLabel(assignee.kind)}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{assignee.name}</h3>
          <p className="text-sm text-slate-500">{assignee.email ?? '—'}</p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(schedule.status)}`}
        >
          {schedule.status}
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            📋 Detail Jadwal
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-2 px-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'attendance'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            🕒 Clock In/Out
          </button>
          <button
            onClick={() => setActiveTab('work-result')}
            className={`py-2 px-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'work-result'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            📝 Hasil Kerja
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <>
          {/* Schedule Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-1">Tanggal</p>
              <p className="text-sm font-medium text-slate-800">
                {formatScheduleDate(schedule.date)}
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-1">Waktu</p>
              <p className="text-sm font-medium text-slate-800">
                {formatScheduleTime(schedule.startTime)} - {formatScheduleTime(schedule.endTime)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Durasi: {duration.hours}j {duration.minutes}m
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-4">
            <p className="mb-1 text-xs font-medium text-indigo-800">Lokasi</p>
            {schedule.location ? (
              <>
                <p className="text-sm font-medium text-slate-900">{schedule.location.name}</p>
                <p className="mt-1 text-sm text-slate-700">{schedule.location.address}</p>
                {schedule.location.description && (
                  <p className="mt-2 text-xs text-slate-600">{schedule.location.description}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-500">Tidak ada lokasi</p>
            )}
          </div>

          {/* Description */}
          {schedule.description && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Deskripsi Pekerjaan</p>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-4">
                {schedule.description}
              </p>
            </div>
          )}

          {/* Notes */}
          {schedule.notes && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Catatan</p>
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {schedule.notes}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t space-y-2">
            {schedule.completedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Selesai pada:</span>
                <span className="text-slate-700">
                  {formatScheduleDate(schedule.completedAt)}
                </span>
              </div>
            )}
            {schedule.cancelledAt && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Dibatalkan pada:</span>
                <span className="text-slate-700">
                  {formatScheduleDate(schedule.cancelledAt)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Dibuat:</span>
              <span className="text-slate-700">
                {formatScheduleDate(schedule.createdAt)}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Catatan Kehadiran Teknisi</h3>
          {loadingAttendance ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-slate-500 mt-2">Memuat data kehadiran...</p>
            </div>
          ) : attendances.length > 0 ? (
            <div className="space-y-4">
              {attendances.map((attendance, index) => (
                <div key={attendance.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-700">Sesi #{index + 1}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      attendance.status === 'HADIR' ? 'bg-green-100 text-green-800' :
                      attendance.status === 'TERLAMBAT' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {attendance.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Clock In</p>
                      <p className="text-sm font-medium text-slate-900">
                        {attendance.clockIn ? new Date(attendance.clockIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) : '-'}
                      </p>
                      {attendance.latitudeIn && attendance.longitudeIn && (
                        <p className="text-xs text-slate-500 mt-1">
                          📍 {attendance.latitudeIn.toFixed(4)}, {attendance.longitudeIn.toFixed(4)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Clock Out</p>
                      <p className="text-sm font-medium text-slate-900">
                        {attendance.clockOut ? new Date(attendance.clockOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) : '-'}
                      </p>
                      {attendance.clockOutStatus && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 mt-1 inline-block">
                          {attendance.clockOutStatus}
                        </span>
                      )}
                      {attendance.latitudeOut && attendance.longitudeOut && (
                        <p className="text-xs text-slate-500 mt-1">
                          📍 {attendance.latitudeOut.toFixed(4)}, {attendance.longitudeOut.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Photos */}
                  {(attendance.selfieUrlIn || attendance.selfieUrlOut || (parseJobCompletionPhotos(attendance.jobCompletionPhotos).length > 0)) && (
                    <div className="mt-4">
                      <p className="text-xs text-slate-500 mb-2">Foto Dokumentasi</p>
                      <div className="grid grid-cols-4 gap-2">
                        {attendance.selfieUrlIn && getImageUrl(attendance.selfieUrlIn) && (
                          <div className="relative aspect-square">
                            <img src={getImageUrl(attendance.selfieUrlIn)!} alt="Selfie In" className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-75" onClick={() => window.open(getImageUrl(attendance.selfieUrlIn)!, '_blank')} />
                            <span className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">Selfie In</span>
                          </div>
                        )}
                        {attendance.selfieUrlOut && getImageUrl(attendance.selfieUrlOut) && (
                          <div className="relative aspect-square">
                            <img src={getImageUrl(attendance.selfieUrlOut)!} alt="Selfie Out" className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-75" onClick={() => window.open(getImageUrl(attendance.selfieUrlOut)!, '_blank')} />
                            <span className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">Selfie Out</span>
                          </div>
                        )}
                        {parseJobCompletionPhotos(attendance.jobCompletionPhotos).map((photo: string, idx: number) => (
                          <div key={idx} className="relative aspect-square">
                            <img src={getImageUrl(photo)!} alt={`Kerja ${idx + 1}`} className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-75" onClick={() => window.open(getImageUrl(photo)!, '_blank')} />
                            <span className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">Kerja {idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>Belum ada data kehadiran untuk tanggal ini</p>
            </div>
          )}
        </div>
      )}

      {/* Work Result Tab */}
      {activeTab === 'work-result' && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Hasil Kerja Teknisi</h3>
          {loadingAttendance ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-slate-500 mt-2">Memuat data hasil kerja...</p>
            </div>
          ) : attendances.length > 0 ? (
            <div className="space-y-4">
              {attendances.map((attendance, index) => (
                <div key={attendance.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-700">Sesi #{index + 1}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      attendance.status === 'HADIR' ? 'bg-green-100 text-green-800' :
                      attendance.status === 'TERLAMBAT' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {attendance.status}
                    </span>
                  </div>
                  {/* Work Report */}
                  {attendance.workReport ? (
                    <div className="mb-4 p-3 bg-white rounded border border-slate-200">
                      <p className="text-sm font-medium text-slate-700">📝 Laporan Kerja:</p>
                      <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{attendance.workReport}</p>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      ⚠️ Tidak ada laporan kerja
                    </div>
                  )}
                  {/* Payment Info */}
                  {(attendance.paymentAmount || attendance.paymentStatus) && (
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      {attendance.paymentAmount && (
                        <div className="p-3 bg-white rounded border border-slate-200">
                          <p className="text-xs text-slate-500">💰 Pembayaran</p>
                          <p className="text-sm font-medium text-slate-900">Rp {new Intl.NumberFormat('id-ID').format(attendance.paymentAmount)}</p>
                        </div>
                      )}
                      {attendance.paymentStatus && (
                        <div className="p-3 bg-white rounded border border-slate-200">
                          <p className="text-xs text-slate-500">Status Pembayaran</p>
                          <span className={`text-sm font-medium ${attendance.paymentStatus === 'PAID' ? 'text-green-600' : attendance.paymentStatus === 'PENDING' ? 'text-yellow-600' : 'text-slate-600'}`}>{attendance.paymentStatus}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Photos */}
                  {((parseJobCompletionPhotos(attendance.jobCompletionPhotos).length > 0) || attendance.customerSignature || attendance.airWaterPhoto) && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-3">📸 Dokumentasi Hasil Kerja</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {parseJobCompletionPhotos(attendance.jobCompletionPhotos).map((photo: string, idx: number) => (
                          <div key={idx} className="relative aspect-square">
                            <img src={getImageUrl(photo)!} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-75" onClick={() => window.open(getImageUrl(photo)!, '_blank')} />
                            <span className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">Foto {idx + 1}</span>
                          </div>
                        ))}
                        {attendance.customerSignature && getImageUrl(attendance.customerSignature) && (
                          <div className="relative aspect-square">
                            <img src={getImageUrl(attendance.customerSignature)!} alt="Tanda Tangan" className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-75" onClick={() => window.open(getImageUrl(attendance.customerSignature)!, '_blank')} />
                            <span className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">Tanda Tangan</span>
                          </div>
                        )}
                        {attendance.airWaterPhoto && getImageUrl(attendance.airWaterPhoto) && (
                          <div className="relative aspect-square">
                            <img src={getImageUrl(attendance.airWaterPhoto)!} alt="Air & Water" className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-75" onClick={() => window.open(getImageUrl(attendance.airWaterPhoto)!, '_blank')} />
                            <span className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">Air & Water</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>Belum ada data hasil kerja untuk tanggal ini</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {(onEdit || onCancel || onDelete) && activeTab === 'details' && (
        <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
          {onEdit && schedule.status !== 'COMPLETED' && schedule.status !== 'CANCELLED' && (
            <Button type="button" variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onCancel && schedule.status !== 'COMPLETED' && schedule.status !== 'CANCELLED' && (
            <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
              Batalkan
            </Button>
          )}
          {onDelete && (
            <Button type="button" variant="danger" size="sm" onClick={onDelete}>
              Hapus
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
