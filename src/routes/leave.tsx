import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";

const LazyLeavePage = React.lazy(async () => {
  const { LeavePage } = await import("@/features/leave");
  return { default: LeavePage };
});

export const Route = createFileRoute("/leave")({
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={null}>
        <LazyLeavePage />
      </React.Suspense>
    </ProtectedRoute>
  ),
});
