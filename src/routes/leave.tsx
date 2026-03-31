import { createFileRoute } from "@tanstack/react-router";
import { LeavePage } from "@/features/leave";
import ProtectedRoute from "@/components/ProtectedRoute";

/**
 * Leave Management Route
 *
 * Path: /leave
 * Access: ADMIN, MANAGER only
 *
 * Features:
 * - View all leave requests
 * - Edit leave requests (with audit trail)
 * - Approve/Reject leave requests
 * - Delete leave requests
 * - View edit history
 */
export const Route = createFileRoute("/leave")({
  component: () => (
    <ProtectedRoute>
      <LeavePage />
    </ProtectedRoute>
  ),
});
