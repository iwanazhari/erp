import ModalShell from '@/components/ui/ModalShell';
import Button from '@/components/ui/Button';
import { resolveBackendUrl } from '@/utils/resolveBackendUrl';

type Props = {
  url: string | null;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function LeaveImageViewModal({ url, userName, isOpen, onClose }: Props) {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Lampiran Foto"
      subtitle={userName}
      size="2xl"
      footer={
        <div className="flex w-full justify-between gap-2">
          {url && (
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(resolveBackendUrl(url!), '_blank', 'noopener,noreferrer')}
            >
              Buka di tab baru
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </div>
      }
    >
      {url ? (
        <div className="flex items-center justify-center">
          <img
            src={resolveBackendUrl(url)}
            alt="Lampiran izin"
            className="max-h-[70vh] w-full rounded-lg object-contain"
          />
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-slate-500">Tidak ada lampiran.</p>
      )}
    </ModalShell>
  );
}
