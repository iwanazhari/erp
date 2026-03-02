import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import AttendancePage from "@/pages/AttendancePage";
import ProtectedRoute from "@/components/ProtectedRoute";
import { z } from "zod";

const searchParams = z.object({
  page: z.coerce.number().default(1),
  search: z.string().default(""),
  date: z.string().default(""),
  status: z.string().default(""),
  sort: z.string().default("date_desc"),
  open: z.string().optional(), // For deep-linking to specific attendance
});

export const Route = createFileRoute("/attendance")({
  validateSearch: searchParams,
  component: () => (
    <ProtectedRoute>
      <RouteComponent />
    </ProtectedRoute>
  ),
});

function RouteComponent() {
  const search = useSearch({ from: "/attendance" });
  const navigate = useNavigate();

  const setSearch = (params: Partial<z.infer<typeof searchParams>>) => {
    navigate({
      to: "/attendance",
      search: (prev: Record<string, unknown>) => ({ ...prev, ...params }),
    } as const);
  };

  return (
    <AttendancePage
      initialPage={search.page}
      initialSearch={search.search}
      initialDate={search.date}
      initialStatus={search.status}
      initialSort={search.sort}
      initialOpenId={search.open}
      onParamsChange={setSearch}
    />
  );
}
