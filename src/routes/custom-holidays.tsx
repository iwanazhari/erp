import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";

const CustomHolidaysPage = React.lazy(() => import("@/pages/CustomHolidays"));

export const Route = createFileRoute("/custom-holidays")({
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={null}>
        <CustomHolidaysPage />
      </React.Suspense>
    </ProtectedRoute>
  ),
});
