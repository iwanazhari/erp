# Dokumentasi frontend — Leave (izin) & Schedule (jadwal)

Dokumen ini menjelaskan **cara kode web admin terhubung ke API** dan **pemisahan UI** untuk fitur Leave serta Schedule (teknisi vs sales). Untuk kontrak API mentah, rujuk juga dokumentasi backend / Swagger.

---

## 1. Leave (`/leave`)

### Endpoint yang dipakai

| Method | Path | Peran | Kode pemanggil |
|--------|------|--------|----------------|
| `GET` | `/api/leave` | Terautentikasi (scope oleh **role** di server) | `leaveApi.getList` → `useLeaveList` |
| `POST` | `/api/leave` | User login; **ADMIN/HR** boleh `targetUserId` / `userId` untuk karyawan lain | `leaveApi.create` → `useCreateLeave` |
| `PATCH` | `/api/leave/:id/approve` | **ADMIN**, **HR** | `leaveApi.approve` → `useApproveLeave` |
| `PATCH` | `/api/leave/:id/reject` | **ADMIN**, **HR** | `leaveApi.reject` → `useRejectLeave` |

Header: `Authorization: Bearer <access_token>` (via `privateApi` di `src/services/authApi.ts`).

### File utama

| File | Fungsi |
|------|--------|
| `src/services/leaveApi.ts` | HTTP client + `getUsersForLeaveTarget()` (pagination `GET /user` untuk dropdown HR) |
| `src/shared/types/leave.ts` | Tipe `Leave`, `CreateLeaveInput` (termasuk `targetUserId` / `userId` opsional) |
| `src/features/leave/hooks/useLeave.ts` | React Query: list, create, approve, reject, `useLeaveTargetUsers` |
| `src/features/leave/pages/LeavePage.tsx` | Halaman daftar + filter + aksi |
| `src/features/leave/components/LeaveCreateModal.tsx` | Form ajukan; **ADMIN/HR**: opsi pemohon sendiri vs karyawan lain (`targetUserId`) |
| `src/features/leave/components/LeaveTable.tsx` | Tabel + approve/reject (HR/Admin) |
| `src/components/ui/ConfirmDialogContext.tsx` | Konfirmasi approve/reject (bukan `window.confirm`) |

### Perilaku penting

- **Scope daftar** (`GET /leave`) ditentukan **backend** dari role token (ADMIN/HR = semua; MANAGER = bawahan; lainnya = sendiri). UI filter hanya di client atas data yang sudah diterima.
- **HR/Admin membuat izin untuk orang lain**: isi `targetUserId` di `POST` (satu field saja; jangan duplikasi beda nilai dengan alias `userId`).
- Error **403** (perusahaan / role): pesan dari `response.data.message` ditampilkan lewat `leaveApiErrorMessage`.

---

## 2. Schedule — Teknisi vs Sales

### Rute halaman

| Rute | Halaman | Form / modal |
|------|---------|----------------|
| `/schedule` | `SchedulePage` (`src/features/schedule/pages/SchedulePage.tsx`) | Modal **`ScheduleModal`** → **`TechnicianScheduleForm`** |
| `/schedule/sales` | `SalesSchedule` (`src/pages/SalesSchedule.tsx`) | Inline **`SalesScheduleForm`** (bukan modal) |
| `/schedule/my` | `SimpleSchedule` (legacy) | — |

`src/routes/schedule.tsx` memuat **SchedulePage** untuk `/schedule` (bukan `SimpleSchedule`).

### Pemisahan komponen

| Komponen | Lokasi | Isi |
|----------|--------|-----|
| **TechnicianScheduleForm** | `src/features/schedule/components/TechnicianScheduleForm.tsx` | Pencarian **teknisi saja** (`useScheduleTechnicians`), lokasi tugas, durasi, ketersediaan teknisi, titik lokasi tambahan (MapPicker). |
| **SalesScheduleForm** | `src/features/schedule/components/SalesScheduleForm.tsx` | Jadwal **kunjungan sales** (sales = user login); alamat + waktu; **tanpa** search user teknisi. |
| **ScheduleForm** (alias) | `src/features/schedule/components/ScheduleForm.tsx` | Re-export ke `TechnicianScheduleForm` untuk kompatibilitas impor lama. |

### React Query — agar user tidak “tercampur”

| Hook | Query key | Sumber data |
|------|-----------|-------------|
| `useScheduleTechnicians()` | `['schedule', 'technician-assignable-users']` | `userApi.getTechnicians()` — filter role teknisi |
| `useScheduleSalesUsers()` | `['schedule', 'sales-assignable-users']` | `userApi.getSales()` — filter role sales |
| `useTechnicians()` / `useSales()` | — | Alias deprecated ke hook di atas |

### Modal jadwal teknisi

- **`ScheduleModal`** memakai **`ModalShell`** ukuran **`2xl`** (`max-w-5xl`) + area konten scroll lebih tinggi (`contentClassName`).
- Judul modal menyebut **jadwal teknisi** agar tidak tertukar dengan sales.

### API client schedule (umum)

- `src/services/scheduleApi.ts` — `scheduleApi`, `locationApi`, `userApi` (getTechnicians / getSales).

Dokumentasi fitur schedule lama (tabel, testing): lihat `src/features/schedule/README.md` dan `BACKEND_API.md` di folder yang sama.

---

## 3. Checklist singkat developer

**Leave**

1. Token tersimpan; request memakai `Authorization: Bearer`.
2. HR/Admin: modal create mendukung **targetUserId** bila memilih karyawan lain.
3. Approve/reject memakai dialog konfirmasi aplikasi, bukan dialog browser natif.

**Schedule**

1. **Technician schedule** → hanya **`TechnicianScheduleForm`** / **`ScheduleModal`**.
2. **Sales schedule** → hanya **`SalesScheduleForm`** di halaman sales.
3. Pencarian nama untuk penugasan teknisi memakai **`useScheduleTechnicians`**, bukan pool sales.

---

*Terakhir diperbarui mengikuti implementasi frontend di repo ini.*
