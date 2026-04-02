# Backend API Documentation - Custom Holidays

## Overview
API untuk mengelola hari libur custom yang ditambahkan oleh user. Data tersimpan di database dan dapat diakses dari berbagai device.

---

## Database Schema

### Table: `custom_holidays`

```sql
CREATE TABLE custom_holidays (
  id VARCHAR(36) PRIMARY KEY,          -- UUID
  user_id VARCHAR(36) NOT NULL,         -- Reference to users table
  company_id VARCHAR(36),               -- Reference to companies table (optional)
  
  date DATE NOT NULL,                   -- Tanggal hari libur
  name VARCHAR(255) NOT NULL,           -- Nama hari libur
  name_id VARCHAR(255),                 -- Nama dalam Bahasa Indonesia
  description TEXT NOT NULL,            -- Alasan/deskripsi
  description_id TEXT,                  -- Deskripsi dalam Bahasa Indonesia
  
  type ENUM('Cuti Bersama', 'Libur Perusahaan', 'Libur Lainnya') NOT NULL,
  
  is_active BOOLEAN DEFAULT TRUE,       -- Status aktif/non-aktif
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,            -- Soft delete
  
  INDEX idx_date (date),
  INDEX idx_user_id (user_id),
  INDEX idx_company_id (company_id),
  INDEX idx_type (type),
  INDEX idx_is_active (is_active),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);
```

---

## API Endpoints

### Base URL
```
https://your-api-url.com/api
```

### Authentication
Semua endpoint memerlukan **Bearer Token** di header:
```
Authorization: Bearer <access_token>
```

---

## 1. Get All Custom Holidays

**Endpoint:** `GET /api/custom-holidays`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| year | number | No | Filter berdasarkan tahun (contoh: 2026) |
| month | number | No | Filter berdasarkan bulan (1-12) |
| type | string | No | Filter berdasarkan tipe |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 50) |

**Request Example:**
```http
GET /api/custom-holidays?year=2026&page=1&limit=50
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Custom holidays retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "user-123",
      "company_id": "company-456",
      "date": "2026-05-01",
      "name": "Cuti Bersama Lebaran",
      "name_id": "Cuti Bersama Lebaran",
      "description": "Mengganti tanggal libur yang jatuh pada akhir pekan",
      "description_id": "Mengganti tanggal libur yang jatuh pada akhir pekan",
      "type": "Cuti Bersama",
      "is_active": true,
      "created_at": "2026-03-15T10:30:00.000Z",
      "updated_at": "2026-03-15T10:30:00.000Z",
      "deleted_at": null,
      "user": {
        "id": "user-123",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## 2. Get Custom Holiday by ID

**Endpoint:** `GET /api/custom-holidays/:id`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | UUID custom holiday |

**Request Example:**
```http
GET /api/custom-holidays/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Custom holiday retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-123",
    "company_id": "company-456",
    "date": "2026-05-01",
    "name": "Cuti Bersama Lebaran",
    "name_id": "Cuti Bersama Lebaran",
    "description": "Mengganti tanggal libur yang jatuh pada akhir pekan",
    "description_id": "Mengganti tanggal libur yang jatuh pada akhir pekan",
    "type": "Cuti Bersama",
    "is_active": true,
    "created_at": "2026-03-15T10:30:00.000Z",
    "updated_at": "2026-03-15T10:30:00.000Z",
    "deleted_at": null
  }
}
```

**Response Not Found (404):**
```json
{
  "success": false,
  "message": "Custom holiday not found"
}
```

---

## 3. Create Custom Holiday

**Endpoint:** `POST /api/custom-holidays`

**Request Body:**
```json
{
  "date": "2026-05-01",
  "name": "Cuti Bersama Lebaran",
  "name_id": "Cuti Bersama Lebaran",
  "description": "Mengganti tanggal libur yang jatuh pada akhir pekan",
  "description_id": "Mengganti tanggal libur yang jatuh pada akhir pekan",
  "type": "Cuti Bersama"
}
```

**Validation Rules:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| date | string | Yes | ISO 8601 format (YYYY-MM-DD), must be future date |
| name | string | Yes | Min 3 characters, max 255 characters |
| name_id | string | No | Max 255 characters |
| description | string | Yes | Min 10 characters, max 1000 characters |
| description_id | string | No | Max 1000 characters |
| type | string | Yes | Must be one of: 'Cuti Bersama', 'Libur Perusahaan', 'Libur Lainnya' |

**Request Example:**
```http
POST /api/custom-holidays
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "date": "2026-05-01",
  "name": "Cuti Bersama Lebaran",
  "name_id": "Cuti Bersama Lebaran",
  "description": "Mengganti tanggal libur yang jatuh pada akhir pekan",
  "description_id": "Mengganti tanggal libur yang jatuh pada akhir pekan",
  "type": "Cuti Bersama"
}
```

**Response Success (201 Created):**
```json
{
  "success": true,
  "message": "Custom holiday created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-123",
    "company_id": "company-456",
    "date": "2026-05-01",
    "name": "Cuti Bersama Lebaran",
    "name_id": "Cuti Bersama Lebaran",
    "description": "Mengganti tanggal libur yang jatuh pada akhir pekan",
    "description_id": "Mengganti tanggal libur yang jatuh pada akhir pekan",
    "type": "Cuti Bersama",
    "is_active": true,
    "created_at": "2026-03-15T10:30:00.000Z",
    "updated_at": "2026-03-15T10:30:00.000Z",
    "deleted_at": null
  }
}
```

**Response Validation Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "date": ["Date must be a future date"],
    "name": ["Name must be at least 3 characters"],
    "description": ["Description is required"],
    "type": ["Invalid type. Must be one of: Cuti Bersama, Libur Perusahaan, Libur Lainnya"]
  }
}
```

