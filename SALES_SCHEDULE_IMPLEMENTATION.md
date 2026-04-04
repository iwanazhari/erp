# Sales Schedule Management - Implementation Summary

## What Was Implemented

### 1. Sales Schedule Form Enhancement (`src/features/schedule/components/SalesScheduleForm.tsx`)
- **Multiple Sales Selection**: Form now supports selecting multiple sales users for a single schedule
- **Location Dropdown**: Dropdown to select from existing locations instead of manual entry
- **Google Maps Integration**: Optional Google Maps link parsing for new locations
- **Better UX**: Visual feedback for selected sales, checkmarks, and count display

### 2. Sales Schedule List Page (`src/pages/SalesSchedule.tsx`)
- **Filters Panel**:
  - Status filter (PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED)
  - Date range filter (dateFrom, dateTo)
  - Search filter (description, notes, location name)
- **Pagination Controls**: Page size selector (10, 20, 50) and prev/next navigation
- **Cancel Modal**: Modal dialog for entering cancellation reason
- **Error Handling**: Specific error messages for 400 (validation/time overlap), 403 (forbidden)
- **Multi-participant Display**: Shows "+N sales lainnya" for schedules with multiple sales
- **API-Compliant Payload**: Sends `date` as YYYY-MM-DD, `startTime` and `endTime` as HH:mm

### 3. Sales Schedule Detail Page (`src/pages/SalesScheduleDetail.tsx`)
- Complete schedule information display
- **Attendance Records Section**: Shows clock-in/out times, coordinates, selfie URLs, session numbers
- **Cancellation Info**: Displays cancellation reason, timestamp, and cancelledBy user ID
- **Location Map Link**: Direct link to Google Maps for the location
- **Participants List**: All sales users assigned to the schedule

### 4. Location Management Page (`src/pages/LocationManagement.tsx`)
- **CRUD Operations**: Create, Read, Update, Delete locations
- **Filters**: Search by name/address, filter by active/inactive status
- **Pagination**: Same pagination pattern as sales schedules
- **Google Maps Links**: Direct links to view locations on Google Maps
- **Form Integration**: Reuses existing LocationForm component

### 5. API Layer Updates

#### `src/services/salesScheduleApi.ts`
- Updated `getAll` to support `pageSize`, `search`, and all documented query parameters
- Maps `technicianId` filter to `salesId` query parameter (legacy compatibility)
- Cancel endpoint supports optional `reason` parameter

#### `src/services/scheduleApi.ts` (Location API)
- Added `search` parameter support to `locationApi.getAll`

#### `src/features/schedule/hooks/useSalesSchedules.ts`
- Fixed imports to use `salesScheduleApi` instead of `scheduleApi`
- Updated cancel mutation to support optional `reason` parameter

### 6. Type Updates (`src/shared/types/schedule.ts`)
- Added `attendance` records array to Schedule interface with all fields:
  - id, userId, date, clockIn, clockOut, status
  - sessionNumber, latitudeIn/Out, longitudeIn/Out
  - selfieUrlIn/Out
- Added `cancellationReason` and `cancelledBy` fields to Schedule interface
- Added `search` and `pageSize` to ScheduleFilters interface
- Added `search` to LocationFilters interface

### 7. Helper Updates (`src/features/schedule/utils/scheduleHelpers.ts`)
- Improved `getScheduleAssigneeDisplay` to handle multiple sales participants
- Shows count when multiple sales are assigned (e.g., "3 Sales")

## API Endpoints Used (Verified Against Backend Spec)

| Method | Endpoint | Purpose | Payload Format |
|--------|----------|---------|----------------|
| POST | `/api/sales/schedules` | Create schedule | `salesIds[]`, `locationId`, `date` (YYYY-MM-DD), `startTime` (HH:mm), `endTime` (HH:mm) |
| GET | `/api/sales/schedules` | List schedules with filters | `page`, `pageSize`, `salesId`, `locationId`, `status`, `dateFrom`, `dateTo`, `search` |
| GET | `/api/sales/schedules/:id` | Get schedule detail | - |
| PATCH | `/api/sales/schedules/:id` | Update schedule | Same as create (all optional) |
| PATCH | `/api/sales/schedules/:id/cancel` | Cancel schedule with reason | `{ reason: string }` |
| DELETE | `/api/sales/schedules/:id` | Delete schedule (PENDING only) | - |
| POST | `/api/locations` | Create location | `name`, `address`, `latitude`, `longitude`, `radius`, `description`, `officeId` |
| GET | `/api/locations` | List locations with filters | `page`, `pageSize`, `search`, `isActive` |
| PATCH | `/api/locations/:id` | Update location | Same as create (all optional) |
| DELETE | `/api/locations/:id` | Delete location | - |

