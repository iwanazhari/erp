import { useState, useEffect } from "react";
import AttendanceViewMode from "@/components/ui/AttendanceViewMode";
import AttendanceForm from "@/components/attendance/AttendanceForm";
import AuditPanel from "@/components/ui/AuditPanel";
import EmptyState from "@/components/ui/EmptyState";
import { useAuditLogs } from "@/modules/attendance/hooks";
import { useUser } from "@/shared/UserContext";
import type { Attendance } from "@/modules/attendance/types";

type Props = {
  selectedAttendance: Attendance | null;
  mode: "view" | "edit";
  onClose: () => void;
  onEdit: () => void;
  onSave: (updated: Attendance) => void;
  isSaving?: boolean;
  canEdit?: boolean;
  notFound?: boolean;
};

export default function AttendanceDrawer({
  selectedAttendance,
  mode,
  onClose,
  onEdit,
  onSave,
  isSaving = false,
  canEdit = true,
  notFound = false,
}: Props) {
  const { canViewAudit } = useUser();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"detail" | "audit">("detail");

  // Fetch audit logs when selectedAttendance changes
  const { data: auditLogs, isLoading: isLoadingAudit } = useAuditLogs(
    selectedAttendance?.id ?? null
  );

  useEffect(() => {
    if (selectedAttendance) {
      setIsVisible(true);
      setActiveTab("detail"); // Reset to detail tab on open
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedAttendance]);

  if (!isVisible && !selectedAttendance) return null;

  const showAuditTab = canViewAudit;

  return (
    <>
      {/* Overlay with blur effect */}
      {selectedAttendance && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          selectedAttendance ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="border-b border-slate-200">
          <div className="flex justify-between items-center p-6">
            <h2 className="text-lg font-semibold text-slate-800">
              Attendance Detail
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-6 gap-4 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("detail")}
              className={`pb-3 text-sm font-medium transition relative ${
                activeTab === "detail"
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Detail
              {activeTab === "detail" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
              )}
            </button>
            {showAuditTab && (
              <button
                onClick={() => setActiveTab("audit")}
                className={`pb-3 text-sm font-medium transition relative ${
                  activeTab === "audit"
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Audit History
                {auditLogs && auditLogs.length > 0 && (
                  <span className="ml-2 text-xs bg-slate-200 px-2 py-0.5 rounded-full">
                    {auditLogs.length}
                  </span>
                )}
                {activeTab === "audit" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 140px)" }}>
          {notFound ? (
            <EmptyState
              title="Record not found"
              description="This attendance record may have been deleted or does not exist."
              customIcon={
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              action={
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-sm"
                >
                  Close
                </button>
              }
            />
          ) : selectedAttendance ? (
            <>
              {activeTab === "detail" && (
                <>
                  <div className="flex justify-end mb-4">
                    {mode === "view" && canEdit && (
                      <button
                        onClick={onEdit}
                        className="text-sm px-3 py-1 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {mode === "edit" ? (
                    <AttendanceForm
                      data={selectedAttendance}
                      onSave={onSave}
                      onCancel={onClose}
                      isSaving={isSaving}
                    />
                  ) : (
                    <AttendanceViewMode data={selectedAttendance} />
                  )}
                </>
              )}

              {activeTab === "audit" && (
                <AuditPanel logs={auditLogs ?? []} isLoading={isLoadingAudit} />
              )}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
