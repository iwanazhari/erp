# Frontend Implementation Guide - Sales Schedule & Role-Based Access

## Overview
Dokumentasi ini menjelaskan implementasi CRUD jadwal untuk user dengan role **SALES** dan sistem role-based access control (RBAC) di frontend.

---

## 1. Role Definitions

### Lokasi File
`src/modules/auth/types.ts`

### Roles yang Didukung
```typescript
export type Role = "admin" | "supervisor" | "technician" | "sales" | "finance" | "hr";
```

### Role Hierarchy untuk Schedule
| Role | View | Edit | Delete |
|------|------|------|--------|
| admin | ✅ | ✅ | ✅ |
| supervisor | ✅ | ✅ | ❌ |
| sales | ✅ | ✅ | ❌ |
| hr | ✅ | ✅ | ❌ |
| technician | ✅ | ❌ | ❌ |
| finance | ✅ | ❌ | ❌ |

---

## 2. Permission System

### Lokasi File
`src/modules/auth/permissions.ts`

### Permission Matrix
```typescript
export const permissions = {
  schedule: {
    view: ["admin", "supervisor", "technician", "sales", "finance", "hr"] as Role[],
    edit: ["admin", "supervisor", "sales", "hr"] as Role[],
    delete: ["admin"] as Role[],
  },
  // ... other permissions
} as const;
```

### Helper Functions
```typescript
// Check if role can view schedule
canViewSchedule(role: Role): boolean

// Check if role can edit schedule
canEditSchedule(role: Role): boolean

// Check if role can delete schedule
canDeleteSchedule(role: Role): boolean
```

### Usage Example
```typescript
import { canViewSchedule, canEditSchedule } from "@/modules/auth/permissions";

// In component
const { user } = useCurrentUser();
const canView = canViewSchedule(user?.role || "technician");
const canEdit = canEditSchedule(user?.role || "technician");
```

---

## 3. Navigation System

### Lokasi File
`src/config/navigation.ts`

### Navigation Structure
```typescript
export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  children?: NavItem[];
  roles?: string[]; // Role-based access control
}
```

### Schedule Submenu
```typescript
{ 
  label: "Schedule", 
  path: "/schedule",
  roles: ["admin", "supervisor", "technician", "sales", "finance", "hr"],
  children: [
    { label: "All Schedules", path: "/schedule", roles: ["admin", "supervisor", "hr"] },
    { label: "My Schedule", path: "/schedule/my", roles: ["technician", "sales", "finance"] },
    { label: "Sales Schedule", path: "/schedule/sales", roles: ["admin", "supervisor", "sales", "hr"] },
  ]
}
```

### Menu Access by Role
| Role | Schedule | My Schedule | Sales Schedule |
|------|----------|-------------|----------------|
| admin | ✅ | ✅ | ✅ |
| supervisor | ✅ | ✅ | ✅ |
| sales | ✅ | ✅ | ✅ |
| hr | ✅ | ✅ | ✅ |
| technician | ✅ | ✅ | ❌ |
| finance | ✅ | ✅ | ❌ |

---

## 4. Sidebar Component

### Lokasi File
`src/layout/Sidebar.tsx`

### Features
- **Role-based filtering**: Menu items filtered by user role
- **Nested submenus**: Expandable/collapsible menu items
- **Active state**: Highlights current active menu/route

### Component Structure
```typescript
function MenuItem({ item, level = 0 }: MenuItemProps) {
  const { user } = useCurrentUser();
  const userRole = user?.role?.toLowerCase() || "";
  
  // Check access
  const hasAccess = !item.roles || item.roles.includes(userRole);
  
  if (!hasAccess) return null;
  
  // Render menu item with children support
}
```

---

## 5. Sales Schedule Page

### Lokasi File
`src/pages/SalesSchedule.tsx`

### Features
- ✅ Create new schedule
- ✅ View own schedules only
- ✅ Edit existing schedule
- ✅ Cancel schedule
- ✅ Delete schedule
- ✅ Location autocomplete with coordinates
- ✅ Time picker (24-hour format)

