import { createFileRoute } from "@tanstack/react-router";
import CalendarPage from "@/pages/Calendar";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/calendar")({
  component: () => (
    <ProtectedRoute>
      <CalendarPage />
    </ProtectedRoute>
  ),
});
