import StatusBadge from "./StatusBadge";
import type { Attendance } from "@/modules/attendance/types";

type Props = {
  data: Attendance;
};

export default function AttendanceViewMode({ data }: Props) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-slate-500">Name</p>
        <p className="font-medium text-slate-800">{data.name}</p>
      </div>

      <div>
        <p className="text-slate-500">Date</p>
        <p className="font-medium text-slate-800">{data.date}</p>
      </div>

      <div>
        <p className="text-slate-500">Check In</p>
        <p className="font-medium text-slate-800">{data.checkIn ?? "-"}</p>
      </div>

      <div>
        <p className="text-slate-500">Check Out</p>
        <p className="font-medium text-slate-800">{data.checkOut ?? "-"}</p>
      </div>

      <div>
        <p className="text-slate-500">Status</p>
        <StatusBadge status={data.status} />
      </div>
    </div>
  );
}