### Component Usage
```typescript
import SalesSchedule from "@/pages/SalesSchedule";

// In route definition
export const Route = createFileRoute("/schedule/sales")({
  component: () => (
    <ProtectedRoute>
      <SalesSchedule />
    </ProtectedRoute>
  ),
});
```

### Form Fields
```typescript
type FormData = {
  technicianId: string;        // Auto-filled with current user
  locationName: string;         // Location name
  locationAddress: string;      // Full address
  latitude?: number;            // GPS coordinates
  longitude?: number;
  date: string;                 // Schedule date
  startTime: string;            // Start time (HH:mm)
  endTime: string;              // End time (HH:mm)
  description: string;          // Schedule description
  notes: string;                // Additional notes
};
```

### API Integration
Uses React Query hooks from `src/features/schedule/hooks/useSchedules.ts`:
- `useSchedules()` - Fetch schedules (filtered by technicianId)
- `useCreateSchedule()` - Create new schedule
- `useUpdateSchedule()` - Update existing schedule
- `useCancelSchedule()` - Cancel schedule
- `useDeleteSchedule()` - Delete schedule
- `useTechnicians()` - Fetch technician list

---

## 6. Routes

### Route Files
| Route | File | Component |
|-------|------|-----------|
| `/schedule` | `src/routes/schedule.tsx` | SimpleSchedule |
| `/schedule/my` | `src/routes/schedule.my.tsx` | SimpleSchedule |
| `/schedule/sales` | `src/routes/schedule.sales.tsx` | SalesSchedule |

### Adding New Route
```typescript
// src/routes/schedule.example.tsx
import { createFileRoute } from "@tanstack/react-router";
import ExampleComponent from "@/pages/ExampleComponent";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/schedule/example")({
  component: () => (
    <ProtectedRoute>
      <ExampleComponent />
    </ProtectedRoute>
  ),
});
```

---

## 7. User Context

### Lokasi File
`src/shared/UserContext.tsx`

### Available Properties
```typescript
interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Attendance permissions
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canViewAudit: boolean;
  canQuickEditStatus: boolean;
  
  // Schedule permissions (NEW)
  canViewSchedule: boolean;
  canEditSchedule: boolean;
  canDeleteSchedule: boolean;
  
  switchRole: (role: Role) => void;
  logout: () => void;
}
```

### Usage Example
```typescript
import { useUser } from "@/shared/UserContext";

function MyComponent() {
  const { user, canEditSchedule, canDeleteSchedule } = useUser();
  
  return (
    <div>
      {canEditSchedule && <EditButton />}
      {canDeleteSchedule && <DeleteButton />}
    </div>
  );
}
```

---

## 8. Type Definitions

### User Type
`src/shared/types/auth.ts`
```typescript
export type UserRole = 'ADMIN' | 'HR' | 'MANAGER' | 'TECHNICIAN' | 
                       'TECHNICIAN_PAYMENT' | 'SALES' | 'FINANCE' | string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  companyId?: string;
  officeId?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Register Input
```typescript
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  companyId?: string;
  inviteCode?: string;
  deviceId?: string;
  latitude?: number;
  longitude?: number;
  role?: UserRole;  // Optional role assignment
}
```

---

## 9. Best Practices

### 1. Always Use Permission Helpers
```typescript
// ✅ GOOD
import { canEditSchedule } from "@/modules/auth/permissions";
const canEdit = canEditSchedule(user?.role);

// ❌ BAD
const canEdit = user?.role === "admin" || user?.role === "sales";
```

### 2. Filter Menu Items by Role
```typescript
// Navigation config automatically filters by role
const hasAccess = !item.roles || item.roles.includes(userRole);
if (!hasAccess) return null;
```

### 3. Use UserContext for Permissions
```typescript
// ✅ GOOD
const { canEditSchedule } = useUser();

