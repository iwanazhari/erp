# Schedule Implementation Summary

## Overview

This document summarizes the complete schedule management feature implementation for the frontend, aligned with the backend API routes.

---

## 📁 Complete File Structure

```
src/
├── shared/
│   └── types/
│       └── schedule.ts                      # TypeScript types & interfaces
├── services/
│   └── scheduleApi.ts                       # API service layer with axios
├── features/
│   └── schedule/
│       ├── components/
│       │   ├── ScheduleForm.tsx             # Create/edit schedule form
│       │   ├── ScheduleDetails.tsx          # Schedule detail view
│       │   ├── ScheduleModal.tsx            # Modal wrapper
│       │   ├── ScheduleTable.tsx            # Schedule list table
│       │   ├── ScheduleFilters.tsx          # Filter controls
│       │   ├── LocationForm.tsx             # Create/edit location form
│       │   └── index.ts
│       ├── hooks/
│       │   └── useSchedules.ts              # React Query hooks
│       ├── pages/
│       │   ├── SchedulePage.tsx             # Main schedule CRUD page
│       │   ├── LocationManagementPage.tsx   # Location management
│       │   └── index.ts
│       ├── utils/
│       │   └── scheduleHelpers.ts           # Helper functions
│       ├── index.ts                         # Feature exports
│       ├── README.md                        # Feature documentation
│       └── BACKEND_API.md                   # Backend API reference
└── pages/
    └── Schedule.tsx                         # Route page (exports SchedulePage)
```

---

## 🔌 Backend API Endpoints Mapping

### Location Endpoints
| Method | Endpoint | Frontend Function | Roles |
|--------|----------|------------------|-------|
| POST | `/api/locations` | `locationApi.create()` | ADMIN, HR, MANAGER |
| GET | `/api/locations` | `locationApi.getAll()` | All authenticated |
| GET | `/api/locations/:id` | `locationApi.getById()` | All authenticated |
| PATCH | `/api/locations/:id` | `locationApi.update()` | ADMIN, HR, MANAGER |
| DELETE | `/api/locations/:id` | `locationApi.delete()` | ADMIN only |

### Schedule Endpoints
| Method | Endpoint | Frontend Function | Roles |
|--------|----------|------------------|-------|
| POST | `/api/schedules` | `scheduleApi.create()` | ADMIN, HR, MANAGER |
| GET | `/api/schedules` | `scheduleApi.getAll()` | All authenticated |
| GET | `/api/schedules/:id` | `scheduleApi.getById()` | All authenticated |
| PATCH | `/api/schedules/:id` | `scheduleApi.update()` | ADMIN, HR, MANAGER |
| POST | `/api/schedules/:id/cancel` | `scheduleApi.cancel()` | ADMIN, HR, MANAGER |
| DELETE | `/api/schedules/:id` | `scheduleApi.delete()` | ADMIN only |
| POST | `/api/schedules/bulk` | `scheduleApi.bulkCreate()` | ADMIN, HR, MANAGER |
| GET | `/api/schedules/availability/:techId/:date` | `scheduleApi.checkAvailability()` | All authenticated |
| GET | `/api/schedules/technician/:id` | `scheduleApi.getTechnicianSchedules()` | All authenticated |
| GET | `/api/schedules/location/:id` | `scheduleApi.getLocationSchedules()` | All authenticated |

### Technician Tracking Endpoints
| Method | Endpoint | Frontend Function | Roles |
|--------|----------|------------------|-------|
| POST | `/api/technician/location` | (Not implemented yet) | TECHNICIAN, TECHNICIAN_PAYMENT |
| GET | `/api/technician/status` | (Not implemented yet) | TECHNICIAN, TECHNICIAN_PAYMENT |
| GET | `/api/technician/location-history` | (Not implemented yet) | TECHNICIAN, TECHNICIAN_PAYMENT |

---

## 🎯 Features Implemented

### ✅ Schedule Management
- [x] Create schedule with validation
- [x] View schedule list with pagination
- [x] Filter by technician, location, status, date range
- [x] View schedule details
- [x] Update schedule
- [x] Cancel schedule
- [x] Delete schedule
- [x] Check technician availability
- [x] Bulk create schedules (max 50)
- [x] Form validation (time conflicts, duration limits, quota)
- [x] Real-time availability indicator

