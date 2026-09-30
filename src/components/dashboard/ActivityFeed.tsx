import { useNavigate } from "@tanstack/react-router";
import type { AuditLog } from "@/modules/audit/types";

type Props = {
  logs?: AuditLog[];
  isLoading?: boolean;
};

export default function ActivityFeed({ logs = [], isLoading = false }: Props) {
  const navigate = useNavigate();

  const handleLogClick = (log: AuditLog) => {
    if (log.entityType === "attendance") {
      navigate({
        to: "/attendance",
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          open: log.entityId,
        }),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/50 animate-pulse">
            <div className="h-9 w-9 rounded-full bg-muted-foreground/20" />
            <div className="flex-1 space-y-2">
              <div className="h-4 rounded bg-muted-foreground/20 w-3/4" />
              <div className="h-3 rounded bg-muted-foreground/20 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted border border-border mb-3">
          <span className="text-lg text-muted-foreground font-mono">--</span>
        </div>
        <p className="text-sm font-semibold text-foreground">No Recent Activity</p>
        <p className="text-xs text-muted-foreground mt-1">Activity will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {logs.map((log) => (
        <div
          key={log.id}
          onClick={() => handleLogClick(log)}
          className="flex gap-3 p-3 rounded-lg cursor-pointer
            hover:bg-muted/50
            transition-all duration-200 group"
        >
          <div className="flex-shrink-0">
            <div
              className="h-9 w-9 rounded-full gradient-bg shadow-[var(--shadow-accent)]
                flex items-center justify-center text-xs font-bold text-white"
            >
              {log.userName.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">
                  <span className="font-semibold">{log.userName}</span>
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    {formatAction(log.action)}{" "}
                    {formatEntityType(log.entityType)}
                  </span>
                  {log.entityName && (
                    <span className="font-medium text-foreground">
                      {" "}
                      {log.entityName}
                    </span>
                  )}
                </p>
                {log.changes && log.changes.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {summarizeChanges(log.changes)}
                  </p>
                )}
              </div>
              <span className="text-[11px] font-mono font-medium text-muted-foreground flex-shrink-0">
                {formatRelativeTime(log.createdAt)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatAction(action: AuditLog["action"]): string {
  switch (action) {
    case "create": return "created";
    case "update": return "updated";
    case "delete": return "deleted";
  }
}

function formatEntityType(type: AuditLog["entityType"]): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function summarizeChanges(changes: AuditLog["changes"]): string {
  if (!changes || changes.length === 0) return "";
  if (changes.length === 1) {
    const change = changes[0];
    return `${formatFieldName(change.field)}: ${formatValue(change.oldValue)} → ${formatValue(change.newValue)}`;
  }
  return `${changes.length} fields updated`;
}

function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return JSON.stringify(value);
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
