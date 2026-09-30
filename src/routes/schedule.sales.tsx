import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";

const SalesSchedule = React.lazy(() => import("@/pages/SalesSchedule"));

export const Route = createFileRoute("/schedule/sales")({
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={null}>
        <SalesSchedule />
      </React.Suspense>
    </ProtectedRoute>
  ),
});