### ✅ Location Management
- [x] Create location with coordinates
- [x] View location list with pagination
- [x] View location details
- [x] Update location
- [x] Delete location
- [x] Active/inactive status toggle
- [x] Radius configuration (10-1000m)

### ✅ UI Components
- [x] ScheduleForm - Create/edit with validation
- [x] ScheduleDetails - Detail view with actions
- [x] ScheduleTable - Responsive table
- [x] ScheduleFilters - Filter controls
- [x] ScheduleModal - Modal wrapper
- [x] LocationForm - Create/edit location form

### ✅ React Query Hooks
- [x] `useSchedules` - List schedules with filters
- [x] `useSchedule` - Get single schedule
- [x] `useCreateSchedule` - Create mutation
- [x] `useUpdateSchedule` - Update mutation
- [x] `useCancelSchedule` - Cancel mutation
- [x] `useDeleteSchedule` - Delete mutation
- [x] `useBulkCreateSchedules` - Bulk create mutation
- [x] `useTechnicianAvailability` - Availability query
- [x] `useTechnicianSchedules` - Schedules by technician
- [x] `useLocationSchedules` - Schedules by location
- [x] `useLocations` - List locations
- [x] `useLocation` - Get single location
- [x] `useCreateLocation` - Create mutation
- [x] `useUpdateLocation` - Update mutation
- [x] `useDeleteLocation` - Delete mutation

### ✅ Utilities
- [x] `handleScheduleError` - Centralized error handling
- [x] `getStatusColor` - Status badge colors
- [x] `getStatusBadgeClasses` - Tailwind classes for status
- [x] `formatScheduleTime` - Time formatter
- [x] `formatScheduleDate` - Date formatter
- [x] `calculateDuration` - Duration calculator

---

## 🔐 Role-Based Access

### ADMIN
- ✅ Full access to all endpoints
- ✅ Can delete locations and schedules

### HR
- ✅ Create, update schedules and locations
- ✅ Cancel schedules
- ❌ Cannot delete locations or schedules

### MANAGER
- ✅ Same as HR
- ❌ Cannot delete locations or schedules

### TECHNICIAN / TECHNICIAN_PAYMENT
- ✅ View schedules and locations
- ✅ Check availability
- ✅ View own schedules
- ❌ Cannot create/update/delete schedules or locations

---

## 📝 Validation Rules

### Schedule Creation
```typescript
// Frontend validation (ScheduleForm.tsx)
- Technician: Required, must be selected
- Location: Required, must be selected
- Date: Required, cannot be in past
- Start Time: Required
- End Time: Required, must be > startTime
- Duration: Min 30 minutes, Max 8 hours (480 minutes)
- Description: Optional, max 1000 characters
- Notes: Optional, max 1000 characters

// Backend validation (enforced by API)
- Technician role must be TECHNICIAN or TECHNICIAN_PAYMENT
- No overlapping schedules on same date
- Max 3 different locations per day per technician
```

### Location Creation
```typescript
// Frontend validation (LocationForm.tsx)
- Name: Required, 1-255 characters
- Address: Required, 1-500 characters
- Latitude: Required, -90 to 90
- Longitude: Required, -180 to 180
- Radius: Optional, 10-1000 meters (default: 50)
- Description: Optional, max 1000 characters
```

---

## 🔧 Configuration

### Environment Variables
Create `.env` file in project root:
```env
VITE_API_URL=http://localhost:15320/api
```

### Required Dependencies
```json
{
  "axios": "^1.x.x",
  "@tanstack/react-query": "^5.x.x",
  "react": "^19.x.x",
  "typescript": "^5.x.x"
}
```

---

## 📖 Usage Examples

### Basic Schedule Creation
```tsx
import { useCreateSchedule, useLocations } from '@/features/schedule';

function MyComponent() {
  const createSchedule = useCreateSchedule();
  const { data: locationsData } = useLocations({ isActive: true });
  
  const handleSubmit = async (data) => {
    try {
      await createSchedule.mutateAsync({
        technicianId: 'tech-123',
        locationId: 'loc-456',
        date: '2026-02-25T00:00:00.000Z',
        startTime: '2026-02-25T08:00:00.000Z',
        endTime: '2026-02-25T12:00:00.000Z',
        description: 'Installation work',
      });
      alert('Schedule created successfully!');
    } catch (error) {
      alert('Failed to create schedule');
    }
  };
  
  return (
    // Your form component
  );
}
```

