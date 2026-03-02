# Schedule Feature

Schedule management feature for technician scheduling at specific locations.

## 📁 Structure

```
src/features/schedule/
├── components/           # Reusable UI components
│   ├── ScheduleForm.tsx       # Form for creating/editing schedules
│   ├── ScheduleDetails.tsx    # Schedule detail view
│   ├── ScheduleModal.tsx      # Modal wrapper
│   ├── ScheduleTable.tsx      # Schedule list table
│   ├── ScheduleFilters.tsx    # Filter controls
│   ├── LocationForm.tsx       # Form for creating/editing locations
│   └── index.ts
├── hooks/
│   └── useSchedules.ts        # React Query hooks
├── pages/
│   ├── SchedulePage.tsx             # Main schedule management page
│   ├── LocationManagementPage.tsx   # Location management page
│   └── index.ts
├── utils/
│   └── scheduleHelpers.ts   # Helper functions
└── index.ts                 # Feature exports
```

## 🎯 Features

### Schedule Management
- ✅ Create, read, update, delete schedules
- ✅ Filter by technician, location, status, and date range
- ✅ View schedule details
- ✅ Cancel schedules
- ✅ Check technician availability
- ✅ Form validation (time conflicts, duration limits, quota)

### Location Management
- ✅ Create, read, update, delete locations
- ✅ Store location coordinates (latitude/longitude)
- ✅ Set radius for geofencing
- ✅ Active/inactive status

## 🔌 API Integration

All API calls are handled by `src/services/scheduleApi.ts`.

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:15320/api
```

## 📖 Usage

### Schedule Page

Access at `/schedule`

```tsx
import { SchedulePage } from '@/features/schedule';

// The page includes:
// - Schedule list with filters
// - Create/Edit/Delete functionality
// - Technician availability checking
```

### Location Management Page

Access at `/schedule/locations` (needs route setup)

```tsx
import { LocationManagementPage } from '@/features/schedule';
```

### Using Hooks

```tsx
import {
  useSchedules,
  useCreateSchedule,
  useLocations,
  useTechnicianAvailability,
} from '@/features/schedule';

function MyComponent() {
  const { data: schedules } = useSchedules({ page: 1, limit: 20 });
  const createSchedule = useCreateSchedule();
  const { data: locations } = useLocations({ isActive: true });
  
  // ...
}
```

### Using Components

```tsx
import { ScheduleForm, ScheduleTable, ScheduleFilters } from '@/features/schedule';

function CustomScheduleView() {
  return (
    <div>
      <ScheduleFilters filters={filters} onFilterChange={setFilters} />
      <ScheduleTable schedules={schedules} onRowClick={handleClick} />
    </div>
  );
}
```

## 🔧 Configuration

### Adding Route

Add to `src/routes/schedule.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { SchedulePage } from "@/features/schedule";

export const Route = createFileRoute("/schedule")({
  component: SchedulePage,
});
```

### Adding Location Management Route

Create `src/routes/schedule-locations.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { LocationManagementPage } from "@/features/schedule";

export const Route = createFileRoute("/schedule-locations")({
  component: LocationManagementPage,
});
```

## 📝 Validation Rules

### Schedule Creation
- ✅ Technician must have `TECHNICIAN` or `TECHNICIAN_PAYMENT` role
- ✅ Date cannot be in the past
- ✅ Minimum duration: 30 minutes
- ✅ Maximum duration: 8 hours
- ✅ No overlapping schedules on the same date
- ✅ Maximum 3 different locations per day per technician

### Location Creation
- ✅ Name: required, 1-255 characters
- ✅ Address: required, 1-500 characters
- ✅ Latitude: required, -90 to 90
- ✅ Longitude: required, -180 to 180
- ✅ Radius: optional, 10-1000 meters (default: 50)
- ✅ Description: optional, max 1000 characters

## 🎨 Components

### ScheduleForm
Form for creating/editing schedules with:
- Technician selection
- Location selection
- Date and time pickers
- Duration calculation
- Availability indicator
- Description and notes fields

### ScheduleTable
Responsive table displaying:
- Technician name and email
- Location name and address
- Date and time
- Status badge
- Click handlers for details

### ScheduleDetails
Detail view showing:
- Full schedule information
- Duration calculation
- Location details
- Status badge
- Action buttons (Edit, Cancel, Delete)

### ScheduleFilters
Filter controls for:
- Technician dropdown
- Location dropdown
- Status dropdown
- Date range pickers

### LocationForm
Form for creating/editing locations with:
- Name and address fields
- Coordinate inputs (lat/lng)
- Radius input
- Description textarea
- Active status toggle

## 🛠️ Helper Functions

```ts
// Error handling
handleScheduleError(error: any): string

// Styling
getStatusColor(status: ScheduleStatus): string
getStatusBadgeClasses(status: ScheduleStatus): string

// Formatting
formatScheduleTime(dateString: string): string
formatScheduleDate(dateString: string): string

// Calculation
calculateDuration(startTime: string, endTime: string): { hours: number; minutes: number }
```

## 📦 Dependencies

- `@tanstack/react-query` - Data fetching and caching
- `axios` - HTTP client
- `react` - UI library
- `typescript` - Type safety

## 🔐 Authentication

All API requests require a Bearer token. The token is automatically added from `localStorage.getItem('accessToken')`.

## 📋 API Endpoints

See the full API documentation in the project root or at:
- Swagger UI: `http://localhost:15320/api-docs`
- Documentation: `./docs/schedule-api.md`

## 🧪 Testing

```bash
# Run tests
npm test

# Run type check
npm run build
```

## 📝 Notes

- Mock technician data is used in `ScheduleForm`. Replace with actual API call in production.
- The feature uses Indonesian language for UI text. Modify as needed for your locale.
- Default API URL is `http://localhost:15320/api`. Update `VITE_API_URL` for production.
