# Custom Holidays - Frontend Integration Guide

## 📋 Overview

API Custom Holidays memungkinkan tim frontend untuk mengelola hari libur custom perusahaan. User dapat menambah, melihat, mengedit, dan menghapus hari libur custom yang akan tersinkronisasi di semua device.

---

## 🔐 Authentication

Semua request memerlukan **Bearer Token** di header:

```http
Authorization: Bearer <access_token>
```

Token didapatkan dari login endpoint dan expired sesuai konfigurasi (default: 24 jam).

---

## 📡 Base URL

### Development
```
http://localhost:15320/api
```

### Production
```
https://your-production-url.com/api
```

---

## 🗂️ Data Models

### TypeScript Interface

```typescript
// types/custom-holiday.ts

export type CustomHolidayType = 'Cuti Bersama' | 'Libur Perusahaan' | 'Libur Lainnya';

export interface CustomHoliday {
  id: string;
  user_id: string;
  company_id: string | null;
  date: string; // ISO 8601 date (YYYY-MM-DD)
  name: string;
  name_id: string | null;
  description: string;
  description_id: string | null;
  type: CustomHolidayType;
  is_active: boolean;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
  deleted_at: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  company?: {
    id: string;
    name: string;
  };
}

export interface CustomHolidayResponse {
  success: boolean;
  message: string;
  data: CustomHoliday | CustomHolidayList | null;
  pagination?: PaginationInfo;
}

export interface CustomHolidayList {
  holidays: CustomHoliday[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateCustomHolidayInputFull {
  date: string; // YYYY-MM-DD
  name: string;
  name_id: string;
  description: string;
  description_id: string;
  type: CustomHolidayType;
}

export interface UpdateCustomHolidayInput {
  date?: string; // YYYY-MM-DD
  name?: string;
  name_id?: string;
  description?: string;
  description_id?: string;
  type?: CustomHolidayType;
}

export interface GetHolidaysFilters {
  year?: number;
  month?: number;
  type?: CustomHolidayType;
  page?: number;
  limit?: number;
}
```

---

## 🛠️ API Endpoints

### 1. Get All Custom Holidays

**Endpoint:** `GET /api/custom-holidays`

**Query Parameters:**

| Parameter | Type    | Required | Default | Description                    |
|-----------|---------|----------|---------|--------------------------------|
| year      | number  | No       | -       | Filter tahun (contoh: 2026)    |
| month     | number  | No       | -       | Filter bulan (1-12)            |
| type      | string  | No       | -       | Filter tipe holiday            |
| page      | number  | No       | 1       | Page number                    |
| limit     | number  | No       | 50      | Items per page (max: 100)      |

**Example Request:**
```typescript
// Using fetch
const response = await fetch('http://localhost:15320/api/custom-holidays?year=2026&page=1&limit=50', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});

const result = await response.json();
```

**Success Response (200 OK):**
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
      },
      "company": {
        "id": "company-456",
        "name": "PT Example Corp"
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

### 2. Get Custom Holiday by ID

**Endpoint:** `GET /api/custom-holidays/:id`

**Path Parameters:**
| Parameter | Type   | Required | Description          |
|-----------|--------|----------|----------------------|
| id        | string | Yes      | UUID custom holiday  |

**Example Request:**
```typescript
const holidayId = '550e8400-e29b-41d4-a716-446655440000';

const response = await fetch(`http://localhost:15320/api/custom-holidays/${holidayId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});

const result = await response.json();
```

**Success Response (200 OK):**
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
    "type": "Cuti Bersama",
    ...
  }
}
```

---

### 3. Create Custom Holiday

**Endpoint:** `POST /api/custom-holidays`

**Request Body:**
```typescript
const payload = {
  date: '2026-05-01', // Required: YYYY-MM-DD
  name: 'Cuti Bersama Lebaran', // Required: 3-255 chars
  name_id: 'Cuti Bersama Lebaran', // Required: defaults to name
  description: 'Mengganti tanggal libur yang jatuh pada akhir pekan', // Required: 10-1000 chars
  description_id: 'Mengganti tanggal libur yang jatuh pada akhir pekan', // Required: defaults to description
  type: 'Cuti Bersama', // Required: Cuti Bersama | Libur Perusahaan | Libur Lainnya
};
```

**Example Request:**
```typescript
const response = await fetch('http://localhost:15320/api/custom-holidays', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});

const result = await response.json();

if (!response.ok) {
  throw new Error(result.message || 'Failed to create custom holiday');
}
```

**Success Response (201 Created):**
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

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "date": ["Date is required"],
    "name": ["Name must be at least 3 characters"],
    "description": ["Description is required"],
    "type": ["Type is required"]
  }
}
```

**Error Response (409 Conflict - Duplicate Date):**
```json
{
  "success": false,
  "message": "Custom holiday for this date already exists"
}
```

---

### 4. Update Custom Holiday

**Endpoint:** `PUT /api/custom-holidays/:id`

**Path Parameters:**
| Parameter | Type   | Required | Description          |
|-----------|--------|----------|----------------------|
| id        | string | Yes      | UUID custom holiday  |

**Request Body (All Fields Optional):**
```typescript
const payload = {
  date: '2026-05-02', // Optional
  name: 'Cuti Bersama Lebaran (Updated)', // Optional
  name_id: 'Cuti Bersama Lebaran (Updated)', // Optional
  description: 'Update alasan libur', // Optional
  description_id: 'Update alasan libur', // Optional
  type: 'Libur Perusahaan', // Optional
};
```

**Example Request:**
```typescript
const holidayId = '550e8400-e29b-41d4-a716-446655440000';

