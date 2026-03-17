# Attendance Records Endpoint Implementation

## Overview

Implementation of the admin-only endpoint for viewing comprehensive attendance records from all users across all companies.

**Date**: 2026-03-17  
**Status**: ✅ Production Ready

---

## 📌 Endpoint Specification

### Selected Endpoint: `GET /api/attendance/records`

**Admin-only endpoint for comprehensive attendance data.**

#### Features
- ✅ View all attendance data from all users (clock in & clock out)
- ✅ No companyId filter - ADMIN can see all data from all companies
- ✅ Filter opsional: date range, status, clockOutStatus
- ✅ Pagination support (default 50, max 100 per page)
- ✅ ADMIN only - authorization required

#### Example Request

```bash
curl -X GET "http://localhost:15320/api/attendance/records?startDate=2026-03-01&endDate=2026-03-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Response Data Includes
- Clock in/out time & location (GPS)
- Photos (selfie, job completion, signature, dll)
- User info (name, email, role, phone)
- Company & office info
- Payment info (untuk technician)
- Leave info (jika ada)
- Technician tracking info

#### Response Format

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "records": [
      {
        "id": "att-001",
        "userId": "user-123",
        "date": "2026-03-14",
        "clockIn": "2026-03-14T08:00:00+07:00",
        "clockOut": "2026-03-14T17:00:00+07:00",
        "status": "present",
        "clockOutStatus": "completed",
        "latitudeIn": -6.2088,
        "longitudeIn": 106.8456,
        "latitudeOut": -6.2090,
        "longitudeOut": 106.8460,
        "selfieUrlIn": "/api/files/selfie-in.jpg",
        "selfieUrlOut": "/api/files/selfie-out.jpg",
        "photos": [
          {
            "id": "photo-001",
            "url": "/api/files/job-complete.jpg",
            "type": "job_completion",
            "timestamp": "2026-03-14T17:00:00+07:00"
          }
        ],
        "leaveInfo": null,
        "user": {
          "id": "user-123",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "TECHNICIAN",
          "phone": "+628123456789"
        },
        "company": {
          "id": "comp-456",
          "name": "PT Example"
        },
        "office": {
          "id": "office-789",
          "name": "Kantor Pusat",
          "address": "Jl. Sudirman No. 1",
          "shiftStart": "08:00",
          "lateToleranceMinutes": 15
        },
        "paymentTransaction": {
          "id": "pay-001",
          "transactionId": "trx-001",
          "status": "paid"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 50,
      "total": 150,
      "totalPages": 3
    }
  }
}
```

---

## 🏗️ Implementation Architecture

```
┌─────────────────────────────────────────────────────────┐
│              AttendanceHistoryPage                       │
│  /attendance?page=1&pageSize=50&startDate=...           │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │  useAttendanceRecords  │
         │     (React Query)      │
         └────────┬───────────────┘
                  │
                  ▼
         ┌────────────────────────┐
         │  attendanceApi.getAll  │
         │       Records()        │
         └────────┬───────────────┘
                  │
                  ▼
         ┌────────────────────────┐
         │ GET /api/attendance/   │
         │       records          │
         │  ?startDate=...        │
         │  &endDate=...          │
         │  &page=1               │
         │  &pageSize=50          │
         └────────┬───────────────┘
                  │
                  ▼
         ┌────────────────────────┐
         │   Backend Response     │
         │  { records: [...],     │
         │    pagination: {...} } │
         └────────┬───────────────┘
                  │
                  ▼
         ┌────────────────────────┐
         │   Render Table         │
         └────────────────────────┘
```

---

## 📁 Files Modified

| File | Changes |
|------|---------|
| `src/shared/types/attendance.ts` | ✅ Added `Photo` interface<br>✅ Added `LeaveInfo` interface<br>✅ Updated `AttendanceRecord` with photos & leaveInfo<br>✅ Added `AttendanceRecordsData` interface<br>✅ Added `AttendanceRecordsFilters` interface with `clockOutStatus` |
| `src/services/attendanceApi.ts` | ✅ Added `getAllRecords()` method<br>✅ Supports startDate, endDate, status, clockOutStatus filters<br>✅ Enhanced JSDoc documentation |
| `src/features/attendance/hooks/useAttendance.ts` | ✅ Added `useAttendanceRecords()` hook<br>✅ Added `records` query key<br>✅ Handles nested response structure |
| `src/features/attendance/components/AttendanceFilters.tsx` | ✅ Added Clock Out Status filter<br>✅ Updated to use `AttendanceRecordsFilters`<br>✅ Changed "Cuti" to "Cuti/Izin" |
| `src/features/attendance/pages/AttendanceHistoryPage.tsx` | ✅ Updated to use `useAttendanceRecords()`<br>✅ Changed title to "Attendance Records"<br>✅ Updated data access to `data.records`<br>✅ Enhanced admin-focused description |
| `src/features/attendance/index.ts` | ✅ Exported `useAttendanceRecords` hook |

---

## 🔌 API Usage

### Basic Usage - Get Attendance Records (Admin)

```typescript
import { useAttendanceRecords } from '@/features/attendance';

function AttendanceRecordsList() {
  const { data, isLoading, error } = useAttendanceRecords({
    page: 1,
    pageSize: 50,
  });

  // data.records - Array of attendance records with photos, leave info, etc.
  // data.pagination - { page, pageSize, total, totalPages }
}
```

