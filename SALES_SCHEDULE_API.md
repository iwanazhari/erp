# Sales Schedule API Documentation

## CRUD Jadwal untuk Role SALES

**Version:** 1.0.0  
**Last Updated:** 2026-03-30  
**Base URL:** `http://localhost:15320/api`

---

## 📋 Overview

Dokumentasi ini mencakup **semua endpoint** untuk Schedule Management yang dapat diakses oleh user dengan role **SALES**.

### Fitur Utama

- ✅ Create jadwal untuk diri sendiri
- ✅ View jadwal sendiri (dengan filter & pagination)
- ✅ Update jadwal yang sudah ada
- ✅ Cancel jadwal dengan alasan
- ✅ Delete jadwal (hanya status PENDING)
- ✅ Cek ketersediaan technician per tanggal

### Role-Based Access

| Role | Create | Read Own | Update Own | Cancel Own | Delete Own |
|------|--------|----------|------------|------------|------------|
| **SALES** | ✅ | ✅ | ✅ | ✅ | ✅ (PENDING only) |
| **ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **HR** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **TECHNICIAN** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **EMPLOYEE** | ❌ | ❌ | ❌ | ❌ | ❌ |

**Note:** Endpoint `/api/sales/schedules` khusus untuk SALES role. Role lain akan mendapat 403 Forbidden.

---

## 🔐 Authentication

**Semua endpoint memerlukan Bearer Token** dengan role SALES:

```http
Authorization: Bearer YOUR_SALES_TOKEN
```

### Contoh Login sebagai SALES

```http
POST /login
Content-Type: application/json

{
  "email": "sales@worksy.com",
  "password": "Sales123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "sales-uuid",
      "name": "Sales User",
      "email": "sales@worksy.com",
      "role": "SALES"
    }
  }
}
```

---

## 📖 Table of Contents

