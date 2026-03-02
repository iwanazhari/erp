import { useNavigate } from "@tanstack/react-router";
import type { AuditLog } from "@/modules/audit/types";

type Props = {
  logs?: AuditLog[];
  isLoading?: boolean;
};

export default function ActivityFeed({ logs = [], isLoading = false }: Props) {
  const navigate = useNavigate();

  const handleLogClick = (log: AuditLog) => {
    // Navigate to entity detail with open param
    if (log.entityType === "attendance") {
      navigate({
        to: "/attendance",
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          open: log.entityId,
        }),
      });
    }
    // Add more entity types as needed
    // if (log.entityType === "schedule") { ... }
  };
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse flex gap-3 p-3 bg-white rounded-lg border border-slate-100"
          >
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

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        <p className="text-4xl mb-2">📝</p>
        <p>No recent activity</p>
        <p className="text-xs mt-1">Activity will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div
          key={log.id}
          onClick={() => handleLogClick(log)}
          className="flex gap-3 p-3 bg-white rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-50 transition"
        >
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-medium text-slate-600">
              {log.userName.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 truncate">
                  <span className="font-medium">{log.userName}</span>{" "}
                  <span className="text-slate-500">
                    {formatAction(log.action)}{" "}
                    {formatEntityType(log.entityType)}
                  </span>
                  {log.entityName && (
                    <span className="font-medium text-slate-700">
                      {" "}
                      {log.entityName}
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {summarizeChanges(log.changes)}
                </p>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">
                {formatRelativeTime(log.createdAt)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper functions

function formatAction(action: AuditLog["action"]): string {
  switch (action) {
    case "create":
      return "created";
    case "update":
      return "updated";
    case "delete":
      return "deleted";
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

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
