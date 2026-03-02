import { formatScheduleDate, formatScheduleTime, calculateDuration, getStatusBadgeClasses } from '../utils/scheduleHelpers';
import type { Schedule } from '@/shared/types/schedule';

type Props = {
  schedule: Schedule;
  onEdit?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
};

export default function ScheduleDetails({ schedule, onEdit, onCancel, onDelete }: Props) {
  const duration = calculateDuration(schedule.startTime, schedule.endTime);

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            {schedule.technician.name}
          </h3>
          <p className="text-sm text-slate-500">{schedule.technician.email}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClasses(schedule.status)}`}>
          {schedule.status}
        </span>
      </div>

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
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-xs text-blue-600 mb-1">Lokasi</p>
        <p className="text-sm font-medium text-blue-900">{schedule.location.name}</p>
        <p className="text-sm text-blue-700 mt-1">{schedule.location.address}</p>
        {schedule.location.description && (
          <p className="text-xs text-blue-600 mt-2">{schedule.location.description}</p>
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
          <p className="text-sm text-slate-600 bg-amber-50 rounded-lg p-4 border border-amber-200">
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

      {/* Actions */}
      {(onEdit || onCancel || onDelete) && (
        <div className="flex justify-end gap-3 pt-4 border-t">
          {onEdit && schedule.status !== 'COMPLETED' && schedule.status !== 'CANCELLED' && (
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Edit
            </button>
          )}
          {onCancel && schedule.status !== 'COMPLETED' && schedule.status !== 'CANCELLED' && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            >
              Batalkan
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Hapus
            </button>
          )}
        </div>
      )}
    </div>
  );
}