// ❌ BAD - Don't hardcode role checks
const canEdit = user?.role === "admin";
```

### 4. Type Safety
```typescript
// Always use defined types
import type { Role } from "@/modules/auth/types";
import type { NavItem } from "@/config/navigation";
```

---

## 10. Testing Checklist

### For SALES Role
- [ ] Can access `/schedule/sales` route
- [ ] Can view own schedules only
- [ ] Can create new schedule
- [ ] Can edit own schedule
- [ ] Can cancel own schedule
- [ ] Cannot delete schedule (admin only)
- [ ] Menu "Sales Schedule" visible in sidebar
- [ ] Menu "All Schedules" hidden from sidebar

### For ADMIN Role
- [ ] Can access all schedule routes
- [ ] Can view all schedules
- [ ] Can create/edit/cancel/delete any schedule
- [ ] All menu items visible

### For TECHNICIAN Role
- [ ] Can access `/schedule/my` route
- [ ] Can view own schedules only
- [ ] Cannot create/edit/delete schedules
- [ ] Menu "Sales Schedule" hidden from sidebar

---

## 11. API Endpoints

### Sales Schedule API
Base URL: `VITE_API_PUBLIC_URL` (default: `https://worksy-production.up.railway.app`)

**Important:** Sales Schedule menggunakan endpoint khusus `/api/sales/schedules` yang berbeda dari endpoint admin `/api/schedules`.

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/sales/schedules` | Get all schedules (with filters) | ✅ Bearer Token | SALES |
| GET | `/sales/schedules/:id` | Get schedule by ID | ✅ Bearer Token | SALES |
| POST | `/sales/schedules` | Create new schedule | ✅ Bearer Token | SALES |
| PATCH | `/sales/schedules/:id` | Update schedule | ✅ Bearer Token | SALES |
| PATCH | `/sales/schedules/:id/cancel` | Cancel schedule | ✅ Bearer Token | SALES |
| DELETE | `/sales/schedules/:id` | Delete schedule (PENDING only) | ✅ Bearer Token | SALES |
| GET | `/sales/technicians/:id/availability?date=YYYY-MM-DD` | Check technician availability | ✅ Bearer Token | SALES |

### Query Parameters for GET /sales/schedules

```typescript
interface ScheduleFilters {
  page?: number;           // Default: 1
  limit?: number;          // Default: 20, Max: 100
  technicianId?: string;   // Filter by technician ID
  locationId?: string;     // Filter by location ID
  status?: string;         // PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
  dateFrom?: string;       // YYYY-MM-DD
  dateTo?: string;         // YYYY-MM-DD
  search?: string;         // Search by technician name or description
}
```

### Schedule Status Flow

```
PENDING → ASSIGNED → IN_PROGRESS → COMPLETED
    ↓