## Date/Time Format Compliance

Per backend API specification:

| Field | Format | Example |
|-------|--------|---------|
| `date` | YYYY-MM-DD | `"2026-04-05"` |
| `startTime` | HH:mm (24-hour) | `"09:00"` |
| `endTime` | HH:mm (24-hour) | `"11:00"` |

✅ **Implementation sends correct format** - No ISO conversion

## Error Handling

| Status Code | Scenario | Message |
|-------------|----------|---------|
| 400 | Missing fields / Invalid data / Time overlap | Backend message displayed |
| 403 | Forbidden (wrong role) | "Anda tidak memiliki akses untuk membuat jadwal" |
| 404 | Not found | "Tidak ditemukan" |
| 500 | Server error | Generic error message |

### Specific 400 Error Scenarios (from backend):
- Missing required fields: `"salesIds serta date, startTime, dan endTime wajib diisi"`
- Invalid sales IDs: `"Sales IDs harus berisi user dengan role SALES saja"`
- Time overlap: `"Salah satu sales sudah memiliki jadwal pada waktu yang sama"`
- Cancelled schedule update: `"Jadwal sudah dibatalkan, tidak dapat diperbarui"`
- Delete non-PENDING: `"Hanya jadwal dengan status PENDING yang dapat dihapus"`

## Access Control

- **ADMIN, HR**: Full access to create, edit, cancel, delete sales schedules
- **SUPERVISOR**: Can edit schedules (per permission matrix)
- **SALES**: Can only view their own schedules
- Permission checks via `canEditSchedule()` and `canDeleteSchedule()` from `src/modules/auth/permissions.ts`

## Build Status
✅ **Build successful** - No TypeScript errors
- Output: `dist/assets/index-BX_W3JYl.js` (699.50 KB)
- CSS: `dist/assets/index-Bzvkl7Ws.css` (63.11 KB)

## Files Modified/Created

### Modified Files:
1. `src/services/salesScheduleApi.ts` - Updated query parameters, added comments
2. `src/services/scheduleApi.ts` - Added search parameter to locationApi.getAll
3. `src/features/schedule/hooks/useSalesSchedules.ts` - Fixed imports, updated cancel mutation
4. `src/features/schedule/components/SalesScheduleForm.tsx` - Complete rewrite with multi-select
5. `src/pages/SalesSchedule.tsx` - Complete rewrite with filters, corrected payload format
6. `src/pages/SalesScheduleDetail.tsx` - Added cancelledBy display
7. `src/shared/types/schedule.ts` - Added attendance, cancellationReason, cancelledBy, search, pageSize
8. `src/features/schedule/utils/scheduleHelpers.ts` - Improved multi-participant display

### Created Files:
1. `src/pages/SalesScheduleDetail.tsx` - Detail page with attendance records
2. `src/pages/LocationManagement.tsx` - Location CRUD page with search
3. `SALES_SCHEDULE_IMPLEMENTATION.md` - This documentation

## Backend API Compliance Checklist

- [x] POST `/api/sales/schedules` sends `salesIds` array
- [x] Date format: YYYY-MM-DD (not ISO)
- [x] Time format: HH:mm 24-hour (not ISO)
- [x] GET supports `page` and `pageSize` query params
- [x] GET supports `salesId` filter
- [x] GET supports `locationId` filter
- [x] GET supports `status` filter
- [x] GET supports `dateFrom` and `dateTo` filters
- [x] GET supports `search` parameter
- [x] PATCH `/api/sales/schedules/:id/cancel` sends `reason` in body
- [x] DELETE only allowed for PENDING schedules
- [x] Location GET supports `search` parameter
- [x] Location GET supports `isActive` filter
- [x] Attendance records displayed with all fields
- [x] Error handling for 400, 403 status codes

## Notes

- The implementation follows the existing project patterns (TanStack Query, Card/Button components, etc.)
- All Indonesian language for user-facing text
- Production-ready with proper error handling and loading states
- Uses existing permission system for role-based access control
- **All date/time payloads match backend API spec** (YYYY-MM-DD and HH:mm format)
- Attendance records include session numbers, coordinates, and selfie URLs