### Check Technician Availability
```tsx
import { useTechnicianAvailability } from '@/features/schedule';

function AvailabilityCheck({ technicianId, date }) {
  const { data: availability } = useTechnicianAvailability(technicianId, date);
  
  if (!availability?.data) return null;
  
  return (
    <div>
      <p>Available: {availability.data.isAvailable ? 'Yes' : 'No'}</p>
      <p>Quota: {availability.data.quotaUsed}/{availability.data.quotaMax}</p>
      {availability.data.availableSlots.map(slot => (
        <p key={slot.startTime}>
          {slot.startTime} - {slot.endTime}
        </p>
      ))}
    </div>
  );
}
```

### Filter Schedules
```tsx
import { useSchedules } from '@/features/schedule';

function ScheduleList() {
  const { data, isLoading } = useSchedules({
    technicianId: 'tech-123',
    dateFrom: '2026-02-01',
    dateTo: '2026-02-28',
    status: 'ASSIGNED',
    page: 1,
    limit: 20,
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {data.data.map(schedule => (
        <div key={schedule.id}>
          {schedule.technician.name} - {schedule.location.name}
        </div>
      ))}
    </div>
  );
}
```

---

## 🎨 Component Props Reference

### ScheduleForm
```tsx
interface Props {
  initialData?: Schedule;        // For edit mode
  onSubmit: (data) => void;      // Submit handler
  onCancel: () => void;          // Cancel handler
  isSubmitting: boolean;         // Loading state
  initialDate?: Date;            // Pre-selected date
}
```

### ScheduleTable
```tsx
interface Props {
  schedules: Schedule[];         // Array of schedules
  onRowClick: (schedule) => void; // Row click handler
  isLoading?: boolean;           // Loading state
}
```

### ScheduleModal
```tsx
interface Props {
  isOpen: boolean;
  onClose: () => void;
  schedule?: Schedule | null;
  onSubmit: (data) => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit' | 'view';
  initialDate?: Date;
  onEdit?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}
```

---

## 🐛 Error Handling

All API errors are handled by `handleScheduleError()` function which maps backend error codes to user-friendly messages:

```typescript
// Example error codes
SCHEDULE_TIME_OVERLAP          → "Jadwal bentrok dengan jadwal lain"
TECHNICIAN_DAILY_QUOTA_EXCEEDED → "Teknisi sudah mencapai batas maksimal"
PAST_SCHEDULE_NOT_ALLOWED      → "Tidak dapat membuat jadwal di masa lalu"
SCHEDULE_DURATION_TOO_SHORT    → "Durasi jadwal minimal 30 menit"
SCHEDULE_DURATION_TOO_LONG     → "Durasi jadwal maksimal 8 jam"
```

---

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Jadwal berhasil dibuat",
  "data": { /* Schedule or Location object */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": [
    {
      "path": "fieldName",
      "message": "Field-specific error"
    }
  ],
  "meta": {
    "additional": "context data"
  }
}
```

---

## 🚀 Next Steps / Recommendations

1. **Add Technician List API** - Replace mock data in `ScheduleForm.tsx` with actual API call
2. **Add Calendar View** - Integrate `react-big-calendar` or similar library
3. **Add Bulk Upload** - CSV import feature for bulk schedule creation
4. **Add Real-time Tracking** - Implement technician location tracking UI
5. **Add Notifications** - Push notifications for schedule changes
6. **Add Export** - Export schedules to PDF/Excel
7. **Add Dashboard Widgets** - Show schedule statistics on dashboard

---

## 📚 Documentation Files

- `README.md` - Feature documentation and usage guide
- `BACKEND_API.md` - Complete backend API reference
- `IMPLEMENTATION_SUMMARY.md` - This file

---

**Build Status:** ✅ Passing  
**Last Updated:** 2026-02-27  
**Frontend Version:** 1.0.0  
**Backend Version:** 1.0.0
