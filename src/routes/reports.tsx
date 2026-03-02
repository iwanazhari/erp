import { createFileRoute } from "@tanstack/react-router";
import Reports from "@/pages/Reports";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/reports")({
  component: () => (
    <ProtectedRoute>
      <Reports />
    </ProtectedRoute>
  ),
});
