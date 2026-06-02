import { createFileRoute } from "@tanstack/react-router";
import UsersPage from "@/pages/Users";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/users")({
  component: () => (
    <ProtectedRoute>
      <UsersPage />
    </ProtectedRoute>
  ),
});
