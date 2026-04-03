import { createFileRoute } from "@tanstack/react-router";
import { LeavePage } from "@/features/leave";
import ProtectedRoute from "@/components/ProtectedRoute";

/**
 * Izin / sakit — GET /api/leave, POST /api/leave, PATCH approve/reject
 * (cakupan daftar mengikuti role; setujui/tolak: ADMIN & HR)
 */
export const Route = createFileRoute("/leave")({
  component: () => (
    <ProtectedRoute>
      <LeavePage />
    </ProtectedRoute>
  ),
});
