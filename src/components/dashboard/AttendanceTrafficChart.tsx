import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAttendanceTraffic } from '@/features/dashboard/hooks/useAttendanceTraffic';

type RoleFilter = 'ALL' | 'SALES' | 'TECHNICIAN';
type PeriodFilter = '7d' | '30d' | '90d';

function getDateRange(period: PeriodFilter): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (period === '7d' ? 6 : period === '30d' ? 29 : 89));

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return { startDate: fmt(start), endDate: fmt(end) };
}

const ROLE_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: 'ALL', label: 'All Roles' },
  { value: 'SALES', label: 'Sales' },
  { value: 'TECHNICIAN', label: 'Technician' },
];

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string; dataKey: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
      <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-600">{entry.name}:</span>
          <span className="font-medium text-slate-800">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AttendanceTrafficChart() {
  const [role, setRole] = useState<RoleFilter>('ALL');
  const [period, setPeriod] = useState<PeriodFilter>('7d');

  const dateRange = useMemo(() => getDateRange(period), [period]);

  const { data, isLoading, isError } = useAttendanceTraffic({
    role,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const traffic = data?.traffic ?? [];
  const summary = data?.summary;

  // Format dates for display
  const chartData = useMemo(
    () =>
      traffic.map((d) => ({
        ...d,
        date: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      })),
    [traffic]
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Attendance Traffic
        </h2>
        <div className="flex items-center gap-3">
          {/* Period Filter */}
          <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  period === opt.value
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Role Filter */}
          <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRole(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  role === opt.value
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-blue-600 font-medium">Total Checked In</p>
            <p className="text-xl font-bold text-blue-800">{summary.totalCheckedIn}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <p className="text-xs text-green-600 font-medium">On Time</p>
            <p className="text-xl font-bold text-green-800">{summary.totalOnTime}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-100">
            <p className="text-xs text-red-600 font-medium">Late</p>
            <p className="text-xl font-bold text-red-800">{summary.totalLate}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <p className="text-xs text-purple-600 font-medium">Avg / Day</p>
            <p className="text-xl font-bold text-purple-800">{summary.averagePerDay}</p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="w-full" style={{ height: 300 }}>
        {isLoading && (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Loading chart data...
          </div>
        )}
        {isError && (
          <div className="flex items-center justify-center h-full text-red-400 text-sm">
            Failed to load attendance traffic data.
          </div>
        )}
        {!isLoading && !isError && chartData.length === 0 && (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            No attendance data found for this period.
          </div>
        )}
        {!isLoading && !isError && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                iconType="circle"
                iconSize={8}
              />
              <Line
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3, fill: '#3b82f6' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="onTime"
                name="On Time"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 3, fill: '#22c55e' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="late"
                name="Late"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3, fill: '#ef4444' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