### With Date Range Filter

```typescript
const { data } = useAttendanceRecords({
  startDate: '2026-03-01',
  endDate: '2026-03-31',
  page: 1,
  pageSize: 50,
});
```

### With Status & Clock Out Status Filters

```typescript
const { data } = useAttendanceRecords({
  startDate: '2026-03-01',
  endDate: '2026-03-31',
  status: 'present',
  clockOutStatus: 'completed',
  page: 1,
  pageSize: 50,
});
```

---

## 🎯 Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `startDate` | string (YYYY-MM-DD) | No | - | Filter from date |
| `endDate` | string (YYYY-MM-DD) | No | - | Filter to date |
| `status` | string | No | - | Filter by status: `present`, `late`, `leave`, `absent` |
| `clockOutStatus` | string | No | - | Filter by: `completed`, `pending` |
| `page` | number | No | 1 | Page number |
| `pageSize` | number | No | 50 | Items per page (max: 100) |

**Note**: No `companyId` filter - ADMIN can see all data from all companies.

---

## 🧩 Available Hooks

| Hook | Purpose | Endpoint | Access |
|------|---------|----------|--------|
| `useAttendanceRecords(filters)` | Get all attendance records (Admin) | `GET /api/attendance/records` | ADMIN only |
| `useAttendanceHistory(filters)` | Get user attendance history | `GET /api/attendance/history` | All users |
| `useUserAttendanceHistory(userId, filters)` | Get specific user's history | `GET /api/attendance/history/user/:userId` | All users |
| `useMonthlyAttendance(filters)` | Get monthly summary | `GET /api/attendance/monthly` | All users |
| `useAttendanceById(id)` | Get single record | `GET /api/attendance/:id` | All users |
| `useDailyStatus()` | Get daily overview | `GET /api/attendance/status/daily` | All users |

---

## 📊 TypeScript Types

### AttendanceRecord (Enhanced)

```typescript
export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  clockIn: string;
  clockOut: string;
  status: AttendanceStatus;
  clockOutStatus: ClockOutStatus;
  latitudeIn: number;
  longitudeIn: number;
  latitudeOut: number;
  longitudeOut: number;
  selfieUrlIn: string;
  selfieUrlOut: string;
  user: User;
  company: Company;
  office: Office;
  paymentTransaction: PaymentTransaction | null;
  photos?: Photo[];        // NEW
  leaveInfo?: LeaveInfo;   // NEW
  createdAt: string;
  updatedAt: string;
}
```

### Photo (New)

```typescript
export interface Photo {
  id: string;
  url: string;
  type: string;
  timestamp: string;
}
```

### LeaveInfo (New)

```typescript
export interface LeaveInfo {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
}
```

### AttendanceRecordsData (New)

```typescript
export interface AttendanceRecordsData {
  records: AttendanceRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

### AttendanceRecordsFilters (New)

```typescript
export interface AttendanceRecordsFilters {
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  clockOutStatus?: ClockOutStatus;
  page?: number;
  pageSize?: number;
}
```

---

## 🎨 UI Components

### Filters Component

Now includes **Clock Out Status** filter:

```tsx
<select
  value={localFilters.clockOutStatus || ''}
  onChange={(e) => handleInputChange('clockOutStatus', e.target.value)}
>
  <option value="">Semua Status</option>
  <option value="completed">Completed</option>
  <option value="pending">Pending</option>
</select>
```

### Page Header

```tsx
<h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
<p className="text-sm text-gray-500 mt-1">
  Lihat semua data attendance dari semua user (Admin)
</p>
```

---

## ✅ Build Status

```bash
npm run build

> erp@0.0.0 build
> tsc -b && vite build

✓ 259 modules transformed.
dist/index.html                   0.45 kB │ gzip:   0.29 kB
dist/assets/index-BqlIfGqU.css   37.71 kB │ gzip:   7.50 kB
dist/assets/index-DWUiFs1d.js   509.82 kB │ gzip: 149.55 kB
✓ built in 3.76s
```

**Status**: ✅ **No errors**

---

## 🔐 Authorization

This endpoint requires:
- ✅ Valid JWT token in Authorization header
- ✅ User role: **ADMIN**
- ✅ Active user status

Non-ADMIN users will receive a 403 Forbidden response.

---

## 🚀 Future Enhancements

1. **Export to CSV/Excel** - Download attendance records
2. **Bulk Actions** - Approve/reject multiple records
3. **Advanced Analytics** - Charts and graphs for attendance trends
4. **Real-time Updates** - WebSocket for live attendance tracking
5. **Geofencing Validation** - Verify clock-in location accuracy
6. **Photo Gallery View** - Grid view of all attendance photos

---

## 🔗 Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall system architecture
- [ATTENDANCE_HISTORY_IMPLEMENTATION.md](./ATTENDANCE_HISTORY_IMPLEMENTATION.md) - Original history implementation
- [ATTENDANCE_ENDPOINT_IMPLEMENTATION.md](./ATTENDANCE_ENDPOINT_IMPLEMENTATION.md) - Previous endpoint implementation
- [AUTHENTICATION.md](./AUTHENTICATION.md) - Auth and API access
- [LOGOUT_MENU_IMPLEMENTATION.md](./LOGOUT_MENU_IMPLEMENTATION.md) - Logout menu feature

---

**Status**: ✅ **Production Ready**
