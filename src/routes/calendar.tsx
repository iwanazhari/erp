import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";

const CalendarPage = React.lazy(() => import("@/pages/Calendar"));

export const Route = createFileRoute("/calendar")({
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={null}>
        <CalendarPage />
      </React.Suspense>
    </ProtectedRoute>
  ),
});
