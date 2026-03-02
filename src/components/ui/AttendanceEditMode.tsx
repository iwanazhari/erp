import { useState } from "react";

type AttendanceRow = {
  name: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
};

type Props = {
  data: AttendanceRow;
  onSave: (data: AttendanceRow) => void;
  onCancel: () => void;
};

export default function AttendanceEditMode({ data, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState<AttendanceRow>({ ...data });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div>
        <label className="block text-slate-500 mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      <div>
        <label className="block text-slate-500 mb-1">Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) =>
            setFormData({ ...formData, date: e.target.value })
          }
          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      <div>
        <label className="block text-slate-500 mb-1">Check In</label>
        <input
          type="time"
          value={formData.checkIn}
          onChange={(e) =>
            setFormData({ ...formData, checkIn: e.target.value })
          }
          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      <div>
        <label className="block text-slate-500 mb-1">Check Out</label>
        <input
          type="time"
          value={formData.checkOut}
          onChange={(e) =>
            setFormData({ ...formData, checkOut: e.target.value })
          }
          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      <div>
        <label className="block text-slate-500 mb-1">Status</label>
        <select
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value })
          }
          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="Present">Present</option>
          <option value="Late">Late</option>
          <option value="Absent">Absent</option>
        </select>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