### Create
1. [Create Schedule](#1-create-schedule)

### Read
2. [Get All Schedules](#2-get-all-schedules)
3. [Get Schedule by ID](#3-get-schedule-by-id)
4. [Get Technician Availability](#4-get-technician-availability)

### Update
5. [Update Schedule](#5-update-schedule)

### Delete
6. [Cancel Schedule](#6-cancel-schedule)
7. [Delete Schedule](#7-delete-schedule)

---

## 1. Create Schedule

Endpoint untuk membuat jadwal baru untuk diri sendiri (user dengan role SALES).

### Endpoint
```http
POST /api/sales/schedules
```

### Headers
```http
Authorization: Bearer YOUR_SALES_TOKEN
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `technicianId` | String | **Yes** | ID technician (biasanya ID sendiri) |
| `locationId` | String | No | ID lokasi penugasan |
| `date` | String | **Yes** | Tanggal jadwal (YYYY-MM-DD) |
| `startTime` | String | **Yes** | Waktu mulai (HH:mm) |
| `endTime` | String | **Yes** | Waktu selesai (HH:mm) |
| `description` | String | No | Deskripsi jadwal |
| `notes` | String | No | Catatan tambahan |

### Request Example

```http
POST /api/sales/schedules
Authorization: Bearer SALES_TOKEN
Content-Type: application/json

{
  "technicianId": "sales-uuid-123",
  "locationId": "loc-uuid-456",
  "date": "2026-04-01",
  "startTime": "09:00",
  "endTime": "12:00",
  "description": "Kunjungan sales ke client",
  "notes": "Client tertarik dengan produk A"
}
```

### Response Success (201 Created)

```json
{
  "success": true,
  "message": "Jadwal berhasil dibuat.",
  "data": {
    "id": "schedule-uuid-789",
    "technicianId": "sales-uuid-123",
    "locationId": "loc-uuid-456",
    "date": "2026-04-01T00:00:00.000Z",
    "startTime": "2026-04-01T09:00:00.000Z",
    "endTime": "2026-04-01T12:00:00.000Z",
    "status": "ASSIGNED",
    "description": "Kunjungan sales ke client",
    "notes": "Client tertarik dengan produk A",
    "createdAt": "2026-03-30T16:00:00.000Z",
    "updatedAt": "2026-03-30T16:00:00.000Z",
    "technician": {
      "id": "sales-uuid-123",
      "name": "Sales User",
      "email": "sales@worksy.com",
      "role": "SALES",
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

### Response Error (400 - Bad Request)

**Bentrok dengan jadwal lain:**
```json
{
  "success": false,
  "message": "Jadwal bentrok dengan jadwal yang sudah ada pada waktu tersebut",
  "error": "VALIDATION"
}
```

**Technician tidak ditemukan:**
```json
{
  "success": false,
  "message": "Technician tidak ditemukan",
  "error": "NOT_FOUND"
}
```

### Response Error (403 - Forbidden)

**User bukan SALES:**
```json
{
  "success": false,
  "message": "Akses ditolak. Anda tidak memiliki izin.",
  "error": "FORBIDDEN"
}
```

---

## 2. Get All Schedules

Endpoint untuk mengambil semua jadwal (filtered by current user) dengan pagination dan filters.

### Endpoint
```http
GET /api/sales/schedules
```

### Headers
```http
Authorization: Bearer YOUR_SALES_TOKEN
```

### Query Parameters (Optional)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | 1 | Page number |
| `pageSize` | Integer | 20 | Items per page (max: 100) |
| `technicianId` | String | - | Filter by technician ID (auto-filtered to current user) |
| `locationId` | String | - | Filter by location ID |
| `status` | String | - | Filter by status: `PENDING`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| `dateFrom` | String | - | Filter from date (YYYY-MM-DD) |
| `dateTo` | String | - | Filter to date (YYYY-MM-DD) |
| `search` | String | - | Search by technician name or description |

### Example Request

```http
GET /api/sales/schedules?page=1&pageSize=20&status=ASSIGNED&dateFrom=2026-04-01&dateTo=2026-04-30
Authorization: Bearer SALES_TOKEN
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Daftar jadwal berhasil diambil",
  "data": {
    "schedules": [
      {
        "id": "schedule-uuid-1",
        "technicianId": "sales-uuid-123",
        "locationId": "loc-uuid-456",
        "date": "2026-04-01T00:00:00.000Z",
        "startTime": "2026-04-01T09:00:00.000Z",
        "endTime": "2026-04-01T12:00:00.000Z",
        "status": "ASSIGNED",
        "description": "Kunjungan sales",
        "notes": null,
        "createdAt": "2026-03-30T16:00:00.000Z",
        "technician": {
          "id": "sales-uuid-123",
          "name": "Sales User",
          "email": "sales@worksy.com",
          "role": "SALES",
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
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 50,
      "totalPages": 3
    }
  }
}
```

---

## 3. Get Schedule by ID

Endpoint untuk mengambil detail jadwal berdasarkan ID.

### Endpoint
```http
GET /api/sales/schedules/:id
```

### Headers
```http
Authorization: Bearer YOUR_SALES_TOKEN
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | **Yes** | Schedule ID (UUID) |

### Example Request

```http
GET /api/sales/schedules/schedule-uuid-789
Authorization: Bearer SALES_TOKEN
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Jadwal berhasil diambil",
  "data": {
    "id": "schedule-uuid-789",
    "technicianId": "sales-uuid-123",
    "locationId": "loc-uuid-456",
    "date": "2026-04-01T00:00:00.000Z",
    "startTime": "2026-04-01T09:00:00.000Z",
    "endTime": "2026-04-01T12:00:00.000Z",
    "status": "ASSIGNED",
    "description": "Kunjungan sales",
    "notes": "Client tertarik produk A",
    "createdAt": "2026-03-30T16:00:00.000Z",
    "updatedAt": "2026-03-30T16:00:00.000Z",
    "technician": {
      "id": "sales-uuid-123",
      "name": "Sales User",
      "email": "sales@worksy.com",
      "role": "SALES",
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

---

## 4. Get Technician Availability

Endpoint untuk mengecek ketersediaan technician pada tanggal tertentu.

### Endpoint
```http
GET /api/sales/technicians/:technicianId/availability
```

### Headers
```http
Authorization: Bearer YOUR_SALES_TOKEN
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `technicianId` | String | **Yes** | Technician ID |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | String | **Yes** | Tanggal (YYYY-MM-DD) |

### Example Request

```http
GET /api/sales/technicians/sales-uuid-123/availability?date=2026-04-01
Authorization: Bearer SALES_TOKEN
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Ketersediaan technician berhasil diambil",
  "data": {
    "technician": {
      "id": "sales-uuid-123",
      "name": "Sales User"
    },
    "date": "2026-04-01",
    "workingHours": {
      "start": "08:00",
      "end": "18:00"
    },
    "scheduledCount": 2,
    "availableSlots": [
      {
        "start": "2026-04-01T08:00:00.000Z",
        "end": "2026-04-01T09:00:00.000Z"
      },
      {
        "start": "2026-04-01T12:00:00.000Z",
        "end": "2026-04-01T14:00:00.000Z"
      }
    ],
    "isFullyBooked": false
  }
}
```

---

## 5. Update Schedule

Endpoint untuk mengupdate jadwal yang sudah ada.

### Endpoint
```http
PATCH /api/sales/schedules/:id
```

### Headers
```http
Authorization: Bearer YOUR_SALES_TOKEN
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | **Yes** | Schedule ID |

### Request Body (All Optional)

| Field | Type | Description |
|-------|------|-------------|
| `startTime` | String | Waktu mulai baru (HH:mm) |
| `endTime` | String | Waktu selesai baru (HH:mm) |
| `description` | String | Deskripsi baru |
| `notes` | String | Catatan baru |
| `locationId` | String | ID lokasi baru |

### Example Request

```http
PATCH /api/sales/schedules/schedule-uuid-789
Authorization: Bearer SALES_TOKEN
Content-Type: application/json

{
  "startTime": "10:00",
  "endTime": "13:00",
  "description": "Updated - Kunjungan sales + presentasi"
}
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Jadwal berhasil diupdate.",
  "data": {
    "id": "schedule-uuid-789",
    "technicianId": "sales-uuid-123",
    "startTime": "2026-04-01T10:00:00.000Z",
    "endTime": "2026-04-01T13:00:00.000Z",
    "description": "Updated - Kunjungan sales + presentasi",
    "status": "ASSIGNED",
    "updatedAt": "2026-03-30T16:30:00.000Z"
  }
}
```

### Response Error (400 - Bad Request)

**Jadwal sudah dibatalkan:**
```json
{
  "success": false,
  "message": "Tidak dapat mengupdate jadwal yang sudah dibatalkan",
  "error": "VALIDATION"
}
```

**Bentrok jadwal:**
```json
{
  "success": false,
  "message": "Jadwal bentrok dengan jadwal yang sudah ada",
  "error": "VALIDATION"
}
```

---

## 6. Cancel Schedule

Endpoint untuk membatalkan jadwal.

### Endpoint
```http
PATCH /api/sales/schedules/:id/cancel
```

### Headers
```http
Authorization: Bearer YOUR_SALES_TOKEN
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | **Yes** | Schedule ID |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | String | No | Alasan pembatalan |

### Example Request

```http
PATCH /api/sales/schedules/schedule-uuid-789/cancel
Authorization: Bearer SALES_TOKEN
Content-Type: application/json

{
  "reason": "Customer meminta pembatalan"
}
```

### Response Success (200)

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

---

## 7. Delete Schedule

Endpoint untuk menghapus jadwal (hanya status PENDING).

### Endpoint
```http
DELETE /api/sales/schedules/:id
```

### Headers
```http
Authorization: Bearer YOUR_SALES_TOKEN
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | **Yes** | Schedule ID |

### Example Request

```http
DELETE /api/sales/schedules/schedule-uuid-789
Authorization: Bearer SALES_TOKEN
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Jadwal berhasil dihapus.",
  "data": {
    "id": "schedule-uuid-789",
    "deleted": true
  }
}
```

### Response Error (400 - Bad Request)

**Hanya PENDING yang bisa dihapus:**
```json
{
  "success": false,
  "message": "Hanya jadwal dengan status PENDING yang dapat dihapus",
  "error": "VALIDATION"
}
```

---

## 🎨 Schedule Status Flow

```
PENDING → ASSIGNED → IN_PROGRESS → COMPLETED
    ↓
CANCELLED
```

### Status Descriptions

| Status | Description | Can Edit | Can Cancel | Can Delete |
|--------|-------------|----------|------------|------------|
| `PENDING` | Jadwal baru dibuat | ✅ | ✅ | ✅ |
| `ASSIGNED` | Sudah diassign ke technician | ✅ | ✅ | ❌ |
| `IN_PROGRESS` | Technician sedang mengerjakan | ❌ | ❌ | ❌ |
| `COMPLETED` | Pekerjaan selesai | ❌ | ❌ | ❌ |
| `CANCELLED` | Jadwal dibatalkan | ❌ | ❌ | ❌ |

---

## 🔒 Permissions Matrix

| Action | SALES | ADMIN | HR | TECHNICIAN | EMPLOYEE |
|--------|-------|-------|----|------------|----------|
| Create Schedule | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Own Schedules | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Schedule Detail | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update Own Schedule | ✅ | ✅ | ✅ | ❌ | ❌ |
| Cancel Own Schedule | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete Own Schedule (PENDING) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Check Availability | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 📊 Error Handling

### Common Error Codes

| HTTP Code | Error | Description |
|-----------|-------|-------------|
| 200 | Success | Request berhasil |
| 201 | Created | Schedule berhasil dibuat |
| 400 | Bad Request | Validasi gagal |
| 401 | Unauthorized | Token tidak valid/expired |
| 403 | Forbidden | User bukan SALES role |
| 404 | Not Found | Schedule/Technician tidak ditemukan |
| 500 | Internal Server Error | Server error |

---

## 🧪 Testing with cURL

### Test Create Schedule

```bash
curl -X POST http://localhost:15320/api/sales/schedules \
  -H "Authorization: Bearer YOUR_SALES_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "technicianId": "sales-uuid",
    "date": "2026-04-01",
    "startTime": "09:00",
    "endTime": "12:00",
    "description": "Test schedule"
  }'
```

### Test Get All Schedules

```bash
curl -X GET "http://localhost:15320/api/sales/schedules?page=1&pageSize=20" \
  -H "Authorization: Bearer YOUR_SALES_TOKEN"
```

### Test Get Technician Availability

```bash
curl -X GET "http://localhost:15320/api/sales/technicians/sales-uuid/availability?date=2026-04-01" \
  -H "Authorization: Bearer YOUR_SALES_TOKEN"
```

### Test Cancel Schedule

```bash
curl -X PATCH http://localhost:15320/api/sales/schedules/schedule-uuid/cancel \
  -H "Authorization: Bearer YOUR_SALES_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Customer request"
  }'
```

---

## 📞 Support

For questions or issues:
- **Backend Team:** backend@worksy.com
- **API Documentation:** docs@worksy.com

---

**Last Updated:** March 30, 2026  
**Version:** 1.0.0

**Happy Coding! 🚀**
