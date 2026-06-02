# ERP Role-Based Access Control (RBAC)

## Available Roles

The ERP system supports **7 roles** with different access levels:

1. **admin** - Full system access
2. **supervisor** - High-level oversight and editing
3. **manager** - Management access (NEW)
4. **hr** - Human Resources management
5. **technician** - Field technician access
6. **sales** - Sales team access
7. **finance** - Finance team access

## Permission Matrix

### Attendance

| Permission | admin | supervisor | manager | hr | technician | sales | finance |
|------------|-------|------------|---------|----|------------|-------|---------|
| View | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Quick Edit Status | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Audit | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Export | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

### Schedule

| Permission | admin | supervisor | manager | hr | technician | sales | finance |
|------------|-------|------------|---------|----|------------|-------|---------|
| View | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Reports

| Permission | admin | supervisor | manager | hr | technician | sales | finance |
|------------|-------|------------|---------|----|------------|-------|---------|
| View | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Export | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

## Navigation Access

All roles have access to:
- Dashboard (`/`)
- Attendance (`/attendance`)
- Leave (`/leave`)
- Overtime (`/overtime`)
- Calendar (`/calendar`)

### Restricted Navigation

| Page | Roles |
|------|-------|
| Kelola Hari Libur | admin, supervisor, hr, **manager** |
| Technician Schedule | admin, supervisor, hr, **manager** |
| My Schedule | technician, sales, finance, **manager** |
| Sales Schedule | admin, supervisor, sales, hr, **manager** |
| Reports | admin, supervisor, sales, finance, hr, **manager** |

## Implementation Files

### Core Files Updated

1. **`src/modules/auth/types.ts`** - Role type definition
   ```typescript
   export type Role = "admin" | "supervisor" | "technician" | "sales" | "finance" | "hr" | "manager";
   ```

2. **`src/modules/auth/permissions.ts`** - Permission matrix
   - Centralized permission definitions
   - Helper functions: `can()`, `canViewAttendance()`, `canEditSchedule()`, etc.

3. **`src/config/navigation.ts`** - Navigation configuration
   - Role-based menu visibility

4. **`src/modules/auth/useCurrentUser.ts`** - Mock user data
   - Test users for all 7 roles including manager

### Usage in Components

```typescript
import { canEditAttendance, canViewSchedule } from '@/modules/auth/permissions';
import type { Role } from '@/modules/auth/types';

// Get user role
const role = (user?.role?.toLowerCase() || 'employee') as Role;

// Check permissions
const canEdit = canEditAttendance(role);
const canView = canViewSchedule(role);
```

## Manager Role Characteristics

The **manager** role is designed for:
- Department managers who need oversight of their teams
- Can view and edit attendance records
- Can manage schedules (technician and sales)
- Can export reports
- Can manage holidays
- **Cannot** delete records (admin only)

## Testing the Manager Role

In development mode, you can switch to the manager role using the role switcher:

```typescript
// In useCurrentUser.ts mock
manager: {
  id: "user-manager",
  name: "Manager User",
  email: "manager@company.com",
  role: "manager",
  companyId: "company-1",
},
```

## Adding New Roles

To add a new role in the future:

1. Add role to `src/modules/auth/types.ts`
2. Add permissions in `src/modules/auth/permissions.ts`
3. Update navigation in `src/config/navigation.ts`
4. Add mock user in `src/modules/auth/useCurrentUser.ts`
5. Update this documentation

## Best Practices

✅ **DO:**
- Use the `can()` helper functions from `permissions.ts`
- Convert roles to lowercase before comparison
- Keep permission logic centralized

❌ **DON'T:**
- Hardcode role checks in components
- Use uppercase role names (legacy format)
- Bypass permission helpers
