import PageContainer from '@/components/ui/PageContainer';
import KpiCard from '@/components/ui/KpiCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import AttendanceTrafficChart from '@/components/dashboard/AttendanceTrafficChart';
import { useRecentActivity } from '@/modules/audit/hooks';
import { useAuditWebSocket } from '@/modules/audit/useAuditWebSocket';
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboard';

export default function Dashboard() {
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(10);
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();

  useAuditWebSocket();

  const isLoading = summaryLoading || activityLoading;

  return (
    <PageContainer
      title="Dashboard"
      subtitle="Real-time system overview and key metrics"
      wrapContent={false}
    >
      <div className="space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard
            label="Total Technicians"
            value={isLoading ? '---' : String(summary?.totalTechnicians ?? 0)}
            trend="up"
            trendLabel="Active"
          />
          <KpiCard
            label="Today Attendance"
            value={isLoading ? '---' : String(summary?.todayAttendance ?? 0)}
            trend={Number(summary?.todayAttendance) > 0 ? 'up' : 'neutral'}
            trendLabel={Number(summary?.todayAttendance) > 0 ? 'Checked in' : 'No data'}
          />
          <KpiCard
            label="Active Schedules"
            value={isLoading ? '---' : String(summary?.activeSchedules ?? 0)}
            trend="up"
            trendLabel="Scheduled"
          />
          <KpiCard
            label="Pending Leaves"
            value={isLoading ? '---' : String(summary?.pendingLeaves ?? 0)}
            trend={Number(summary?.pendingLeaves) > 0 ? 'down' : 'neutral'}
            trendLabel={Number(summary?.pendingLeaves) > 0 ? 'Needs review' : 'Clear'}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard
            label="Total Sales"
            value={isLoading ? '---' : String(summary?.totalSales ?? 0)}
          />
          <KpiCard
            label="Completed Today"
            value={isLoading ? '---' : String(summary?.completedToday ?? 0)}
          />
          <KpiCard
            label="Late Today"
            value={isLoading ? '---' : String(summary?.lateToday ?? 0)}
            trend={Number(summary?.lateToday) > 0 ? 'down' : 'up'}
            trendLabel={Number(summary?.lateToday) > 0 ? 'Late' : 'On time'}
          />
          <KpiCard
            label="Pending Approvals"
            value={isLoading ? '---' : String(summary?.pendingApprovals ?? 0)}
            trend={Number(summary?.pendingApprovals) > 0 ? 'neutral' : 'up'}
            trendLabel={Number(summary?.pendingApprovals) > 0 ? 'Awaiting' : 'All clear'}
          />
        </div>

        {/* Attendance Traffic Chart */}
        <AttendanceTrafficChart />

        {/* Recent Activity */}
        <div className="rounded-xl bg-card border border-border shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="section-label">
              <span className="section-label-dot" />
              <span className="section-label-text">Activity</span>
            </div>
            <a
              href="/audit"
              className="text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              View all &rarr;
            </a>
          </div>
          <ActivityFeed logs={recentActivity ?? []} isLoading={activityLoading} />
        </div>
      </div>
    </PageContainer>
  );
}