**Response Duplicate Date (409 Conflict):**
```json
{
  "success": false,
  "message": "Custom holiday for this date already exists"
}
```

---

## 4. Update Custom Holiday

**Endpoint:** `PUT /api/custom-holidays/:id`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | UUID custom holiday |

**Request Body (all fields optional):**
```json
{
  "date": "2026-05-02",
  "name": "Cuti Bersama Lebaran (Updated)",
  "name_id": "Cuti Bersama Lebaran (Updated)",
  "description": "Update alasan libur",
  "description_id": "Update alasan libur",
  "type": "Libur Perusahaan"
}
```

**Request Example:**
```http
PUT /api/custom-holidays/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "date": "2026-05-02",
  "name": "Cuti Bersama Lebaran (Updated)",
  "description": "Update alasan libur"
}
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Custom holiday updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-123",
    "company_id": "company-456",
    "date": "2026-05-02",
    "name": "Cuti Bersama Lebaran (Updated)",
    "name_id": "Cuti Bersama Lebaran (Updated)",
    "description": "Update alasan libur",
    "description_id": "Update alasan libur",
    "type": "Libur Perusahaan",
    "is_active": true,
    "created_at": "2026-03-15T10:30:00.000Z",
    "updated_at": "2026-03-16T14:20:00.000Z",
    "deleted_at": null
  }
}
```

**Response Not Found (404):**
```json
{
  "success": false,
  "message": "Custom holiday not found"
}
```

**Response Unauthorized (403 Forbidden):**
```json
{
  "success": false,
  "message": "You don't have permission to update this custom holiday"
}
```

---

## 5. Delete Custom Holiday

**Endpoint:** `DELETE /api/custom-holidays/:id`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | UUID custom holiday |

**Request Example:**
```http
DELETE /api/custom-holidays/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Custom holiday deleted successfully"
}
```

**Response Not Found (404):**
```json
{
  "success": false,
  "message": "Custom holiday not found"
}
```

**Response Unauthorized (403 Forbidden):**
```json
{
  "success": false,
  "message": "You don't have permission to delete this custom holiday"
}
```

---

## 6. Bulk Create Custom Holidays (Optional)

**Endpoint:** `POST /api/custom-holidays/bulk`

