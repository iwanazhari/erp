import { formatFieldName, formatValue } from "@/utils/diffAttendance";
import type { AuditLog } from "@/modules/audit/types";

type Props = {
  logs: AuditLog[];
  isLoading?: boolean;
};

export default function AuditPanel({ logs, isLoading = false }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="h-8 w-8 bg-slate-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        <p className="text-4xl mb-2">📝</p>
        <p>No audit history yet</p>
        <p className="text-xs mt-1">Changes will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
        >
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
              {log.userName.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-800 text-sm">
                {log.userName}
              </span>
              <span className="text-xs text-slate-500">
                {formatTimestamp(log.createdAt)}
              </span>
            </div>

            <div className="mt-1 text-sm text-slate-600">
              {log.changes.map((change, idx) => (
                <div key={idx} className="flex items-start gap-1 flex-wrap">
                  <span className="font-medium">{formatFieldName(change.field)}:</span>
                  <span className="text-slate-400 line-through">
                    {formatValue(change.oldValue)}
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="text-emerald-600 font-medium">
                    {formatValue(change.newValue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
