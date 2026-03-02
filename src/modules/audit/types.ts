export type EntityType = "attendance" | "schedule" | "user";

export type AuditAction = "create" | "update" | "delete";

export interface AuditChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface AuditLog {
  id: string;
  entityType: EntityType;
  entityId: string;
  entityName?: string;
  action: AuditAction;
  changes: AuditChange[];
  userId: string;
  userName: string;
  createdAt: string;
}

export interface AuditLogResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditQueryParams {
  page?: number;
  limit?: number;
  entityType?: EntityType;
  entityId?: string;
  userId?: string;
}
