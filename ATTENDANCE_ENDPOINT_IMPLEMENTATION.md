# Attendance History Endpoint Implementation

## Overview

Implementation of the primary endpoint for displaying all users' attendance history.

**Date**: 2026-03-17  
**Status**: ✅ Production Ready

---

## 📌 Endpoint Selection

### Selected Endpoint: `GET /api/attendance/history`

**Primary endpoint for fetching attendance history with filters.**

### Endpoint Specification

```
GET /api/attendance/history?startDate=2026-03-01&endDate=2026-03-31&page=1&pageSize=50
```

**Query Parameters:**

| Parameter | Required | Description                             |
|-----------|----------|-----------------------------------------|
| startDate | No       | Tanggal mulai (YYYY-MM-DD)              |
| endDate   | No       | Tanggal akhir (YYYY-MM-DD)              |
| page      | No       | Halaman (default: 1)                    |
| pageSize  | No       | Jumlah data per halaman (default: 20)   |
| status    | No       | Filter status (present, late, leave, absent) |
| companyId | No       | Filter berdasarkan company              |

**Example cURL:**

```bash
curl -X GET "http://localhost:15320/api/attendance/history?startDate=2026-03-01&endDate=2026-03-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Format:**

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "attendances": [...],
    "pagination": {
      "page": 1,
      "pageSize": 50,
      "total": 100,
      "totalPages": 2
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
         │  useAttendanceHistory  │
         │     (React Query)      │
         └────────┬───────────────┘
                  │
                  ▼
         ┌────────────────────────┐
         │  attendanceApi.get     │
         │        History()       │
         └────────┬───────────────┘
                  │
                  ▼
         ┌────────────────────────┐
         │ GET /api/attendance/   │
         │       history          │
         │  ?startDate=...        │
         │  &endDate=...          │
         │  &page=1               │
         │  &pageSize=50          │
         └────────┬───────────────┘
                  │
                  ▼
         ┌────────────────────────┐
         │   Backend Response     │
         │  { attendances: [...], │
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
| `src/shared/types/attendance.ts` | ✅ Added `AttendanceHistoryData` interface with `attendances` and `pagination`<br>✅ Added `AttendanceRecordsData` for legacy format |
| `src/services/attendanceApi.ts` | ✅ Updated to use `/api/attendance/history`<br>✅ Method renamed to `getHistory()`<br>✅ Enhanced JSDoc documentation |
| `src/features/attendance/hooks/useAttendance.ts` | ✅ Updated `useAttendanceHistory` to use new endpoint<br>✅ Enhanced JSDoc with response format<br>✅ Updated query keys |
| `src/features/attendance/components/AttendanceHistoryTable.tsx` | ✅ Updated to use `attendances` prop<br>✅ Removed dual-format logic (monthly/daily)<br>✅ Simplified to single table format |
| `src/features/attendance/pages/AttendanceHistoryPage.tsx` | ✅ Updated to use new data structure<br>✅ Removed debug console.log statements<br>✅ Enhanced component documentation |

---

## 🔌 API Usage

### Basic Usage - Get Attendance History

```typescript
import { useAttendanceHistory } from '@/features/attendance';

function AttendanceList() {
  const { data, isLoading, error } = useAttendanceHistory({
    page: 1,
    pageSize: 50,
  });

  // data.attendances - Array of attendance records
  // data.pagination - { page, pageSize, total, totalPages }
}
```

### With Date Range Filter

```typescript
const { data } = useAttendanceHistory({
  startDate: '2026-03-01',
  endDate: '2026-03-31',
  page: 1,
  pageSize: 50,
});
```

### With Status Filter

```typescript
const { data } = useAttendanceHistory({
  startDate: '2026-03-01',
  endDate: '2026-03-31',
  status: 'present', // 'present' | 'late' | 'leave' | 'absent'
  page: 1,
  pageSize: 50,
});
```

---

## 📊 Response Format

### Attendance History Response

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "attendances": [
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
        "user": {
          "id": "user-123",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "TECHNICIAN"
        },
        "office": {
          "id": "office-456",
          "name": "Kantor Pusat",
          "address": "Jl. Sudirman No. 1",
          "shiftStart": "08:00",
          "lateToleranceMinutes": 15
        },
        "company": {
          "id": "comp-789",
          "name": "PT Example"
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

## 🎯 Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `companyId` | string | No | - | Filter by company ID |
| `startDate` | string (YYYY-MM-DD) | No | - | Filter from date |
| `endDate` | string (YYYY-MM-DD) | No | - | Filter to date |
| `status` | string | No | - | Filter by status: `present`, `late`, `leave`, `absent` |
| `page` | number | No | 1 | Page number |
| `pageSize` | number | No | 20 | Items per page (max: 100) |

---

## 🧩 Available Hooks

| Hook | Purpose | Endpoint |
|------|---------|----------|
| `useAttendanceHistory(filters)` | Get attendance history with filters | `GET /api/attendance/history` |
| `useUserAttendanceHistory(userId, filters)` | Get specific user's history | `GET /api/attendance/history/user/:userId` |
| `useMonthlyAttendance(filters)` | Get monthly summary | `GET /api/attendance/monthly` |
| `useAttendanceById(id)` | Get single record | `GET /api/attendance/:id` |
| `useDailyStatus()` | Get daily overview | `GET /api/attendance/status/daily` |

---

## 📝 Key Changes Summary

### Updated Types
- ✅ `AttendanceHistoryData` - New format with `attendances[]` and `pagination{}`
- ✅ `AttendanceRecordsData` - Legacy format with `records[]` at root level

### Updated API Service
- ✅ `attendanceApi.getHistory()` - Primary method using `/api/attendance/history`
- ✅ Removed deprecated methods

### Updated Hooks
- ✅ `useAttendanceHistory()` - Now uses `getHistory()` and new response format
- ✅ Enhanced documentation with response format examples

### Updated Components
- ✅ `AttendanceHistoryTable` - Simplified to use `attendances` prop only
- ✅ `AttendanceHistoryPage` - Updated to handle new data.pagination structure

### Build Status
```bash
npm run build

> erp@0.0.0 build
> tsc -b && vite build

✓ 259 modules transformed.
dist/index.html                   0.45 kB │ gzip:   0.29 kB
dist/assets/index-BefWij8d.css   37.51 kB │ gzip:   7.46 kB
dist/assets/index-sJuZK3up.js   506.88 kB │ gzip: 148.97 kB
✓ built in 2.29s
```

**Status**: ✅ **No errors**

---

## 🔗 Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall system architecture
- [ATTENDANCE_HISTORY_IMPLEMENTATION.md](./ATTENDANCE_HISTORY_IMPLEMENTATION.md) - Original implementation
- [AUTHENTICATION.md](./AUTHENTICATION.md) - Auth and API access

---

## 🚀 Next Steps

The implementation is **production-ready**. To use:

1. Navigate to `/attendance` route
2. Use filters to refine data (date range, status)
3. View detailed records in modal
4. Pagination for large datasets

**Default page size**: 50 records per page (as per API specification)

**No further action required** unless new features are requested.