const response = await fetch(`http://localhost:15320/api/custom-holidays/${holidayId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});

const result = await response.json();
```

**Success Response (200 OK):**
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

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "You don't have permission to update this custom holiday"
}
```

---

### 5. Delete Custom Holiday

**Endpoint:** `DELETE /api/custom-holidays/:id`

**Path Parameters:**
| Parameter | Type   | Required | Description          |
|-----------|--------|----------|----------------------|
| id        | string | Yes      | UUID custom holiday  |

**Example Request:**
```typescript
const holidayId = '550e8400-e29b-41d4-a716-446655440000';

const response = await fetch(`http://localhost:15320/api/custom-holidays/${holidayId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});

const result = await response.json();
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Custom holiday deleted successfully"
}
```

---

### 6. Bulk Create Custom Holidays (Optional)

**Endpoint:** `POST /api/custom-holidays/bulk`

**Request Body:**
```typescript
const payload = {
  holidays: [
    {
      date: '2026-05-01',
      name: 'Cuti Bersama 1',
      name_id: 'Cuti Bersama 1',
      description: 'Alasan cuti bersama 1',
      description_id: 'Alasan cuti bersama 1',
      type: 'Cuti Bersama',
    },
    {
      date: '2026-05-02',
      name: 'Libur Perusahaan',
      name_id: 'Libur Perusahaan',
      description: 'Libur tahunan perusahaan',
      description_id: 'Libur tahunan perusahaan',
      type: 'Libur Perusahaan',
    },
  ],
};
```

**Example Request:**
```typescript
const response = await fetch('http://localhost:15320/api/custom-holidays/bulk', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});

const result = await response.json();
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Custom holidays created successfully",
  "data": {
    "created": [
      { /* holiday 1 */ },
      { /* holiday 2 */ }
    ],
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

## 🎨 Frontend Implementation Examples

### React + TypeScript + Axios

```typescript
// services/customHolidayService.ts

import axios, { AxiosInstance } from 'axios';
import {
  CustomHoliday,
  CreateCustomHolidayInputFull,
  UpdateCustomHolidayInput,
  GetHolidaysFilters,
} from '../types/custom-holiday';

class CustomHolidayService {
  private api: AxiosInstance;

  constructor(accessToken: string) {
    this.api = axios.create({
      baseURL: 'http://localhost:15320/api',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getAll(filters?: GetHolidaysFilters): Promise<CustomHoliday[]> {
    const response = await this.api.get('/custom-holidays', { params: filters });
    return response.data.data || [];
  }

  async getById(id: string): Promise<CustomHoliday> {
    const response = await this.api.get(`/custom-holidays/${id}`);
    return response.data.data;
  }

  async create(input: CreateCustomHolidayInputFull): Promise<CustomHoliday> {
    const response = await this.api.post('/custom-holidays', input);
    return response.data.data;
  }

  async update(id: string, input: UpdateCustomHolidayInput): Promise<CustomHoliday> {
    const response = await this.api.put(`/custom-holidays/${id}`, input);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/custom-holidays/${id}`);
  }

  async bulkCreate(holidays: CreateCustomHolidayInputFull[]): Promise<any> {
    const response = await this.api.post('/custom-holidays/bulk', { holidays });
    return response.data.data;
  }
}

export default CustomHolidayService;
```

### React Hook Example

```typescript
// hooks/useCustomHolidays.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customHolidayApi } from '@/services/calendarApi';
import { useToast } from '@/components/ui/ToastContext';

/**
 * Hook to fetch all custom holidays
 */
export function useCustomHolidays(year?: number) {
  return useQuery({
    queryKey: ['custom-holidays', year],
    queryFn: () => customHolidayApi.getAll(year),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a new custom holiday
 */
export function useCreateCustomHoliday() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreateCustomHolidayInputFull) => customHolidayApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-holidays'] });
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast.success('Hari libur berhasil ditambahkan!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Gagal menambahkan hari libur';
      toast.error(message);
    },
  });
}

/**
 * Hook to update a custom holiday
 */
export function useUpdateCustomHoliday() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomHolidayInput }) =>
      customHolidayApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-holidays'] });
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast.success('Hari libur berhasil diperbarui!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Gagal memperbarui hari libur';
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a custom holiday
 */
export function useDeleteCustomHoliday() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => customHolidayApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-holidays'] });
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast.success('Hari libur berhasil dihapus!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Gagal menghapus hari libur';
      toast.error(message);
    },
  });
}
```

### React Component Example

```typescript
// components/CustomHolidays/CustomHolidaysList.tsx

import React, { useEffect, useState } from 'react';
import { useCustomHolidays, useDeleteCustomHoliday } from '../../hooks/useCustomHolidays';
import { CustomHoliday, CustomHolidayType } from '../../types/custom-holiday';

const CustomHolidaysList: React.FC = () => {
  const { data: holidays, isLoading, error } = useCustomHolidays(selectedYear);
  const deleteMutation = useDeleteCustomHoliday();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus holiday ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const getTypeLabel = (type: CustomHolidayType): string => {
    return type; // Already in Indonesian
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="header">
        <h2>Custom Holidays</h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {[2024, 2025, 2026, 2027].map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <button onClick={() => {/* Navigate to create form */}}>
          + Add Holiday
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Nama</th>
            <th>Tipe</th>
            <th>Deskripsi</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {holidays.map((holiday) => (
            <tr key={holiday.id}>
              <td>{formatDate(holiday.date)}</td>
              <td>{holiday.name_id || holiday.name}</td>
              <td>{getTypeLabel(holiday.type)}</td>
              <td>{holiday.description_id || holiday.description}</td>
              <td>
                <span className={`status ${holiday.is_active ? 'active' : 'inactive'}`}>
                  {holiday.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <button onClick={() => {/* Navigate to edit form */}}>Edit</button>
                <button onClick={() => handleDelete(holiday.id!)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomHolidaysList;
```

---

### Flutter/Dart Example

```dart
// models/custom_holiday.dart

class CustomHoliday {
  final String id;
  final String userId;
  final String? companyId;
  final DateTime date;
  final String name;
  final String? nameId;
  final String description;
  final String? descriptionId;
  final String type;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;

  CustomHoliday({
    required this.id,
    required this.userId,
    this.companyId,
    required this.date,
    required this.name,
    this.nameId,
    required this.description,
    this.descriptionId,
    required this.type,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
  });

  factory CustomHoliday.fromJson(Map<String, dynamic> json) {
    return CustomHoliday(
      id: json['id'],
      userId: json['user_id'],
      companyId: json['company_id'],
      date: DateTime.parse(json['date']),
      name: json['name'],
      nameId: json['name_id'],
      description: json['description'],
      descriptionId: json['description_id'],
      type: json['type'],
      isActive: json['is_active'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      deletedAt: json['deleted_at'] != null 
          ? DateTime.parse(json['deleted_at']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'company_id': companyId,
      'date': date.toIso8601String().split('T')[0],
      'name': name,
      'name_id': nameId,
      'description': description,
      'description_id': descriptionId,
      'type': type,
      'is_active': isActive,
    };
  }
}
```

```dart
// services/custom_holiday_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/custom_holiday.dart';

class CustomHolidayService {
  final String baseUrl;
  final String accessToken;

  CustomHolidayService({
    required this.baseUrl,
    required this.accessToken,
  });

  Map<String, String> get _headers => {
    'Authorization': 'Bearer $accessToken',
    'Content-Type': 'application/json',
  };

  Future<List<CustomHoliday>> getAll({
    int? year,
    int? month,
    String? type,
    int page = 1,
    int limit = 50,
  }) async {
    final queryParams = {
      if (year != null) 'year': year.toString(),
      if (month != null) 'month': month.toString(),
      if (type != null) 'type': type,
      'page': page.toString(),
      'limit': limit.toString(),
    };

    final uri = Uri.parse('$baseUrl/custom-holidays').replace(
      queryParameters: queryParams,
    );

    final response = await http.get(uri, headers: _headers);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final List<dynamic> holidaysJson = data['data'];
      return holidaysJson.map((json) => CustomHoliday.fromJson(json)).toList();
    }

    throw Exception('Failed to get custom holidays');
  }

  Future<CustomHoliday> create({
    required DateTime date,
    required String name,
    required String nameId,
    required String description,
    required String descriptionId,
    required String type,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/custom-holidays'),
      headers: _headers,
      body: json.encode({
        'date': date.toIso8601String().split('T')[0],
        'name': name,
        'name_id': nameId,
        'description': description,
        'description_id': descriptionId,
        'type': type,
      }),
    );

    if (response.statusCode == 201) {
      final data = json.decode(response.body);
      return CustomHoliday.fromJson(data['data']);
    }

    final error = json.decode(response.body);
    throw Exception(error['message'] ?? 'Failed to create custom holiday');
  }

  Future<CustomHoliday> update(
    String id, {
    DateTime? date,
    String? name,
    String? nameId,
    String? description,
    String? descriptionId,
    String? type,
  }) async {
    final response = await http.put(
      Uri.parse('$baseUrl/custom-holidays/$id'),
      headers: _headers,
      body: json.encode({
        if (date != null) 'date': date.toIso8601String().split('T')[0],
        if (name != null) 'name': name,
        if (nameId != null) 'name_id': nameId,
        if (description != null) 'description': description,
        if (descriptionId != null) 'description_id': descriptionId,
        if (type != null) 'type': type,
      }),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return CustomHoliday.fromJson(data['data']);
    }

    final error = json.decode(response.body);
    throw Exception(error['message'] ?? 'Failed to update custom holiday');
  }

  Future<void> delete(String id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/custom-holidays/$id'),
      headers: _headers,
    );

    if (response.statusCode != 200) {
      final error = json.decode(response.body);
      throw Exception(error['message'] ?? 'Failed to delete custom holiday');
    }
  }
}
```

---

## ⚠️ Validation Rules

### Required Fields (Create)
| Field         | Validation                              |
|---------------|-----------------------------------------|
| `date`        | Required, ISO 8601 (YYYY-MM-DD), future date only |
| `name`        | Required, 3-255 characters              |
| `name_id`     | Required, max 255 characters            |
| `description` | Required, 10-1000 characters            |
| `description_id` | Required, max 1000 characters        |
| `type`        | Required, must be valid enum value      |

### Optional Fields (Update)
All fields are optional in update endpoint.

### Business Rules
1. ✅ Date cannot be in the past
2. ✅ Duplicate dates are not allowed
3. ✅ User can only edit/delete their own holidays
4. ✅ Admin/HR can edit/delete any holiday in their company
5. ✅ Soft delete (data not permanently removed)

---

## 🔴 Error Handling

### Common Error Responses

```typescript
interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
```

### HTTP Status Codes

| Code | Description     | Example Message                                      |
|------|-----------------|------------------------------------------------------|
| 400  | Bad Request     | "Validation failed"                                  |
| 401  | Unauthorized    | "Invalid token"                                      |
| 403  | Forbidden       | "You don't have permission to update this holiday"   |
| 404  | Not Found       | "Custom holiday not found"                           |
| 409  | Conflict        | "Custom holiday for this date already exists"        |
| 500  | Server Error    | "Failed to process request"                          |

### Error Handling Example

```typescript
try {
  await service.create(payload);
} catch (error: any) {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        console.error('Validation error:', data.message);
        break;
      case 401:
        console.error('Authentication required');
        // Redirect to login
        break;
      case 403:
        console.error('Permission denied');
        break;
      case 409:
        console.error('Duplicate date');
        break;
      default:
        console.error('Server error');
    }
  } else {
    console.error('Network error');
  }
}
```

---

## 📱 UI/UX Guidelines

### Form Validation

```typescript
// Validation function example
function validateCustomHoliday(input: CreateCustomHolidayInputFull): Record<string, string> {
  const errors: Record<string, string> = {};

  // Date validation
  if (!input.date) {
    errors.date = 'Tanggal wajib diisi';
  } else {
    const date = new Date(input.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      errors.date = 'Tanggal tidak boleh di masa lalu';
    }
  }

  // Name validation
  if (!input.name) {
    errors.name = 'Nama wajib diisi';
  } else if (input.name.length < 3) {
    errors.name = 'Nama minimal 3 karakter';
  } else if (input.name.length > 255) {
    errors.name = 'Nama maksimal 255 karakter';
  }

  // Name ID validation
  if (!input.name_id) {
    errors.name_id = 'Nama (ID) wajib diisi';
  }

  // Description validation
  if (!input.description) {
    errors.description = 'Deskripsi wajib diisi';
  } else if (input.description.length < 10) {
    errors.description = 'Deskripsi minimal 10 karakter';
  } else if (input.description.length > 1000) {
    errors.description = 'Deskripsi maksimal 1000 karakter';
  }

  // Description ID validation
  if (!input.description_id) {
    errors.description_id = 'Deskripsi (ID) wajib diisi';
  }

  // Type validation
  if (!input.type) {
    errors.type = 'Tipe wajib diisi';
  } else if (!['Cuti Bersama', 'Libur Perusahaan', 'Libur Lainnya'].includes(input.type)) {
    errors.type = 'Tipe tidak valid';
  }

  return errors;
}
```

### Loading States

```typescript
// Example loading state management
const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

// In component
{state === 'loading' && <Spinner />}
{state === 'error' && <ErrorMessage />}
{state === 'success' && <SuccessMessage />}
```

---

## 🔄 Real-time Updates (Socket.IO)

If your app uses Socket.IO, you can listen for real-time updates:

```typescript
// Socket.IO event listeners
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:15320', {
  auth: { token: accessToken },
});

// Listen for holiday changes
socket.on('customHolidayCreated', (data) => {
  console.log('New holiday created:', data.customHoliday);
  // Refresh holiday list
});

socket.on('customHolidayUpdated', (data) => {
  console.log('Holiday updated:', data.customHoliday);
  // Update holiday in list
});

socket.on('customHolidayDeleted', (data) => {
  console.log('Holiday deleted:', data.holidayId);
  // Remove holiday from list
});

// Cleanup on unmount
return () => {
  socket.off('customHolidayCreated');
  socket.off('customHolidayUpdated');
  socket.off('customHolidayDeleted');
};
```

---

## 📊 Testing

### cURL Examples

```bash
# Get all holidays for year 2026
curl -X GET "http://localhost:15320/api/custom-holidays?year=2026" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create holiday
curl -X POST http://localhost:15320/api/custom-holidays \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "date": "2026-05-01",
    "name": "Cuti Bersama Lebaran",
    "name_id": "Cuti Bersama Lebaran",
    "description": "Mengganti tanggal libur yang jatuh pada akhir pekan",
    "description_id": "Mengganti tanggal libur yang jatuh pada akhir pekan",
    "type": "Cuti Bersama"
  }'

# Update holiday
curl -X PUT http://localhost:15320/api/custom-holidays/HOLIDAY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Cuti Bersama Lebaran (Updated)"
  }'

# Delete holiday
curl -X DELETE http://localhost:15320/api/custom-holidays/HOLIDAY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Additional Resources

- **Backend API Documentation:** `BACKEND_CUSTOM_HOLIDAYS_API.md`
- **Backend Service:** `src/services/calendarApi.ts`
- **Frontend Hooks:** `src/features/calendar/hooks/useCustomHolidays.ts`
- **Frontend Page:** `src/pages/Calendar.tsx`

---

## 🆘 Support

For questions or issues:
1. Check error messages in API response
2. Review validation rules in this document
3. Check network tab for request/response details
4. Contact backend team for server-side issues

---

**Last Updated:** April 1, 2026  
**API Version:** v1  
**Status:** ✅ Production Ready
