import { createFileRoute } from "@tanstack/react-router";
import AttendancePage from "@/pages/AttendancePage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/attendance")({
  component: () => (
    <ProtectedRoute>
      <AttendancePage />
    </ProtectedRoute>
  ),
});