CANCELLED
```

| Status | Description | Can Edit | Can Cancel | Can Delete |
|--------|-------------|----------|------------|------------|
| `PENDING` | Jadwal baru dibuat | ✅ | ✅ | ✅ |
| `ASSIGNED` | Sudah diassign ke technician | ✅ | ✅ | ❌ |
| `IN_PROGRESS` | Technician sedang mengerjakan | ❌ | ❌ | ❌ |
| `COMPLETED` | Pekerjaan selesai | ❌ | ❌ | ❌ |
| `CANCELLED` | Jadwal dibatalkan | ❌ | ❌ | ❌ |

### Request/Response Examples

#### Create Schedule (POST /sales/schedules)

**Request:**
```json
{
  "technicianId": "tech-uuid-123",
  "locationId": "loc-uuid-456",
  "date": "2026-04-01",
  "startTime": "09:00",
  "endTime": "12:00",
  "description": "Kunjungan sales ke client",
  "notes": "Client tertarik dengan produk A"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Jadwal berhasil dibuat.",
  "data": {
    "id": "schedule-uuid-789",
    "technicianId": "tech-uuid-123",
    "locationId": "loc-uuid-456",
    "date": "2026-04-01T00:00:00.000Z",
    "startTime": "2026-04-01T09:00:00.000Z",
    "endTime": "2026-04-01T12:00:00.000Z",
    "status": "ASSIGNED",
    "description": "Kunjungan sales ke client",
    "notes": "Client tertarik dengan produk A",
    "createdAt": "2026-03-30T16:00:00.000Z",
    "technician": {
      "id": "tech-uuid-123",
      "name": "Ahmad Technician",
      "email": "ahmad@worksy.com",
      "role": "TECHNICIAN",
      "phone": "081234567890"
    },
    "location": {
      "id": "loc-uuid-456",
      "name": "Kantor Client PT ABC",
      "address": "Jl. Sudirman No. 123",
      "latitude": -6.2088,
      "longitude": 106.8456
    }
  }
}
```

#### Cancel Schedule (PATCH /sales/schedules/:id/cancel)

**Request:**
```json
{
  "reason": "Customer meminta pembatalan"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Jadwal berhasil dibatalkan.",
  "data": {
    "id": "schedule-uuid-789",
    "status": "CANCELLED",
    "cancelledAt": "2026-03-30T16:45:00.000Z",
    "cancelledBy": "sales-uuid",
    "cancellationReason": "Customer meminta pembatalan"
  }
}
```

### Error Handling

| HTTP Code | Error | Description |
|-----------|-------|-------------|
| 200 | Success | Request berhasil |
| 201 | Created | Schedule berhasil dibuat |
| 400 | Bad Request | Validasi gagal (bentrok jadwal, data tidak valid) |
| 401 | Unauthorized | Token tidak valid/expired |
| 403 | Forbidden | User bukan SALES role |
| 404 | Not Found | Schedule/Technician tidak ditemukan |
| 500 | Internal Server Error | Server error |

**Example Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Jadwal bentrok dengan jadwal yang sudah ada pada waktu tersebut",
  "error": "VALIDATION"
}
```

**Example Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Akses ditolak. Anda tidak memiliki izin.",
  "error": "FORBIDDEN"
}
```

---

## 12. File Structure

```
src/
├── config/
│   └── navigation.ts              # Navigation config with roles
├── layout/
│   └── Sidebar.tsx                # Role-based sidebar
├── modules/auth/
│   ├── types.ts                   # Role type definitions
│   └── permissions.ts             # Permission matrix & helpers
├── pages/
│   ├── SalesSchedule.tsx          # Sales schedule CRUD page
│   └── SimpleSchedule.tsx         # Generic schedule page
├── routes/
│   ├── schedule.tsx               # /schedule route
│   ├── schedule.my.tsx            # /schedule/my route
│   └── schedule.sales.tsx         # /schedule/sales route
├── shared/
│   ├── types/
│   │   └── auth.ts                # Auth & User types
│   └── UserContext.tsx            # User context with permissions
└── features/schedule/
    ├── hooks/
    │   └── useSchedules.ts        # React Query hooks
    └── components/                # Schedule components
```

---

## 13. Troubleshooting

### Menu Item Not Showing
1. Check if role is added to `NavItem.roles` array
2. Verify user role is lowercase in comparison
3. Check `UserContext` is wrapping the component

### Permission Check Failing
1. Verify role is added to permission matrix
2. Use helper functions instead of direct checks
3. Check user role value in `UserContext`

### Route Not Found
1. Ensure route file exists in `src/routes/`
2. Check route path matches navigation config
3. Verify component is imported correctly

---

## 14. Future Enhancements

### Planned Features
- [ ] Add role selection during registration
- [ ] Implement FINANCE role schedule features
- [ ] Add schedule approval workflow
- [ ] Export schedule to Excel/PDF
- [ ] Schedule conflict detection
- [ ] Calendar view for schedules

### Backend Requirements
- [ ] Verify backend supports SALES role
- [ ] Verify backend supports FINANCE role
- [ ] Add role assignment in registration API
- [ ] Add role-based filtering in backend

---

## Contact & Support

For questions or issues, refer to:
- Architecture docs: `ARCHITECTURE.md`
- Auth docs: `AUTHENTICATION.md`
- API services: `src/services/`

---

**Last Updated**: March 30, 2026  
**Version**: 1.0.0
