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
import Button from '@/components/ui/Button';

type Props = {
  schedule: Schedule;
  onEdit?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
};

export default function ScheduleDetails({ schedule, onEdit, onCancel, onDelete }: Props) {
  const duration = calculateDuration(schedule.startTime, schedule.endTime);
  const assignee = getScheduleAssigneeDisplay(schedule);

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
        <p className="text-sm font-medium text-slate-900">{schedule.location.name}</p>
        <p className="mt-1 text-sm text-slate-700">{schedule.location.address}</p>
        {schedule.location.description && (
          <p className="mt-2 text-xs text-slate-600">{schedule.location.description}</p>
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

      {/* Actions */}
      {(onEdit || onCancel || onDelete) && (
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
