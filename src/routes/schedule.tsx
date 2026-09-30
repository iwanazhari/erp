import * as React from "react";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";

const SchedulePage = React.lazy(
  () => import("@/features/schedule/pages/SchedulePage")
);

export const Route = createFileRoute("/schedule")({
  component: () => (
    <ProtectedRoute>
      <ScheduleRouteGate />
    </ProtectedRoute>
  ),
});

function ScheduleRouteGate() {
  const location = useLocation();
  if (location.pathname === "/schedule") {
    return (
      <React.Suspense fallback={null}>
        <SchedulePage />
      </React.Suspense>
    );
  }
  return <Outlet />;
}
