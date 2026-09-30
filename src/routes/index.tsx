import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";

const Dashboard = React.lazy(() => import("@/pages/Dashboard"));

export const Route = createFileRoute("/")({
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={null}>
        <Dashboard />
      </React.Suspense>
    </ProtectedRoute>
  ),
});
