import type { Role } from "./types";

/**
 * Centralized permission matrix
 * Define all permissions in one place
 * Components should NOT hardcode role logic
 */
export const permissions = {
  attendance: {
    view: ["admin", "supervisor", "technician"] as Role[],
    edit: ["admin", "supervisor"] as Role[],
    quickEditStatus: ["admin", "supervisor"] as Role[],
    viewAudit: ["admin", "supervisor"] as Role[],
    delete: ["admin"] as Role[],
    export: ["admin", "supervisor"] as Role[],
  },
  schedule: {
    view: ["admin", "supervisor", "technician"] as Role[],
    edit: ["admin", "supervisor"] as Role[],
    delete: ["admin"] as Role[],
  },
  reports: {
    view: ["admin", "supervisor"] as Role[],
    export: ["admin", "supervisor"] as Role[],
  },
} as const;

/**
 * Check if a role has permission for a specific resource and action
 */
export function can(
  role: Role,
  resource: keyof typeof permissions,
  action: string
): boolean {
  const resourcePermissions = permissions[resource] as Record<string, Role[]>;
  return resourcePermissions?.[action]?.includes(role) ?? false;
}

/**
 * Check if role can view attendance
 */
export function canViewAttendance(role: Role): boolean {
  return can(role, "attendance", "view");
}

/**
 * Check if role can edit attendance
 */
export function canEditAttendance(role: Role): boolean {
  return can(role, "attendance", "edit");
}

/**
 * Check if role can quick edit status
 */
export function canQuickEditStatus(role: Role): boolean {
  return can(role, "attendance", "quickEditStatus");
}

/**
 * Check if role can view audit logs
 */
export function canViewAudit(role: Role): boolean {
  return can(role, "attendance", "viewAudit");
}

/**
 * Check if role can delete attendance
 */
export function canDeleteAttendance(role: Role): boolean {
  return can(role, "attendance", "delete");
}

/**
 * Check if role can export attendance
 */
export function canExportAttendance(role: Role): boolean {
  return can(role, "attendance", "export");
}
