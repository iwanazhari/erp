# Schedule API Endpoints - Backend Reference

This document maps all schedule-related endpoints from the backend to the frontend implementation.

## Base URL
```
Development: http://localhost:15320/api
Production: https://your-production-url.com/api
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <access-token>
```

---

## 📍 Location Management Endpoints

### 1. Create Location
**Endpoint:** `POST /api/locations`

**Roles:** `ADMIN`, `HR`, `MANAGER`

**Request Body:**
```json
{
  "name": "string (required, 1-255)",
  "address": "string (required, 1-500)",
  "latitude": "number (required, -90 to 90)",
  "longitude": "number (required, -180 to 180)",
  "radius": "number (optional, 10-1000, default: 50)",
  "description": "string (optional, max 1000)",
  "companyId": "uuid (optional)",
  "officeId": "uuid (optional)",
  "isActive": "boolean (optional, default: true)"
}
```

**Frontend Function:** `locationApi.create()`

---

### 2. List Locations
**Endpoint:** `GET /api/locations`

**Roles:** All authenticated users

**Query Parameters:**
- `companyId` (uuid, optional)
- `officeId` (uuid, optional)
- `isActive` (boolean, optional)
- `page` (integer, optional, default: 1)
- `limit` (integer, optional, default: 20)

**Frontend Function:** `locationApi.getAll()`

---

### 3. Get Location by ID
**Endpoint:** `GET /api/locations/:locationId`

**Roles:** All authenticated users

**Frontend Function:** `locationApi.getById()`

---

### 4. Update Location
**Endpoint:** `PATCH /api/locations/:locationId`

**Roles:** `ADMIN`, `HR`, `MANAGER`

**Request Body:** All fields optional

**Frontend Function:** `locationApi.update()`

---

### 5. Delete Location
**Endpoint:** `DELETE /api/locations/:locationId`

**Roles:** `ADMIN` only

**Frontend Function:** `locationApi.delete()`

---

## 📅 Schedule Management Endpoints

### 1. Create Schedule
**Endpoint:** `POST /api/schedules`

**Roles:** `ADMIN`, `HR`, `MANAGER`

**Request Body:**
```json
{
  "technicianId": "uuid (required)",
  "locationId": "uuid (required)",
  "date": "ISO 8601 datetime (required)",
  "startTime": "ISO 8601 datetime (required)",
  "endTime": "ISO 8601 datetime (required)",
  "description": "string (optional, max 1000)",
  "notes": "string (optional, max 1000)",
  "companyId": "uuid (optional)"
}
```

**Validation Rules:**
- Technician must have role `TECHNICIAN` or `TECHNICIAN_PAYMENT`
- Date cannot be in the past
- Minimum duration: 30 minutes
- Maximum duration: 8 hours
- No overlapping schedules on the same date
- Maximum 3 different locations per day per technician

**Frontend Function:** `scheduleApi.create()`

---

### 2. List Schedules
**Endpoint:** `GET /api/schedules`

**Roles:** All authenticated users

**Query Parameters:**
- `technicianId` (uuid, optional)
- `locationId` (uuid, optional)
- `status` (string, optional): PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
- `dateFrom` (datetime, optional)
- `dateTo` (datetime, optional)
- `page` (integer, optional, default: 1)
- `limit` (integer, optional, default: 20)

**Frontend Function:** `scheduleApi.getAll()`

---

### 3. Get Schedule by ID
**Endpoint:** `GET /api/schedules/:scheduleId`

**Roles:** All authenticated users

**Frontend Function:** `scheduleApi.getById()`

---

### 4. Update Schedule
**Endpoint:** `PATCH /api/schedules/:scheduleId`

**Roles:** `ADMIN`, `HR`, `MANAGER`

**Request Body:** All fields optional

**Frontend Function:** `scheduleApi.update()`

---

### 5. Cancel Schedule
**Endpoint:** `POST /api/schedules/:scheduleId/cancel`

**Roles:** `ADMIN`, `HR`, `MANAGER`

**Frontend Function:** `scheduleApi.cancel()`

---

### 6. Delete Schedule
**Endpoint:** `DELETE /api/schedules/:scheduleId`

**Roles:** `ADMIN` only

**Frontend Function:** `scheduleApi.delete()`

---

## 📦 Bulk Operations

### Bulk Create Schedules
**Endpoint:** `POST /api/schedules/bulk`

**Roles:** `ADMIN`, `HR`, `MANAGER`

**Request Body:**
```json
{
  "schedules": [
    {
      "technicianId": "uuid",
      "locationId": "uuid",
      "date": "ISO 8601",
      "startTime": "ISO 8601",
      "endTime": "ISO 8601",
      "description": "string",
      "notes": "string"
    }
    // ... max 50 items
  ]
}
```

**Response:** Returns 201 or 207 (Partial Success)

**Frontend Function:** `scheduleApi.bulkCreate()`

---

## ⏰ Availability Check

### Check Technician Availability
**Endpoint:** `GET /api/schedules/availability/:technicianId/:date`

**Roles:** All authenticated users

**Path Parameters:**
- `technicianId` (uuid): Technician ID
- `date` (string): Date in YYYY-MM-DD format

**Example:**
```
GET /api/schedules/availability/tech-123/2026-02-25
```

**Frontend Function:** `scheduleApi.checkAvailability()`

