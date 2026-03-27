# Excel Export - Attendance Reports (Frontend Implementation)

## 📋 Overview

Implementasi **frontend** untuk fitur Excel Export laporan attendance yang memungkinkan admin dan manager untuk mengunduh data attendance dalam format Excel (.xlsx).

**Status:** ✅ Production Ready  
**Version:** 1.0  
**Last Updated:** March 26, 2026

---

## ✨ Features

- ✅ **3 Export Endpoints** - Monthly Report, History, dan All Records
- ✅ **React Hooks** - `useAttendanceExport` hook untuk reusable export logic
- ✅ **UI Components** - `ExportButtons` component dengan loading & error states
- ✅ **Report Page** - Halaman dedicated dengan filter dan tab navigation
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Auto Download** - File langsung di-download ke browser
- ✅ **Error Handling** - Error messages untuk permission errors dan API failures

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  AttendanceReportsPage                   │
│  /reports                                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Tabs: Monthly | History | All Records          │   │
│  │  Filters: Date Range, Status, User, etc.        │   │
│  │  ExportButtons Component                        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   useAttendanceExport  │
         │      (Custom Hook)     │
         └────────┬───────────────┘
                  │
                  ▼
         ┌────────────────────────┐
         │   attendanceApi        │
         │   - exportMonthly()    │
         │   - exportHistory()    │
         │   - exportAllRecords() │
         └────────┬───────────────┘
                  │
                  ▼
         ┌────────────────────────┐
         │   Backend API          │
         │   GET /api/attendance/ │
         │   export/*             │
         └────────────────────────┘
```

---

## 📁 Files Created/Modified

### New Files

| File | Purpose |
|------|---------|
| `src/utils/attendanceExcelExport.ts` | Utility functions untuk Excel download & formatting |
| `src/features/attendance/hooks/useAttendanceExport.ts` | Custom React hook untuk export logic |
| `src/features/attendance/components/ExportButtons.tsx` | Reusable export buttons component |
| `src/features/attendance/pages/AttendanceReportsPage.tsx` | Main reports page dengan filters |

### Modified Files

| File | Changes |
|------|---------|
| `src/shared/types/attendance.ts` | ✅ Added export filter types |
| `src/services/attendanceApi.ts` | ✅ Added 3 export methods |
| `src/features/attendance/index.ts` | ✅ Export new components & hooks |
| `src/features/attendance/components/index.ts` | ✅ Export ExportButtons |
| `src/features/attendance/hooks/useAttendance.ts` | ✅ Export useAttendanceExport |
| `src/pages/Reports.tsx` | ✅ Updated to use AttendanceReportsPage |
| `package.json` | ✅ Added `xlsx` dependency |

---

## 🔌 API Integration

### Export Methods

```typescript
// src/services/attendanceApi.ts

attendanceApi.exportMonthlyReport(filters?: MonthlyReportExportFilters): Promise<Blob>
attendanceApi.exportHistory(filters?: HistoryExportFilters): Promise<Blob>
attendanceApi.exportAllRecords(filters?: AllRecordsExportFilters): Promise<Blob>
```

### Filter Types

```typescript
// Monthly Report
interface MonthlyReportExportFilters {
  year?: number;
  month?: number;
  q?: string; // Search by name/email
}

// History Export
interface HistoryExportFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  status?: AttendanceStatus;
}

// All Records Export (ADMIN only)
interface AllRecordsExportFilters {
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  clockOutStatus?: string;
}
```

---

## 💻 Usage Examples

### 1. Using the Report Page (Recommended)

Navigate to `/reports` route untuk halaman lengkap dengan semua export options.

```tsx
// Access via route
<Link to="/reports">Laporan Attendance</Link>
```

### 2. Using ExportButtons Component

```tsx
import { ExportButtons } from '@/features/attendance';

function MyComponent() {
  return (
    <div>
      <h2>Quick Export</h2>
      <ExportButtons
        showMonthly
        showHistory
        defaultMonthlyFilters={{ year: 2026, month: 3 }}
        defaultHistoryFilters={{
          startDate: '2026-03-01',
          endDate: '2026-03-31',
        }}
        onExportSuccess={() => alert('Export berhasil!')}
        onExportError={(error) => alert(`Error: ${error}`)}
      />
    </div>
  );
}
```

### 3. Using useAttendanceExport Hook

```tsx
import { useAttendanceExport } from '@/features/attendance';

function CustomExportComponent() {
  const { exportMonthlyReport, exportState } = useAttendanceExport();

  const handleExport = async () => {
    try {
      await exportMonthlyReport({ year: 2026, month: 3 });
      console.log('Export successful!');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <button onClick={handleExport} disabled={exportState.loading}>
      {exportState.loading ? 'Exporting...' : 'Export Monthly Report'}
    </button>
  );
}
```

---

## 🎨 Components

### ExportButtons

Reusable component untuk export buttons dengan built-in states.

**Props:**

```typescript
interface ExportButtonsProps {
  showMonthly?: boolean;        // Show monthly report button
  showHistory?: boolean;        // Show history button
  showAllRecords?: boolean;     // Show all records button (ADMIN)
  defaultMonthlyFilters?: MonthlyReportExportFilters;
  defaultHistoryFilters?: HistoryExportFilters;
  defaultAllRecordsFilters?: AllRecordsExportFilters;
  onExportStart?: () => void;
  onExportSuccess?: () => void;
  onExportError?: (error: string) => void;
  className?: string;
}
```

**Features:**
- Auto loading state saat export
- Error handling dengan visual feedback
- Success notification
- Disabled state saat processing
- Icon indicators untuk setiap export type

### AttendanceReportsPage

Full-featured report page dengan:
- Tab navigation (Monthly | History | All Records)
- Filter forms untuk setiap export type
- Info panels yang menjelaskan data yang diexport
- Warning untuk ADMIN-only exports
- Real-time status notifications

---

## 🔒 Access Control

| Export Type | Required Role | Backend Validation |
|-------------|--------------|-------------------|
| Monthly Report | ADMIN, MANAGER | ✅ Yes |
| History | ADMIN, MANAGER | ✅ Yes |
| All Records | **ADMIN ONLY** | ✅ Yes |

**Error Handling:**
- 403 Forbidden: "Akses ditolak. Hanya ADMIN yang dapat export semua data attendance."
- 401 Unauthorized: "Token tidak valid atau tidak ada"
- API Errors: Ditampilkan di UI dengan red alert box

---

## 📊 File Format

### Excel Specifications

- **Format:** `.xlsx` (Excel 2007+)
- **Encoding:** UTF-8
- **Column Width:** Auto-adjust (handled by backend)
- **Date Format:** Indonesian (YYYY-MM-DD HH:mm:ss)
- **Currency Format:** Indonesian Rupiah (Rp)

### Filename Patterns

```
Laporan_Bulanan_2026-03_2026-03-26T10-30-00.xlsx
Riwayat_Attendance_2026-03-01_2026-03-26T10-30-00.xlsx
Semua_Data_Attendance_2026-03-01_2026-03-26T10-30-00.xlsx
```

---

## 🧪 Testing

### Manual Testing

1. **Navigate to Reports Page**
   ```
   http://localhost:5173/reports
   ```

2. **Test Monthly Report Export**
   - Select year and month
   - Optionally search by user
   - Click "📊 Export Monthly Report"
   - Verify file download

3. **Test History Export**
   - Select date range
   - Optionally filter by status/user
   - Click "📋 Export History"
   - Verify file download

4. **Test All Records Export (ADMIN only)**
   - Switch to "Semua Data (ADMIN)" tab
   - Select filters
   - Click "📁 Export All Records"
   - Verify file download

### Testing with Different Roles

```bash
# Login as ADMIN
email: admin@example.com
password: AdminPass123!

# Login as MANAGER
email: manager@example.com
password: ManagerPass123!

# Login as USER (should fail for All Records export)
email: user@example.com
password: UserPass123!
```

---

## 🛠️ Utilities

### attendanceExcelExport.ts

Helper functions:

```typescript
// Download handling
handleExcelDownload(blob, contentDisposition, defaultFilename)

// Filename generation
getMonthlyReportFilename(year?, month?)
getHistoryFilename(startDate?, endDate?)
getAllRecordsFilename(startDate?, endDate?)

// Formatting
formatRupiah(amount: number)
formatDateIndonesian(dateString: string)
mapAttendanceStatus(status: string)
mapClockOutStatus(status: string)

// Excel parsing (for preview)
parseExcelFile(file: File)
```

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "xlsx": "^0.18.5"
  }
}
```

**Note:** `xlsx` library digunakan untuk parsing Excel files jika diperlukan di masa depan (preview functionality).

---

## 🎯 Integration Checklist

- [x] Types added to `src/shared/types/attendance.ts`
- [x] API methods added to `src/services/attendanceApi.ts`
- [x] Custom hook created (`useAttendanceExport`)
- [x] ExportButtons component created
- [x] AttendanceReportsPage created
- [x] Routes updated
- [x] All exports configured in index files
- [x] Build successful (no TypeScript errors)

---

## 🚀 Next Steps (Optional Enhancements)

1. **Preview Functionality**
   - Add modal preview sebelum download
   - Use `parseExcelFile()` untuk preview

2. **Scheduled Exports**
   - Auto-generate monthly report di awal bulan
   - Email notification saat report siap

3. **Export History**
   - Track export history per user
   - Show last export date/time

4. **Advanced Filters**
   - Multi-select untuk status
   - Filter by department/team
   - Filter by office location

5. **Performance Optimization**
   - Show progress bar untuk large exports
   - Background processing dengan polling
   - Cache generated reports

---

## 📞 Support

**Documentation:**
- Backend API: `/api-docs` (Swagger UI)
- This file: `EXCEL_EXPORT_FRONTEND_IMPLEMENTATION.md`

**Key Files:**
- Hook: `src/features/attendance/hooks/useAttendanceExport.ts`
- Component: `src/features/attendance/components/ExportButtons.tsx`
- Page: `src/features/attendance/pages/AttendanceReportsPage.tsx`
- API: `src/services/attendanceApi.ts`
- Utils: `src/utils/attendanceExcelExport.ts`

---

**Status:** ✅ **Production Ready**

Build verified:
```bash
npm run build

> erp@0.0.0 build
> tsc -b && vite build

✓ 264 modules transformed.
dist/index.html                   0.45 kB │ gzip:   0.29 kB
dist/assets/index-LT6529TY.css   39.43 kB │ gzip:   7.75 kB
dist/assets/index-CJvZGQom.js   528.72 kB │ gzip: 152.78 kB
✓ built in 3.70s
```

**No errors** ✅
