import type { AuditChange } from "@/modules/audit/types";

/**
 * Get changes between old and new attendance record
 * Returns array of field changes for audit trail
 */
export function getAttendanceChanges<T extends Record<string, unknown>>(
  oldItem: T,
  newItem: T
): AuditChange[] {
  const changes: AuditChange[] = [];

  Object.keys(newItem).forEach((key) => {
    const oldValue = oldItem[key];
    const newValue = newItem[key];

    if (oldValue !== newValue) {
      changes.push({
        field: key,
        oldValue,
        newValue,
      });
    }
  });

  return changes;
}

/**
 * Format field name for display (camelCase → Title Case)
 */
export function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

/**
 * Format value for display in audit log
 */
export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return JSON.stringify(value);
}