---

## 🔍 Additional Query Endpoints

### Get Schedules by Technician
**Endpoint:** `GET /api/schedules/technician/:technicianId`

**Roles:** All authenticated users

**Frontend Function:** `scheduleApi.getTechnicianSchedules()`

---

### Get Schedules by Location
**Endpoint:** `GET /api/schedules/location/:locationId`

**Roles:** All authenticated users

**Frontend Function:** `scheduleApi.getLocationSchedules()`

---

## 🧑‍🔧 Technician Tracking Endpoints

### Update Technician Location
**Endpoint:** `POST /api/technician/location`

**Roles:** `TECHNICIAN`, `TECHNICIAN_PAYMENT`

**Request Body:**
```json
{
  "latitude": "number (required)",
  "longitude": "number (required)",
  "accuracy": "number (optional, meters)"
}
```

**Note:** This endpoint is for real-time location tracking of technicians in the field.

---

### Get Technician Status
**Endpoint:** `GET /api/technician/status`

**Roles:** `TECHNICIAN`, `TECHNICIAN_PAYMENT`

**Description:** Get current status of the authenticated technician

---

### Get Location History
**Endpoint:** `GET /api/technician/location-history`

**Roles:** `TECHNICIAN`, `TECHNICIAN_PAYMENT`

**Description:** Get location history of the authenticated technician

---

## 📊 Error Responses

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Invalid/missing token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `TECHNICIAN_NOT_FOUND` | 404 | Technician doesn't exist |
| `LOCATION_NOT_FOUND` | 404 | Location doesn't exist |
| `SCHEDULE_NOT_FOUND` | 404 | Schedule doesn't exist |
| `SCHEDULE_TIME_OVERLAP` | 409 | Time conflict |
| `TECHNICIAN_DAILY_QUOTA_EXCEEDED` | 409 | Max 3 locations/day |
| `SCHEDULE_ALREADY_EXISTS` | 409 | Duplicate schedule |
| `PAST_SCHEDULE_NOT_ALLOWED` | 409 | Date in the past |
| `SCHEDULE_DURATION_TOO_SHORT` | 409 | < 30 minutes |
| `SCHEDULE_DURATION_TOO_LONG` | 409 | > 8 hours |
| `INVALID_TECHNICIAN_ROLE` | 409 | Not a technician |
| `SCHEDULE_CANNOT_BE_CANCELLED` | 400 | Already completed |
| `SCHEDULE_CANNOT_BE_MODIFIED` | 400 | Already completed |
| `LOCATION_HAS_ACTIVE_SCHEDULES` | 409 | Can't delete location |

### Error Response Format
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

## 🔐 Role-Based Access Control

| Endpoint | ADMIN | HR | MANAGER | TECHNICIAN | TECHNICIAN_PAYMENT |
|----------|-------|----|---------|------------|-------------------|
| **Locations** |||||
| POST /locations | ✅ | ✅ | ✅ | ❌ | ❌ |
| GET /locations | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /locations/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| PATCH /locations/:id | ✅ | ✅ | ✅ | ❌ | ❌ |
| DELETE /locations/:id | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Schedules** |||||
| POST /schedules | ✅ | ✅ | ✅ | ❌ | ❌ |
| GET /schedules | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /schedules/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| PATCH /schedules/:id | ✅ | ✅ | ✅ | ❌ | ❌ |
| POST /schedules/:id/cancel | ✅ | ✅ | ✅ | ❌ | ❌ |
| DELETE /schedules/:id | ✅ | ❌ | ❌ | ❌ | ❌ |
| POST /schedules/bulk | ✅ | ✅ | ✅ | ❌ | ❌ |
| GET /schedules/availability/:id/:date | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /schedules/technician/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /schedules/location/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Technician Tracking** |||||
| POST /technician/location | ❌ | ❌ | ❌ | ✅ | ✅ |
| GET /technician/status | ❌ | ❌ | ❌ | ✅ | ✅ |
| GET /technician/location-history | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 📝 Frontend Integration Example

```typescript
import { scheduleApi, locationApi } from '@/services/scheduleApi';

// Create a location
const location = await locationApi.create({
  name: 'Office Jakarta',
  address: 'Jl. Sudirman No. 1',
  latitude: -6.2088,
  longitude: 106.8456,
  radius: 100,
});

// Create a schedule
const schedule = await scheduleApi.create({
  technicianId: 'tech-123',
  locationId: location.data.id,
  date: '2026-02-25T00:00:00.000Z',
  startTime: '2026-02-25T08:00:00.000Z',
  endTime: '2026-02-25T12:00:00.000Z',
  description: 'Installation work',
});

// Check availability
const availability = await scheduleApi.checkAvailability(
  'tech-123',
  '2026-02-25'
);

// List schedules with filters
const schedules = await scheduleApi.getAll({
  technicianId: 'tech-123',
  dateFrom: '2026-02-01',
  dateTo: '2026-02-28',
  page: 1,
  limit: 20,
});

// Cancel a schedule
await scheduleApi.cancel(schedule.data.id);

// Bulk create
const bulkResult = await scheduleApi.bulkCreate([
  { /* schedule 1 */ },
  { /* schedule 2 */ },
]);
```

---

**Last Updated:** 2026-02-27  
**Backend Version:** 1.0.0  
**Frontend Version:** 1.0.0
