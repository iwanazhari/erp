import { createFileRoute } from "@tanstack/react-router";
import { OvertimePage } from "@/features/overtime";
import ProtectedRoute from "@/components/ProtectedRoute";

/**
 * Overtime / Lembur — GET /api/v1/overtime, POST /api/v1/overtime/request, PATCH approve/reject
 * (cakupan daftar mengikuti role; setujui/tolak: MANAGER, HR & ADMIN)
 */
export const Route = createFileRoute("/overtime" as any)({
  component: () => (
    <ProtectedRoute>
      <OvertimePage />
    </ProtectedRoute>
  ),
});
