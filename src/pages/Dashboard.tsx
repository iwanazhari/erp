import PageContainer from "@/components/ui/PageContainer";
import KpiCard from "@/components/ui/KpiCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { useRecentActivity } from "@/modules/audit/hooks";
import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboard";

export default function Dashboard() {
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(10);
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();

  const isLoading = summaryLoading || activityLoading;

  return (
    <PageContainer title="Dashboard">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Total Technicians"
          value={isLoading ? "..." : String(summary?.totalTechnicians ?? 0)}
        />
        <KpiCard
          label="Today Attendance"
          value={isLoading ? "..." : String(summary?.todayAttendance ?? 0)}
        />
        <KpiCard
          label="Active Schedules"
          value={isLoading ? "..." : String(summary?.activeSchedules ?? 0)}
        />
        <KpiCard
          label="Pending Leaves"
          value={isLoading ? "..." : String(summary?.pendingLeaves ?? 0)}
        />
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-4 gap-4 mt-4">
        <KpiCard
          label="Total Sales"
          value={isLoading ? "..." : String(summary?.totalSales ?? 0)}
        />
        <KpiCard
          label="Completed Today"
          value={isLoading ? "..." : String(summary?.completedToday ?? 0)}
        />
        <KpiCard
          label="Late Today"
          value={isLoading ? "..." : String(summary?.lateToday ?? 0)}
        />
        <KpiCard
          label="Pending Approvals"
          value={isLoading ? "..." : String(summary?.pendingApprovals ?? 0)}
        />
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
            isLoading={activityLoading}
          />
        </div>
      </div>
    </PageContainer>
  );
}
