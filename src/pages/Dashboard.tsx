import PageContainer from "@/components/ui/PageContainer";
import KpiCard from "@/components/ui/KpiCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { useRecentActivity } from "@/modules/audit/hooks";

export default function Dashboard() {
  const { data: recentActivity, isLoading } = useRecentActivity(10);

  return (
    <PageContainer title="Dashboard">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Total Technicians" value="24" />
        <KpiCard label="Today Attendance" value="18" />
        <KpiCard label="Active Schedules" value="12" />
        <KpiCard label="Pending Reports" value="3" />
      </div>

      {/* Recent Activity Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Recent Activity
          </h2>
          <a
            href="/audit"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            View all →
          </a>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <ActivityFeed
            logs={recentActivity ?? []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </PageContainer>
  );
}
