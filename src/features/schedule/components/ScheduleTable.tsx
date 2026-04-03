import {
  formatScheduleDate,
  formatScheduleTime,
  getScheduleAssigneeDisplay,
  getStatusBadgeClasses,
  scheduleKindBadgeClasses,
  scheduleKindLabel,
} from '../utils/scheduleHelpers';
import EmptyState from '@/components/ui/EmptyState';
import type { Schedule } from '@/shared/types/schedule';

type Props = {
  schedules: Schedule[];
  onRowClick: (schedule: Schedule) => void;
  isLoading?: boolean;
};

export default function ScheduleTable({ schedules, onRowClick, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-100 rounded-lg h-16" />
        ))}
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <EmptyState
        icon="calendar"
        title="Tidak ada jadwal"
        description="Belum ada jadwal yang dibuat untuk periode ini."
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Jenis</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Penugasan</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Lokasi</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Tanggal</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Waktu</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => {
              const assignee = getScheduleAssigneeDisplay(schedule);
              return (
              <tr
                key={schedule.id}
                onClick={() => onRowClick(schedule)}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${scheduleKindBadgeClasses(assignee.kind)}`}
                  >
                    {scheduleKindLabel(assignee.kind)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-slate-800">{assignee.name}</p>
                    <p className="text-xs text-slate-500">{assignee.email ?? '—'}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-slate-800">{schedule.location.name}</p>
                    <p className="text-xs text-slate-500 truncate max-w-xs">
                      {schedule.location.address}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-700">
                  {formatScheduleDate(schedule.date)}
                </td>
                <td className="px-4 py-4 text-slate-700">
                  <div>
                    {formatScheduleTime(schedule.startTime)} - {formatScheduleTime(schedule.endTime)}
                    <p className="text-xs text-slate-500">
                      {Math.floor((new Date(schedule.endTime).getTime() - new Date(schedule.startTime).getTime()) / (1000 * 60 * 60))}j{' '}
                      {(new Date(schedule.endTime).getTime() - new Date(schedule.startTime).getTime()) % (1000 * 60 * 60) / (1000 * 60)}m
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(schedule.status)}`}
                  >
                    {schedule.status}
                  </span>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
