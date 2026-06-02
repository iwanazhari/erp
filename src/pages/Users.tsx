import { useState, useEffect, useCallback } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import ModalShell from '@/components/ui/ModalShell';
import FormField from '@/components/ui/FormField';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import userApi, { type UserOption, type UserWithBalance } from '@/services/userApi';
import { useAuth } from '@/shared/AuthContext';

const ROLE_OPTIONS = [
  'ADMIN', 'HR', 'MANAGER', 'EMPLOYEE', 'TECHNICIAN',
  'TECHNICIAN_PAYMENT', 'ACCOUNTANT', 'MARKETING', 'SALES', 'FINANCE',
];

type UserFormData = {
  name: string;
  email: string;
  password: string;
  role: string;
  division: string;
  phone: string;
};

const emptyForm: UserFormData = {
  name: '',
  email: '',
  password: '',
  role: 'EMPLOYEE',
  division: '',
  phone: '',
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 50;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserOption | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Detail modal state
  const [detailUser, setDetailUser] = useState<UserWithBalance | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<UserOption | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userApi.getAllUsers({ q: search, p: page, l: pageSize });
      const list = userApi.extractUsers(res);
      // Sort A-Z by name
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setUsers(list);
      // Try to extract total from response
      if (res.data && typeof res.data === 'object' && 'pagination' in res.data) {
        const pagination = (res.data as any).pagination;
        setTotal(pagination?.total ?? list.length);
      } else {
        setTotal(res.total ?? list.length);
      }
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      else fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- Modal handlers ----------
  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (user: UserOption) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // password not prefilled for security
      role: user.role || 'EMPLOYEE',
      division: user.division || '',
      phone: user.phone || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setFormData(emptyForm);
    setFormError('');
  };

  const handleFormChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validate
    if (!formData.name.trim()) { setFormError('Name is required'); return; }
    if (!formData.email.trim()) { setFormError('Email is required'); return; }
    if (!editingUser && !formData.password) { setFormError('Password is required for new users'); return; }
    if (!formData.role) { setFormError('Role is required'); return; }

    setSaving(true);
    setFormError('');

    try {
      if (editingUser) {
        const payload: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          division: formData.division || null,
          phone: formData.phone || null,
        };
        if (formData.password) {
          payload.password = formData.password;
        }
        await userApi.updateUser(editingUser.id, payload);
      } else {
        await userApi.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          division: formData.division || undefined,
          phone: formData.phone || undefined,
        });
      }
      closeModal();
      fetchUsers();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Delete handler ----------
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await userApi.deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to delete user:', err);
    } finally {
      setDeleting(false);
    }
  };

  const openDetailModal = async (user: UserOption) => {
    setDetailLoading(true);
    setDetailUser(null);
    try {
      const res = await userApi.getUserById(user.id);
      if (res.success) {
        // Backend spreads user fields at root level, extract them
        const { success, message, ...userData } = res;
        setDetailUser(userData as UserWithBalance);
      } else {
        // Fallback: tampilkan data dari list jika API gagal
        setDetailUser({
          ...user,
          latestAttendance: { clockIn: null, clockOut: null },
          latestLeaveBalance: null,
        });
      }
    } catch (err) {
      console.error('Failed to fetch user detail:', err);
      setDetailUser({
        ...user,
        latestAttendance: { clockIn: null, clockOut: null },
        latestLeaveBalance: null,
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setDetailUser(null);
  };

  const canManage = currentUser?.role === 'ADMIN' || currentUser?.role === 'HR';

  const columns: Column<UserOption>[] = [
    { header: 'No', accessor: 'id' as any, cell: (_val, _row) => users.indexOf(_row) + 1 },
    { header: 'Nama', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role' },
    {
      header: 'Actions',
      accessor: 'id' as any,
      cell: (_val, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e?.stopPropagation?.(); openDetailModal(row); }}
          >
            Detail
          </Button>
          {canManage && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e?.stopPropagation?.(); openEditModal(row); }}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => { e?.stopPropagation?.(); setDeleteTarget(row); }}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="User Management"
      subtitle={canManage ? 'Manage all users' : 'User list'}
      actions={
        canManage && (
          <Button variant="primary" onClick={openCreateModal}>
            + Add User
          </Button>
        )
      }
    >
      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading data...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {search ? 'No users match your search' : 'No users yet'}
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={users} />
          {total > pageSize && (
            <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
              <span>Total: {total} users</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span>Page {page}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page * pageSize >= total}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <ModalShell
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingUser ? 'Edit User' : 'Add New User'}
        size="lg"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingUser ? 'Save' : 'Create User'}
            </Button>
          </div>
        }
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {formError}
          </div>
        )}

        <div className="space-y-4">
          <FormField label="Name" required>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Full name"
            />
          </FormField>

          <FormField label="Email" required>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="email@example.com"
            />
          </FormField>

          <FormField
            label="Password"
            required={!editingUser}
            hint={editingUser ? 'Leave blank to keep current password' : undefined}
          >
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleFormChange('password', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder={editingUser ? 'Leave blank if unchanged' : 'Minimum 6 characters'}
            />
          </FormField>

          <FormField label="Role" required>
            <select
              value={formData.role}
              onChange={(e) => handleFormChange('role', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Division">
            <input
              type="text"
              value={formData.division}
              onChange={(e) => handleFormChange('division', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="e.g. IT, Finance, HR"
            />
          </FormField>

          <FormField label="Phone">
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleFormChange('phone', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="08xxxxxxxxxx"
            />
          </FormField>
        </div>
      </ModalShell>

      {/* Detail Modal */}
      <ModalShell
        isOpen={detailUser !== null || detailLoading}
        onClose={closeDetailModal}
        title="User Detail"
        size="lg"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={closeDetailModal}>
              Close
            </Button>
          </div>
        }
      >
        {detailLoading ? (
          <div className="text-center py-12 text-slate-500">Loading user detail...</div>
        ) : detailUser ? (
          <div className="space-y-6">
            {/* User Info */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Informasi User
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400">Nama</label>
                  <p className="text-sm font-medium text-slate-800">{detailUser.name}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Email</label>
                  <p className="text-sm font-medium text-slate-800">{detailUser.email}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Role</label>
                  <p className="text-sm font-medium text-slate-800">{detailUser.role}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Divisi</label>
                  <p className="text-sm font-medium text-slate-800">{detailUser.division || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Phone</label>
                  <p className="text-sm font-medium text-slate-800">{detailUser.phone || '-'}</p>
                </div>
              </div>
            </div>

            {/* Leave Balance */}
            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Sisa SID & Cuti
              </h3>
              {detailUser.latestLeaveBalance ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <label className="text-xs text-purple-500 font-medium">Sisa SID</label>
                    <p className="text-2xl font-bold text-purple-700 mt-1">
                      {detailUser.latestLeaveBalance.sidRemaining}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-purple-500">
                      <span>Terpakai: {detailUser.latestLeaveBalance.sidTaken}</span>
                      <span>Periode: {detailUser.latestLeaveBalance.month}/{detailUser.latestLeaveBalance.year}</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <label className="text-xs text-blue-500 font-medium">Sisa Cuti</label>
                    <p className="text-2xl font-bold text-blue-700 mt-1">
                      {detailUser.latestLeaveBalance.cutiRemaining}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-blue-500">
                      <span>Terpakai: {detailUser.latestLeaveBalance.cutiTaken}</span>
                      <span>Periode: {detailUser.latestLeaveBalance.month}/{detailUser.latestLeaveBalance.year}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-400 italic">
                  Belum ada data SID & Cuti. Data akan muncul setelah laporan bulanan diimport.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </ModalShell>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete User"
        message={`Are you sure you want to delete user "${deleteTarget?.name}" (${deleteTarget?.email})? This action cannot be undone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Yes, Delete'}
        cancelLabel="Cancel"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => { if (!deleting) setDeleteTarget(null); }}
      />
    </PageContainer>
  );
}
