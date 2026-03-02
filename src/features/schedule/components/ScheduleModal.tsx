import ScheduleForm from './ScheduleForm';
import ScheduleDetails from './ScheduleDetails';
import type { Schedule, CreateScheduleInput, UpdateScheduleInput } from '@/shared/types/schedule';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  schedule?: Schedule | null;
  onSubmit: (data: CreateScheduleInput | UpdateScheduleInput) => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit' | 'view';
  initialDate?: Date;
  onEdit?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
};

export default function ScheduleModal({
  isOpen,
  onClose,
  schedule,
  onSubmit,
  isSubmitting,
  mode,
  initialDate,
  onEdit,
  onCancel,
  onDelete,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-slate-800">
              {mode === 'create' && 'Buat Jadwal Baru'}
              {mode === 'edit' && 'Edit Jadwal'}
              {mode === 'view' && 'Detail Jadwal'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {mode === 'create' && (
              <ScheduleForm
                onSubmit={onSubmit}
                onCancel={onClose}
                isSubmitting={isSubmitting}
                initialDate={initialDate}
              />
            )}
            {mode === 'edit' && schedule && (
              <ScheduleForm
                initialData={schedule}
                onSubmit={onSubmit}
                onCancel={onClose}
                isSubmitting={isSubmitting}
              />
            )}
            {mode === 'view' && schedule && (
              <ScheduleDetails
                schedule={schedule}
                onEdit={onEdit}
                onCancel={onCancel}
                onDelete={onDelete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
