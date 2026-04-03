import TechnicianScheduleForm from './TechnicianScheduleForm';
import ScheduleDetails from './ScheduleDetails';
import ModalShell from '@/components/ui/ModalShell';
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
  const title =
    mode === 'create' ? 'Buat jadwal teknisi' : mode === 'edit' ? 'Edit jadwal teknisi' : 'Detail jadwal teknisi';

  const subtitle =
    mode === 'view'
      ? undefined
      : 'Hanya untuk rute Jadwal Teknisi (/schedule). Jadwal sales memakai halaman Jadwal Sales — pool user berbeda.';

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size="2xl"
      contentClassName="max-h-[min(92vh,960px)]"
    >
      {mode === 'create' && (
        <TechnicianScheduleForm
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
          initialDate={initialDate}
        />
      )}
      {mode === 'edit' && schedule && (
        <TechnicianScheduleForm
          initialData={schedule}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      )}
      {mode === 'view' && schedule && (
        <ScheduleDetails schedule={schedule} onEdit={onEdit} onCancel={onCancel} onDelete={onDelete} />
      )}
    </ModalShell>
  );
}