**Request Body:**
```json
{
  "holidays": [
    {
      "date": "2026-05-01",
      "name": "Cuti Bersama 1",
      "description": "Alasan 1",
      "type": "Cuti Bersama"
    },
    {
      "date": "2026-05-02",
      "name": "Cuti Bersama 2",
      "description": "Alasan 2",
      "type": "Libur Perusahaan"
    }
  ]
}
```

**Response Success (201 Created):**
```json
{
  "success": true,
  "message": "Custom holidays created successfully",
  "data": {
    "created": [...],
    "failed": [],
    "summary": {
      "total": 2,
      "created": 2,
      "failed": 0
    }
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - User doesn't have permission |
| 404 | Not Found - Custom holiday not found |
| 409 | Conflict - Duplicate date |
| 500 | Internal Server Error |

---

## Business Logic Requirements

### 1. **Authorization Rules**
- User dapat melihat semua custom holidays (atau filter by company_id)
- User hanya bisa **edit/delete** custom holiday yang mereka buat sendiri
- Admin/HR dapat edit/delete semua custom holidays di company mereka

### 2. **Validation Rules**
- Date harus format ISO 8601 (YYYY-MM-DD)
- Date minimal hari ini (tidak boleh tanggal yang sudah lewat)
- Name minimal 3 karakter
- Description minimal 10 karakter (untuk memastikan alasan yang jelas)
- Type harus salah satu dari: 'Cuti Bersama', 'Libur Perusahaan', 'Libur Lainnya'
- Tidak boleh ada duplicate date untuk custom holiday yang sama

### 3. **Soft Delete**
- Delete menggunakan `deleted_at` timestamp (soft delete)
- Data dengan `deleted_at != NULL` tidak ditampilkan di GET
- Hard delete hanya untuk admin super

### 4. **Auto-populate Fields**
- `user_id` otomatis dari authenticated user
- `company_id` otomatis dari user's company (jika ada)
- `name_id` = `name` (default, bisa dioverride)
- `description_id` = `description` (default, bisa dioverride)

---

## Example Implementation (Node.js/Express)

### Controller Example

```javascript
// controllers/customHolidayController.js

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

exports.getAllCustomHolidays = async (req, res) => {
  try {
    const { year, month, type, page = 1, limit = 50 } = req.query;
    const user = req.user; // From auth middleware
    
    let query = `
      SELECT ch.*, u.name as user_name, u.email as user_email
      FROM custom_holidays ch
      LEFT JOIN users u ON ch.user_id = u.id
      WHERE ch.deleted_at IS NULL
    `;
    
    const params = [];
    
    // Filter by company (if user has company_id)
    if (user.company_id) {
      query += ` AND (ch.company_id = ? OR ch.company_id IS NULL)`;
      params.push(user.company_id);
    }
    
    // Filter by year
    if (year) {
      query += ` AND YEAR(ch.date) = ?`;
      params.push(year);
    }
    
    // Filter by month
    if (month) {
      query += ` AND MONTH(ch.date) = ?`;
      params.push(month);
    }
    
    // Filter by type
    if (type) {
      query += ` AND ch.type = ?`;
      params.push(type);
    }
    
    // Pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY ch.date ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const [holidays] = await db.query(query, params);
    
    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM custom_holidays WHERE deleted_at IS NULL`,
      user.company_id ? [user.company_id] : []
    );
    
    res.json({
      success: true,
      message: 'Custom holidays retrieved successfully',
      data: holidays,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get all custom holidays error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve custom holidays'
    });
  }
};

exports.createCustomHoliday = async (req, res) => {
  try {
    const { date, name, name_id, description, description_id, type } = req.body;
    const user = req.user;
    
    // Validation
    if (!date || !name || !description || !type) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: {
          date: !date && ['Date is required'],
          name: !name && ['Name is required'],
          description: !description && ['Description is required'],
          type: !type && ['Type is required']
        }
      });
    }
    
    // Check if date already exists
    const [existing] = await db.query(
      `SELECT id FROM custom_holidays WHERE date = ? AND deleted_at IS NULL`,
      [date]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Custom holiday for this date already exists'
      });
    }
    
    const id = uuidv4();
    
    await db.query(
      `INSERT INTO custom_holidays 
       (id, user_id, company_id, date, name, name_id, description, description_id, type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        user.id,
        user.company_id || null,
        date,
        name,
        name_id || name,
        description,
        description_id || description,
        type
      ]
    );
    
    res.status(201).json({
      success: true,
      message: 'Custom holiday created successfully',
      data: {
        id,
        user_id: user.id,
        company_id: user.company_id,
        date,
        name,
        name_id: name_id || name,
        description,
        description_id: description_id || description,
        type,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      }
    });
  } catch (error) {
    console.error('Create custom holiday error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create custom holiday'
    });
  }
};

