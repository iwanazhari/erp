# Schedule Feature - Quick Reference

## 🚀 Quick Start

```tsx
// 1. Import the page component
import SchedulePage from '@/pages/Schedule';

// 2. Route is already set up at /schedule
// 3. Set environment variable
// VITE_API_URL=http://localhost:15320/api
```

---

## 📦 Key Imports

```typescript
// Components
import { 
  ScheduleForm, 
  ScheduleTable, 
  ScheduleModal,
  ScheduleFilters 
} from '@/features/schedule';

// Hooks
import { 
  useSchedules, 
  useCreateSchedule,
  useLocations 
} from '@/features/schedule';

// API
import { 
  scheduleApi, 
  locationApi 
} from '@/services/scheduleApi';

// Types
import type { 
  Schedule, 
  Location, 
  CreateScheduleInput 
} from '@/shared/types/schedule';
```

---

## 🎯 Common Operations

### Create Schedule
```typescript
const createSchedule = useCreateSchedule();

await createSchedule.mutateAsync({
  technicianId: 'tech-123',
  locationId: 'loc-456',
  date: '2026-02-25T00:00:00.000Z',
  startTime: '2026-02-25T08:00:00.000Z',
  endTime: '2026-02-25T12:00:00.000Z',
  description: 'Work description',
});
```

### Get Schedules
```typescript
const { data } = useSchedules({
  page: 1,
  limit: 20,
  status: 'ASSIGNED',
  dateFrom: '2026-02-01',
  dateTo: '2026-02-28',
});
```

### Check Availability
```typescript
const { data: availability } = useTechnicianAvailability(
  'tech-123',
  '2026-02-25'
);

// availability.data.isAvailable
// availability.data.quotaUsed
// availability.data.quotaMax
```

### Create Location
```typescript
const createLocation = useCreateLocation();

await createLocation.mutateAsync({
  name: 'Office Name',
  address: 'Street Address',
  latitude: -6.2088,
  longitude: 106.8456,
  radius: 100,
  description: 'Optional description',
});
```

---

## 🎨 Components Quick Props

### ScheduleForm
```tsx
<ScheduleForm
  onSubmit={handleSubmit}
  onCancel={handleClose}
  isSubmitting={false}
  initialDate={new Date()}
/>
```

### ScheduleTable
```tsx
<ScheduleTable
  schedules={schedules}
  onRowClick={(schedule) => setSelected(schedule)}
  isLoading={false}
/>
```

### ScheduleModal
```tsx
<ScheduleModal
  isOpen={true}
  onClose={handleClose}
  schedule={selectedSchedule}
  onSubmit={handleSubmit}
  isSubmitting={false}
  mode="view"  // 'create' | 'edit' | 'view'
  onEdit={handleEdit}
  onCancel={handleCancel}
  onDelete={handleDelete}
/>
```

---

## 🔧 Helper Functions

```typescript
import { 
  handleScheduleError,
  getStatusColor,
  getStatusBadgeClasses,
  formatScheduleTime,
  formatScheduleDate,
  calculateDuration
} from '@/features/schedule/utils/scheduleHelpers';

// Usage examples
const errorMessage = handleScheduleError(error);
const color = getStatusColor('ASSIGNED'); // '#2196F3'
const classes = getStatusBadgeClasses('COMPLETED'); // 'bg-emerald-50 text-emerald-600'
const time = formatScheduleTime('2026-02-25T08:00:00.000Z'); // '08:00'
const date = formatScheduleDate('2026-02-25T00:00:00.000Z'); // 'Wednesday, 25 February 2026'
const duration = calculateDuration(startTime, endTime); // { hours: 4, minutes: 0 }
```

---

## 📋 Status Values

```typescript
type ScheduleStatus = 
  | 'PENDING'      // Orange
  | 'ASSIGNED'     // Blue
  | 'IN_PROGRESS'  // Purple
  | 'COMPLETED'    // Green
  | 'CANCELLED';   // Red
```

---

## ⚠️ Validation Rules

### Schedule
- ✅ Min duration: 30 minutes
- ✅ Max duration: 8 hours (480 minutes)
- ✅ No past dates
- ✅ No overlapping schedules
- ✅ Max 3 locations per day per technician

### Location
- ✅ Radius: 10-1000 meters (default: 50)
- ✅ Latitude: -90 to 90
- ✅ Longitude: -180 to 180

---

## 🔐 Role Permissions

| Action | ADMIN | HR | MANAGER | TECHNICIAN |
|--------|-------|----|---------|------------|
| Create Schedule | ✅ | ✅ | ✅ | ❌ |
| Edit Schedule | ✅ | ✅ | ✅ | ❌ |
| Delete Schedule | ✅ | ❌ | ❌ | ❌ |
| View Schedules | ✅ | ✅ | ✅ | ✅ |
| Create Location | ✅ | ✅ | ✅ | ❌ |
| Delete Location | ✅ | ❌ | ❌ | ❌ |

---

## 🌐 API Endpoints

```
POST   /api/locations              - Create location
GET    /api/locations              - List locations
GET    /api/locations/:id          - Get location
PATCH  /api/locations/:id          - Update location
DELETE /api/locations/:id          - Delete location

POST   /api/schedules              - Create schedule
GET    /api/schedules              - List schedules
GET    /api/schedules/:id          - Get schedule
PATCH  /api/schedules/:id          - Update schedule
POST   /api/schedules/:id/cancel   - Cancel schedule
DELETE /api/schedules/:id          - Delete schedule
POST   /api/schedules/bulk         - Bulk create
GET    /api/schedules/availability/:techId/:date - Check availability
GET    /api/schedules/technician/:id - By technician
GET    /api/schedules/location/:id   - By location
```

---

## 🐛 Error Handling

```typescript
try {
  await scheduleApi.create(data);
} catch (error) {
  const message = handleScheduleError(error);
  // message is user-friendly string
  alert(message);
}
```

---

## 📁 File Locations

```
src/features/schedule/
├── components/          # UI components
├── hooks/              # React Query hooks
├── pages/              # Page components
├── utils/              # Helper functions
└── index.ts            # Main exports

src/services/scheduleApi.ts    # API service
src/shared/types/schedule.ts   # TypeScript types
```

---

## 🛠️ Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Type check
npm run build  # includes tsc

# Lint
npm run lint
```

---

**Quick Reference Card** | Last Updated: 2026-02-27
