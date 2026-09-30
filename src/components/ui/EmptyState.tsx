import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

type Props = {
  icon?: ReactNode;
  customIcon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({
  icon,
  customIcon,
  title,
  description,
  action,
}: Props) {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-muted border border-border mb-4">
        {customIcon || icon || <Inbox className="h-7 w-7 text-muted-foreground" />}
      </div>
      <h3 className="text-sm font-semibold text-foreground">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
