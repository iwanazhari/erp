import { createFileRoute } from "@tanstack/react-router";
import SimpleSchedule from "@/pages/SimpleSchedule";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/schedule/my")({
  component: () => (
    <ProtectedRoute>
      <SimpleSchedule />
    </ProtectedRoute>
  ),
});
