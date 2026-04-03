import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import SchedulePage from "@/features/schedule/pages/SchedulePage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/schedule")({
  component: () => (
    <ProtectedRoute>
      <ScheduleRouteGate />
    </ProtectedRoute>
  ),
});

function ScheduleRouteGate() {
  const location = useLocation();

  // Render technician page only for exact `/schedule`.
  // For `/schedule/sales` and `/schedule/my`, render nested child routes.
  if (location.pathname === "/schedule") {
    return <SchedulePage />;
  }

  return <Outlet />;
}
