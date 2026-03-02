import { useState, useEffect } from "react";
import type { Attendance } from "@/modules/attendance/types";

type Props = {
  data: Attendance;
  onSave: (data: Attendance) => void;
  onCancel: () => void;
  isSaving?: boolean;
};

export default function AttendanceForm({
  data,
  onSave,
  onCancel,
  isSaving = false,
}: Props) {
  const [formData, setFormData] = useState<Attendance>({ ...data });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Listen for Ctrl+S save event
  useEffect(() => {
    const handleSaveEvent = () => {
      if (!isSaving) {
        onSave(formData);
      }
    };

    window.addEventListener("attendance-save", handleSaveEvent as EventListener);
    return () =>
      window.removeEventListener("attendance-save", handleSaveEvent as EventListener);
  }, [formData, onSave, isSaving]);

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
          disabled={isSaving}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-50"
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
          disabled={isSaving}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-50"
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
          disabled={isSaving}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-50"
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
          disabled={isSaving}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-50"
        />
      </div>

      <div>
        <label className="block text-slate-500 mb-1">Status</label>
        <select
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value as "Present" | "Late" | "Absent" })
          }
          disabled={isSaving}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-50"
        >
          <option value="Present">Present</option>
          <option value="Late">Late</option>
          <option value="Absent">Absent</option>
        </select>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving && (
            <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
          )}
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
