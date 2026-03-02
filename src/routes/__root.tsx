import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import MainLayout from "@/layout/MainLayout";
import AuthLayout from "@/layout/AuthLayout";

export const Route = createRootRoute({
  component: RootRoute,
});

function RootRoute() {
  const location = useLocation();
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";

  if (isAuthRoute) {
    return (
      <AuthLayout>
        <Outlet />
      </AuthLayout>
    );
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
