import AttendanceReportsPage from "@/features/attendance/pages/AttendanceReportsPage";

/**
 * Reports Page
 * 
 * Main entry point for attendance reports and Excel export functionality.
 * This page provides 3 export options:
 * - Monthly Report (ADMIN, MANAGER)
 * - Attendance History (ADMIN, MANAGER)  
 * - All Records (ADMIN ONLY)
 */
export default function Reports() {
  return <AttendanceReportsPage />;
}
