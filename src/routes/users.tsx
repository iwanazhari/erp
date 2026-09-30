import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";

const UsersPage = React.lazy(() => import("@/pages/Users"));

export const Route = createFileRoute("/users")({
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={null}>
        <UsersPage />
      </React.Suspense>
    </ProtectedRoute>
  ),
});
