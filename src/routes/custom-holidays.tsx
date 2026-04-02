import { createFileRoute } from "@tanstack/react-router";
import CustomHolidaysPage from "@/pages/CustomHolidays";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/custom-holidays")({
  component: () => (
    <ProtectedRoute>
      <CustomHolidaysPage />
    </ProtectedRoute>
  ),
});
