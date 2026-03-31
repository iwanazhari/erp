import { useState, useCallback } from 'react';
import { useLeaves, useUpdateLeave, useDeleteLeave } from '@/features/leave/hooks/useLeave';
import {
  LeaveTable,
  LeaveFilters,
  LeaveEditModal,
  LeaveHistoryModal,
} from '@/features/leave/components';
import type { Leave, LeaveFilters as LeaveFiltersType, LeaveStatus, LeaveApprovalStatus } from '@/shared/types/leave';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Leave Management Page Component
 *
 * Displays all leave requests with filters and actions.
 * Admin/Manager only - can view, edit, approve/reject, and delete leave requests.
 *
 * Features:
 * - View all leave requests
 * - Filter by type, status, date range
 * - Edit leave request (with audit trail)
 * - Approve/Reject leave requests
 * - Delete leave requests (Admin only)
 * - View edit history
 */
export default function LeavePage() {
  const [filters, setFilters] = useState<LeaveFiltersType>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const {
    data,
    isLoading,
    error,
  } = useLeaves(filters);

  const updateLeave = useUpdateLeave();
  const deleteLeave = useDeleteLeave();

  const handleFilterChange = useCallback((newFilters: LeaveFiltersType) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleViewDetails = useCallback((leave: Leave) => {
    setSelectedLeave(leave);
    // Could open a details modal here if needed
    console.log('View details:', leave);
  }, []);

  const handleEdit = useCallback((leave: Leave) => {
    setSelectedLeave(leave);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedLeave(null);
  }, []);

  const handleSaveEdit = useCallback(async (editData: {
    status?: LeaveStatus;
    leaveReason?: string;
    leaveFileUrl?: string;
    leaveStatus?: LeaveApprovalStatus;
    date?: string;
    editReason: string;
  }) => {
    if (!selectedLeave) return;

    try {
      await updateLeave.mutateAsync({
        leaveId: selectedLeave.id,
        updateData: editData,
      });
      
      // Close modal on success
      handleCloseEditModal();
      
      // Show success message
      alert('Leave request updated successfully!');
    } catch (error) {
      console.error('Failed to update leave:', error);
      alert('Failed to update leave. Please try again.');
    }
  }, [selectedLeave, updateLeave, handleCloseEditModal]);

  const handleDelete = useCallback((leave: Leave) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this leave request?\n\nEmployee: ${leave.user.name}\nDate: ${new Date(leave.date).toLocaleDateString('id-ID')}\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    deleteLeave.mutate(leave.id, {
      onSuccess: () => {
        alert('Leave request deleted successfully!');
      },
      onError: (error) => {
        console.error('Failed to delete leave:', error);
        alert(`Failed to delete leave: ${error instanceof Error ? error.message : 'Unknown error'}`);
      },
    });
  }, [deleteLeave]);

  const handleViewHistory = useCallback((leave: Leave) => {
    setSelectedLeave(leave);
    setIsHistoryModalOpen(true);
  }, []);

  const handleCloseHistoryModal = useCallback(() => {
    setIsHistoryModalOpen(false);
    setSelectedLeave(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola pengajuan cuti/izin/sakit karyawan (Admin/Manager only)
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error instanceof Error ? error.message : 'Terjadi kesalahan'}</p>
          </div>
        )}

        {/* Filters */}
        <LeaveFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
        />

        {/* Stats Summary */}
        {data?.pagination && (
          <div className="mb-4 bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Menampilkan <span className="font-semibold text-gray-900">{data.leaves.length}</span> dari{' '}
                <span className="font-semibold text-gray-900">{data.pagination.totalItems}</span> total leave requests
              </div>
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {data.leaves.filter((l: Leave) => l.leaveStatus === 'PENDING').length}
                  </p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {data.leaves.filter((l: Leave) => l.leaveStatus === 'APPROVED').length}
                  </p>
                  <p className="text-xs text-gray-600">Approved</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {data.leaves.filter((l: Leave) => l.leaveStatus === 'REJECTED').length}
                  </p>
                  <p className="text-xs text-gray-600">Rejected</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <LeaveTable
          leaves={data?.leaves || []}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewHistory={handleViewHistory}
        />

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(data.pagination.currentPage - 1)}
              disabled={data.pagination.currentPage <= 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700 flex items-center">
              Page {data.pagination.currentPage} of {data.pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(data.pagination.currentPage + 1)}
              disabled={data.pagination.currentPage >= data.pagination.totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <LeaveEditModal
        leave={selectedLeave}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
        isLoading={updateLeave.isPending}
      />

      {/* History Modal */}
      <LeaveHistoryModal
        history={null} // Will be fetched when modal opens
        isOpen={isHistoryModalOpen}
        onClose={handleCloseHistoryModal}
      />
    </div>
  );
}