exports.deleteCustomHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Check if holiday exists and user has permission
    const [holiday] = await db.query(
      `SELECT * FROM custom_holidays WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    
    if (holiday.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Custom holiday not found'
      });
    }
    
    // Check permission (owner or admin)
    const isOwner = holiday[0].user_id === user.id;
    const isAdmin = ['admin', 'hr'].includes(user.role);
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You don\'t have permission to delete this custom holiday'
      });
    }
    
    // Soft delete
    await db.query(
      `UPDATE custom_holidays SET deleted_at = NOW() WHERE id = ?`,
      [id]
    );
    
    res.json({
      success: true,
      message: 'Custom holiday deleted successfully'
    });
  } catch (error) {
    console.error('Delete custom holiday error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete custom holiday'
    });
  }
};
```

### Routes Example

```javascript
// routes/customHolidays.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const customHolidayController = require('../controllers/customHolidayController');

// All routes require authentication
router.use(authMiddleware);

router.get('/', customHolidayController.getAllCustomHolidays);
router.get('/:id', customHolidayController.getCustomHolidayById);
router.post('/', customHolidayController.createCustomHoliday);
router.put('/:id', customHolidayController.updateCustomHoliday);
router.delete('/:id', customHolidayController.deleteCustomHoliday);
router.post('/bulk', customHolidayController.bulkCreateCustomHolidays);

module.exports = router;
```

```javascript
// app.js or index.js

const customHolidayRoutes = require('./routes/customHolidays');

app.use('/api/custom-holidays', customHolidayRoutes);
```

---

## Testing with cURL

### Create Custom Holiday
```bash
curl -X POST https://your-api.com/api/custom-holidays \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "date": "2026-05-01",
    "name": "Cuti Bersama Lebaran",
    "description": "Mengganti tanggal libur yang jatuh pada akhir pekan",
    "type": "Cuti Bersama"
  }'
```

### Get All Custom Holidays
```bash
curl -X GET "https://your-api.com/api/custom-holidays?year=2026" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete Custom Holiday
```bash
curl -X DELETE https://your-api.com/api/custom-holidays/HOLIDAY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Checklist Implementation Backend

- [ ] Create database table `custom_holidays`
- [ ] Create model/entity for CustomHoliday
- [ ] Create controller with CRUD operations
- [ ] Create routes with authentication middleware
- [ ] Implement validation (date, name, description, type)
- [ ] Implement authorization (owner check, admin check)
- [ ] Implement soft delete
- [ ] Add pagination support
- [ ] Add filtering (year, month, type)
- [ ] Add duplicate date check
- [ ] Auto-populate user_id, company_id
- [ ] Error handling
- [ ] Unit tests
- [ ] Integration tests
- [ ] API documentation (Swagger/OpenAPI)

---

## Notes

1. **Timezone**: Pastikan backend menggunakan timezone yang sama dengan frontend (Asia/Jakarta)
2. **Date Format**: Selalu gunakan ISO 8601 format (YYYY-MM-DD) untuk konsistensi
3. **Security**: Implementasi rate limiting untuk mencegah abuse
4. **Caching**: Pertimbangkan caching untuk GET requests (Redis/Memcached)
5. **Audit Log**: Tambahkan audit log untuk tracking perubahan (optional)
