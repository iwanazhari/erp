import { createFileRoute } from "@tanstack/react-router";
import SalesSchedule from "@/pages/SalesSchedule";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/schedule/sales")({
  component: () => (
    <ProtectedRoute>
      <SalesSchedule />
    </ProtectedRoute>
  ),
});
