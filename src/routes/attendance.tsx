import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";

const AttendancePage = React.lazy(() => import("@/pages/AttendancePage"));

export const Route = createFileRoute("/attendance")({
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={null}>
        <AttendancePage />
      </React.Suspense>
    </ProtectedRoute>
  ),
});
