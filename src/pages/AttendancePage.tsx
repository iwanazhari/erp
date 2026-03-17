import { AttendanceHistoryPage } from '@/features/attendance';

/**
 * Attendance Page
 * 
 * Main page for viewing all users' attendance data.
 * Uses GET /api/attendance endpoint with filters and pagination.
 * 
 * Features:
 * - View attendance history for all users
 * - Filter by date range, status
 * - Pagination support
 * - Detailed view modal for each record
 */
export default function AttendancePage() {
  return <AttendanceHistoryPage />;
}
