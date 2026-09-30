import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";

const SimpleSchedule = React.lazy(() => import("@/pages/SimpleSchedule"));

export const Route = createFileRoute("/schedule/my")({
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={null}>
        <SimpleSchedule />
      </React.Suspense>
    </ProtectedRoute>
  ),
});
