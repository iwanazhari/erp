import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";

const Reports = React.lazy(() => import("@/pages/Reports"));

export const Route = createFileRoute("/reports")({
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={null}>
        <Reports />
      </React.Suspense>
    </ProtectedRoute>
  ),
});
