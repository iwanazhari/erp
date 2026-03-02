# Schedule Feature - Testing Documentation

## 📋 Table of Contents

1. [Setup Testing Environment](#setup-testing-environment)
2. [Manual Testing Guide](#manual-testing-guide)
3. [API Testing with Examples](#api-testing-with-examples)
4. [Component Testing Scenarios](#component-testing-scenarios)
5. [E2E Testing Scenarios](#e2e-testing-scenarios)
6. [Test Checklist](#test-checklist)

---

## 🛠️ Setup Testing Environment

### Prerequisites

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
echo "VITE_API_URL=http://localhost:15320/api" > .env

# 3. Start development server
npm run dev

# 4. Ensure backend is running on http://localhost:15320
```

### Test Data Requirements

Before testing, ensure you have:

1. **Authentication Token** - Login and get access token
2. **Test Users** with different roles:
   - ADMIN user
   - HR user
   - MANAGER user
   - TECHNICIAN user
   - TECHNICIAN_PAYMENT user

3. **Test Data**:
   - At least 1 company
   - At least 1 office
   - At least 2 technicians
   - At least 3 locations

---

## 📖 Manual Testing Guide

### 1. Location Management Testing

#### Test Case: Create New Location

**URL:** `http://localhost:5173/schedule-locations` (if route is set up)

**Steps:**
1. Navigate to Location Management page
2. Click "+ Tambah Lokasi" button
3. Fill in the form:
   ```
   Nama Lokasi: Kantor Cabang Jakarta
   Alamat: Jl. Sudirman No. 123, Jakarta
   Latitude: -6.2088
   Longitude: 106.8456
   Radius: 100
   Deskripsi: Kantor cabang utama di Jakarta
   ✅ Lokasi Aktif (checked)
   ```
4. Click "Buat Lokasi" button

**Expected Result:**
- ✅ Success message appears: "Lokasi berhasil dibuat!"
- ✅ New location appears in the list
- ✅ Modal closes automatically
- ✅ Location list refreshes

**Validation Tests:**
- [ ] Empty name shows error: "Nama lokasi wajib diisi"
- [ ] Empty address shows error: "Alamat wajib diisi"
- [ ] Invalid latitude (< -90 or > 90) shows error
- [ ] Invalid longitude (< -180 or > 180) shows error
- [ ] Radius < 10 or > 1000 shows error
- [ ] Description > 1000 characters shows counter and prevents submission

---

#### Test Case: Edit Location

**Steps:**
1. Click edit (pencil) icon on any location
2. Modify any field (e.g., change name to "Kantor Cabang Jakarta (Updated)")
3. Click "Perbarui" button

**Expected Result:**
- ✅ Success message: "Lokasi berhasil diperbarui!"
- ✅ Changes reflected in location list
- ✅ Modal closes

---

#### Test Case: Delete Location

**Steps:**
1. Click delete (trash) icon on a location
2. Confirm deletion in dialog

**Expected Result:**
- ✅ If no schedules: Location deleted successfully
- ✅ If has active schedules: Error message "Lokasi memiliki jadwal aktif dan tidak dapat dihapus"

---

### 2. Schedule Management Testing

#### Test Case: Create New Schedule

**URL:** `http://localhost:5173/schedule`

**Steps:**
1. Navigate to Schedule page
2. Click "+ Buat Jadwal" button
3. Fill in the form:
   ```
   Teknisi: Ahmad Rizki
   Lokasi: Kantor Cabang Jakarta
   Tanggal: 2026-03-01 (future date)
   Waktu Mulai: 08:00
   Waktu Akhir: 12:00
   Deskripsi: Pemasangan AC baru
   Catatan: Bawa peralatan lengkap
   ```
4. Click "Buat Jadwal" button

**Expected Result:**
- ✅ Success message: "Jadwal berhasil dibuat!"
- ✅ New schedule appears in table
- ✅ Modal closes
- ✅ Schedule list refreshes

**Availability Check:**
- When technician and date are selected, availability panel should show:
  - ✅ "✓ Teknisi tersedia" or "⚠ Teknisi tidak tersedia"
  - ✅ Quota usage: "Kuota: 1/3 lokasi"
  - ✅ Available time slots

---

#### Test Case: Schedule Validation

**Test various validation scenarios:**

1. **Empty Form:**
   - [ ] Submit empty form → Shows all required field errors

2. **Past Date:**
   - [ ] Select yesterday's date → Error: "Tanggal tidak boleh di masa lalu"

3. **Invalid Duration:**
   - [ ] Set 08:00 - 08:15 (15 min) → Error: "Durasi minimal 30 menit"
   - [ ] Set 08:00 - 17:00 (9 hours) → Error: "Durasi maksimal 8 jam"

4. **Time Order:**
   - [ ] End time before start time → Error: "Waktu akhir harus lebih besar dari waktu mulai"

5. **Overlapping Schedule:**
   - Create schedule: 08:00 - 12:00
   - Try to create another: 10:00 - 14:00 (same technician, same date)
   - [ ] Error: "Jadwal bentrok dengan jadwal lain"

6. **Quota Exceeded:**
   - Create 3 schedules for same technician on same date (different times)
   - Try to create 4th schedule
   - [ ] Error: "Teknisi sudah mencapai batas maksimal 3 lokasi per hari"

---

#### Test Case: View Schedule Details

**Steps:**
1. Click on any schedule row in the table

**Expected Result:**
- ✅ Modal opens in "view" mode
- ✅ Shows all schedule details:
  - Technician name and email
  - Location name and address
  - Date and time
  - Duration calculation
  - Status badge
  - Description and notes
  - Created/updated timestamps
- ✅ Action buttons visible: Edit, Batalkan, Hapus

---

#### Test Case: Edit Schedule

**Steps:**
1. View schedule details
2. Click "Edit" button
3. Modify fields (e.g., change time to 09:00 - 13:00)
4. Click "Perbarui" button

**Expected Result:**
- ✅ Success message: "Jadwal berhasil diperbarui!"
- ✅ Changes reflected in table
- ✅ Modal closes

**Negative Test:**
- Try to edit a COMPLETED or CANCELLED schedule
- [ ] Edit button should be hidden/disabled

---

#### Test Case: Cancel Schedule

**Steps:**
1. View schedule details
2. Click "Batalkan" button
3. Confirm cancellation

**Expected Result:**
- ✅ Success message: "Jadwal berhasil dibatalkan!"
- ✅ Status changes to CANCELLED (red badge)
- ✅ Modal closes or refreshes

**Negative Test:**
- Try to cancel already COMPLETED or CANCELLED schedule
- [ ] Error: "Jadwal sudah selesai atau dibatalkan"

---

#### Test Case: Delete Schedule

**Steps:**
1. View schedule details
2. Click "Hapus" button
3. Confirm deletion

**Expected Result:**
- ✅ Success message: "Jadwal berhasil dihapus!"
- ✅ Schedule removed from table
- ✅ Modal closes

**Permission Test:**
- Login as non-ADMIN user (HR, MANAGER)
- [ ] Delete button should be hidden

---

### 3. Filter and Search Testing

#### Test Case: Filter Schedules

**Steps:**
1. Use filter controls at the top of schedule list

**Test each filter:**
- [ ] **Teknisi:** Select different technicians → List updates
- [ ] **Lokasi:** Select different locations → List updates
- [ ] **Status:** Select different statuses → List updates
- [ ] **Date Range:** Set From and To dates → List updates
- [ ] **Combined Filters:** Use multiple filters together → Works correctly

**Expected Result:**
- ✅ Table refreshes with filtered results
- ✅ Pagination resets to page 1
- ✅ Empty state shows when no results match

---

#### Test Case: Pagination

**Steps:**
1. Ensure you have more than 20 schedules (or set limit to small number)
2. Click "Next" button
3. Click page numbers
4. Click "Previous" button

**Expected Result:**
- ✅ Correct schedules shown per page
- ✅ Page numbers update correctly
- ✅ Previous/Next buttons disable at boundaries
- ✅ "Menampilkan X dari Y jadwal" text updates

---

### 4. UI/UX Testing

#### Test Case: Responsive Design

**Test on different screen sizes:**

1. **Desktop (1920x1080):**
   - [ ] All elements visible and properly aligned
   - [ ] Table shows all columns
   - [ ] Modal centered properly

2. **Tablet (768x1024):**
   - [ ] Layout adjusts correctly
   - [ ] Table scrolls horizontally if needed
   - [ ] Modal fits screen

3. **Mobile (375x667):**
   - [ ] Mobile-friendly layout
   - [ ] Table scrolls or stacks
   - [ ] Buttons accessible
   - [ ] Modal full-screen or scrollable

---

#### Test Case: Loading States

**Steps:**
1. Clear browser cache
2. Navigate to Schedule page
3. Observe loading state

**Expected Result:**
- ✅ Skeleton loaders or spinner visible
- ✅ "Loading..." text or indicator
- ✅ Content appears when loaded
- ✅ No layout shift after loading

---

#### Test Case: Error States

**Test scenarios:**

1. **Network Error:**
   - Turn off internet/backend
   - Refresh page
   - [ ] Error message displayed
   - [ ] Retry option available

2. **401 Unauthorized:**
   - Remove token from localStorage
   - Refresh page
   - [ ] Redirect to login page

3. **403 Forbidden:**
   - Login as unauthorized user
   - Try to access restricted feature
   - [ ] "Access Denied" message

4. **404 Not Found:**
   - Try to access non-existent schedule/location
   - [ ] "Not found" message

---

## 🔬 API Testing with Examples

### Using Browser DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Perform actions in the app
4. Inspect API requests

### Example API Calls

#### 1. Create Location

**Request:**
```http
POST http://localhost:15320/api/locations
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "name": "Kantor Cabang Jakarta",
  "address": "Jl. Sudirman No. 123",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "radius": 100,
  "description": "Kantor cabang utama",
  "isActive": true
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Lokasi berhasil dibuat.",
  "data": {
    "id": "uuid",
    "name": "Kantor Cabang Jakarta",
    "address": "Jl. Sudirman No. 123",
    "latitude": -6.2088,
    "longitude": 106.8456,
    "radius": 100,
    "description": "Kantor cabang utama",
    "isActive": true,
    "createdAt": "2026-02-27T10:00:00.000Z"
  }
}
```

---

#### 2. Create Schedule

**Request:**
```http
POST http://localhost:15320/api/schedules
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "technicianId": "tech-123",
  "locationId": "loc-456",
  "date": "2026-03-01T00:00:00.000Z",
  "startTime": "2026-03-01T08:00:00.000Z",
  "endTime": "2026-03-01T12:00:00.000Z",
  "description": "Pemasangan AC baru",
  "notes": "Bawa peralatan lengkap"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Jadwal berhasil dibuat.",
  "data": {
    "id": "schedule-uuid",
    "technician": {
      "id": "tech-123",
      "name": "Ahmad Rizki",
      "email": "ahmad@example.com"
    },
    "location": {
      "id": "loc-456",
      "name": "Kantor Cabang Jakarta"
    },
    "date": "2026-03-01T00:00:00.000Z",
    "startTime": "2026-03-01T08:00:00.000Z",
    "endTime": "2026-03-01T12:00:00.000Z",
    "status": "ASSIGNED",
    "description": "Pemasangan AC baru",
    "notes": "Bawa peralatan lengkap"
  }
}
```

---

#### 3. Check Availability

**Request:**
```http
GET http://localhost:15320/api/schedules/availability/tech-123/2026-03-01
Authorization: Bearer <your-token>
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "technician": {
      "id": "tech-123",
      "name": "Ahmad Rizki"
    },
    "date": "2026-03-01",
    "isAvailable": true,
    "existingSchedules": [
      {
        "id": "schedule-1",
        "startTime": "2026-03-01T08:00:00.000Z",
        "endTime": "2026-03-01T12:00:00.000Z",
        "location": {
          "id": "loc-456",
          "name": "Kantor Cabang Jakarta"
        }
      }
    ],
    "availableSlots": [
      {
        "startTime": "2026-03-01T13:00:00.000Z",
        "endTime": "2026-03-01T17:00:00.000Z"
      }
    ],
    "quotaUsed": 1,
    "quotaMax": 3,
    "quotaRemaining": 2
  }
}
```

---

#### 4. List Schedules with Filters

**Request:**
```http
GET http://localhost:15320/api/schedules?status=ASSIGNED&dateFrom=2026-03-01&dateTo=2026-03-31&page=1&limit=20
Authorization: Bearer <your-token>
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "schedule-uuid",
      "technician": {
        "id": "tech-123",
        "name": "Ahmad Rizki"
      },
      "location": {
        "id": "loc-456",
        "name": "Kantor Cabang Jakarta"
      },
      "date": "2026-03-01T00:00:00.000Z",
      "startTime": "2026-03-01T08:00:00.000Z",
      "endTime": "2026-03-01T12:00:00.000Z",
      "status": "ASSIGNED"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

## 🧪 Component Testing Scenarios

### ScheduleForm Component

**Test Scenarios:**

1. **Initial State:**
   - [ ] All fields empty (create mode)
   - [ ] Fields populated (edit mode)
   - [ ] Date picker shows current date or later only

2. **Field Interactions:**
   - [ ] Technician dropdown populates with technicians
   - [ ] Location dropdown populates with active locations
   - [ ] Date picker prevents past dates
   - [ ] Time inputs accept valid times
   - [ ] Duration updates when times change
   - [ ] Character counter updates for description

3. **Validation:**
   - [ ] Required field errors show on submit
   - [ ] Duration validation (min 30min, max 8hr)
   - [ ] End time > start time validation
   - [ ] Past date validation

4. **Availability Panel:**
   - [ ] Shows when technician and date selected
   - [ ] Displays quota correctly
   - [ ] Shows available slots
   - [ ] Updates when inputs change

5. **Submission:**
   - [ ] Success: Shows success message, closes modal
   - [ ] Error: Shows error message, stays on form
   - [ ] Loading: Button shows "Menyimpan..." and disabled

---

### ScheduleTable Component

**Test Scenarios:**

1. **Display:**
   - [ ] Shows all columns: Teknisi, Lokasi, Tanggal, Waktu, Status
   - [ ] Technician name and email shown
   - [ ] Location name and address shown
   - [ ] Date formatted correctly
   - [ ] Time formatted correctly (HH:mm - HH:mm)
   - [ ] Duration shown
   - [ ] Status badge with correct color

2. **Empty State:**
   - [ ] Shows "Tidak ada jadwal" message
   - [ ] Shows calendar icon
   - [ ] Helpful text displayed

3. **Loading State:**
   - [ ] Skeleton loaders shown
   - [ ] Correct number of rows (5)

4. **Interactions:**
   - [ ] Row click opens detail modal
   - [ ] Hover effect on rows
   - [ ] Cursor changes to pointer

---

### ScheduleModal Component

**Test Scenarios:**

1. **Modes:**
   - [ ] Create mode: Shows form, title "Buat Jadwal Baru"
   - [ ] Edit mode: Shows form with data, title "Edit Jadwal"
   - [ ] View mode: Shows details, title "Detail Jadwal"

2. **Actions (View Mode):**
   - [ ] Edit button visible for non-completed schedules
   - [ ] Cancel button visible for non-completed schedules
   - [ ] Delete button always visible
   - [ ] Buttons hidden/disabled for completed/cancelled

3. **Backdrop:**
   - [ ] Click outside closes modal
   - [ ] ESC key closes modal

4. **Transitions:**
   - [ ] Modal fades in/out smoothly
   - [ ] Backdrop appears/disappears correctly

---

## 🎭 E2E Testing Scenarios

### Scenario 1: Complete Schedule Creation Flow

**User Story:** As an admin, I want to create a schedule for a technician

**Steps:**
1. Login as ADMIN
2. Navigate to /schedule
3. Click "+ Buat Jadwal"
4. Select technician "Ahmad Rizki"
5. Select location "Kantor Cabang Jakarta"
6. Select date (tomorrow)
7. Set time 08:00 - 12:00
8. Enter description "Pemasangan AC"
9. Enter notes "Bawa peralatan"
10. Submit form
11. Verify success message
12. Verify schedule appears in table

**Expected Result:** ✅ Schedule created successfully

---

### Scenario 2: Handle Schedule Conflict

**User Story:** As an admin, I want to be prevented from creating overlapping schedules

**Steps:**
1. Create schedule: Tech A, Location X, Date Y, 08:00-12:00
2. Try to create another: Tech A, Location Z, Date Y, 10:00-14:00
3. Submit form

**Expected Result:** ✅ Error message about schedule conflict

---

### Scenario 3: Location Management Workflow

**User Story:** As an admin, I want to manage work locations

**Steps:**
1. Navigate to /schedule-locations
2. Click "+ Tambah Lokasi"
3. Fill in location details
4. Submit form
5. Verify location appears in list
6. Click edit button
7. Modify location name
8. Submit update
9. Verify changes saved
10. Click delete button
11. Confirm deletion
12. Verify location removed

**Expected Result:** ✅ Location CRUD operations work correctly

---

### Scenario 4: Schedule Lifecycle

**User Story:** As an admin, I want to manage schedule lifecycle

**Steps:**
1. Create a new schedule
2. View schedule details
3. Click "Edit"
4. Modify time
5. Save changes
6. View updated schedule
7. Click "Batalkan"
8. Confirm cancellation
9. Verify status changed to CANCELLED
10. Try to edit cancelled schedule (should not be allowed)

**Expected Result:** ✅ Schedule can be created, edited, and cancelled

---

### Scenario 5: Filter and Search

**User Story:** As a user, I want to find specific schedules

**Steps:**
1. Navigate to /schedule
2. Select technician filter
3. Select status filter (ASSIGNED)
4. Set date range (this month)
5. Verify filtered results
6. Clear filters
7. Verify all schedules shown

**Expected Result:** ✅ Filters work correctly and can be combined

---

## ✅ Test Checklist

### Pre-Testing Checklist

- [ ] Backend server running on http://localhost:15320
- [ ] Frontend dev server running on http://localhost:5173
- [ ] .env file configured with VITE_API_URL
- [ ] Test users created (ADMIN, HR, MANAGER, TECHNICIAN)
- [ ] Test data available (companies, offices, locations)
- [ ] Browser DevTools ready for network inspection

---

### Functional Testing Checklist

#### Location Management
- [ ] Create location - Success
- [ ] Create location - Validation errors
- [ ] View location list
- [ ] Edit location
- [ ] Delete location (no schedules)
- [ ] Delete location (has schedules) - Error
- [ ] Location form validation
- [ ] Location list pagination

#### Schedule Management
- [ ] Create schedule - Success
- [ ] Create schedule - Validation errors
- [ ] View schedule list
- [ ] View schedule details
- [ ] Edit schedule
- [ ] Cancel schedule
- [ ] Delete schedule
- [ ] Schedule form validation
- [ ] Availability check
- [ ] Duration calculation
- [ ] Overlap detection
- [ ] Quota enforcement
- [ ] Schedule list pagination

#### Filters
- [ ] Filter by technician
- [ ] Filter by location
- [ ] Filter by status
- [ ] Filter by date range
- [ ] Combined filters
- [ ] Clear filters
- [ ] Pagination with filters

---

### Permission Testing Checklist

#### ADMIN Role
- [ ] Can create locations
- [ ] Can edit locations
- [ ] Can delete locations
- [ ] Can create schedules
- [ ] Can edit schedules
- [ ] Can cancel schedules
- [ ] Can delete schedules

#### HR Role
- [ ] Can create locations
- [ ] Can edit locations
- [ ] Cannot delete locations
- [ ] Can create schedules
- [ ] Can edit schedules
- [ ] Can cancel schedules
- [ ] Cannot delete schedules

#### MANAGER Role
- [ ] Same as HR role

#### TECHNICIAN Role
- [ ] Can view locations
- [ ] Can view schedules
- [ ] Can check availability
- [ ] Cannot create/edit/delete schedules or locations

---

### UI/UX Testing Checklist

#### Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

#### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Form labels present
- [ ] Error messages clear
- [ ] Color contrast sufficient

#### Performance
- [ ] Page loads in < 3 seconds
- [ ] API calls complete in < 2 seconds
- [ ] No layout shifts after load
- [ ] Smooth animations
- [ ] No console errors

#### Error Handling
- [ ] Network errors handled
- [ ] 401 redirects to login
- [ ] 403 shows access denied
- [ ] 404 shows not found
- [ ] Validation errors shown inline
- [ ] Success messages shown

---

### Browser Compatibility Checklist

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

### Regression Testing Checklist

After any code change, verify:
- [ ] All CRUD operations still work
- [ ] All validations still enforced
- [ ] All permissions still applied
- [ ] UI still responsive
- [ ] No new console errors
- [ ] Build still passes

---

## 📊 Test Report Template

```markdown
# Test Report - Schedule Feature

**Date:** YYYY-MM-DD
**Tester:** [Name]
**Environment:** [Dev/Staging/Production]
**Browser:** [Chrome/Firefox/Safari/Edge]
**Version:** [Browser version]

## Test Summary

- Total Tests: [X]
- Passed: [Y]
- Failed: [Z]
- Skipped: [W]

## Critical Issues

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| 1  | [Description] | Critical/Open |

## Major Issues

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| 1  | [Description] | Major/Open |

## Minor Issues

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| 1  | [Description] | Minor/Open |

## Notes

[Any additional observations or recommendations]

## Sign-off

- [ ] Ready for production
- [ ] Requires fixes
- [ ] Requires re-testing
```

---

## 🔧 Debugging Tips

### Common Issues and Solutions

1. **API Calls Failing (401)**
   - Check if token exists in localStorage
   - Verify token is not expired
   - Check Authorization header format

2. **API Calls Failing (403)**
   - Verify user has required role
   - Check backend role configuration

3. **Form Not Submitting**
   - Check console for validation errors
   - Verify all required fields filled
   - Check network tab for API errors

4. **Modal Not Closing**
   - Check for pending API calls
   - Verify onClose handler is called
   - Check for JavaScript errors

5. **Data Not Loading**
   - Check network tab for failed requests
   - Verify API endpoint is correct
   - Check backend logs for errors

### Browser Console Commands

```javascript
// Check localStorage
localStorage.getItem('accessToken')

// Clear localStorage
localStorage.clear()

// Check API responses (in Network tab)
// Right-click on request → Copy → Copy as fetch

// Force refresh React Query cache
queryClient.invalidateQueries()
```

---

**Testing Documentation** | Last Updated: 2026-02-27 | Version: 1.0.0
