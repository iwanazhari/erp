import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";

const LazyOvertimePage = React.lazy(async () => {
  const { OvertimePage } = await import("@/features/overtime");
  return { default: OvertimePage };
});

export const Route = createFileRoute("/overtime")({
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={null}>
        <LazyOvertimePage />
      </React.Suspense>
    </ProtectedRoute>
  ),
});
