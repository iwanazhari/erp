import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";

const TrackingPage = React.lazy(
  () => import("@/features/tracking/pages/TrackingPage")
);

export const Route = createFileRoute("/tracking")({
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={null}>
        <TrackingPage />
      </React.Suspense>
    </ProtectedRoute>
  ),
});
