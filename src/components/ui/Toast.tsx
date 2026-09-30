import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
  duration?: number;
}

const typeConfig: Record<ToastType, { icon: React.ReactNode; color: string; border: string }> = {
  success: {
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    color: 'text-green-500',
    border: 'border-l-green-500',
  },
  error: {
    icon: <XCircle className="h-5 w-5 text-red-500" />,
    color: 'text-red-500',
    border: 'border-l-red-500',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    color: 'text-amber-500',
    border: 'border-l-amber-500',
  },
  info: {
    icon: <Info className="h-5 w-5 text-blue-500" />,
    color: 'text-blue-500',
    border: 'border-l-blue-500',
  },
};

export default function Toast({ id, message, type, onClose, duration = 5000 }: ToastProps) {
  const config = typeConfig[type];

  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border shadow-lg border-l-4 ${config.border} animate-slide-in`}
      role="alert"
    >
      {config.icon}
      <p className="text-sm text-foreground flex-1">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
