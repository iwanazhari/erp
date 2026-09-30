import React, { useState, useEffect, useCallback } from 'react';
import overtimeApi from '../../../services/overtimeApi';
import type { OvertimeRequest } from '../../../services/overtimeApi';
import { useAuth } from '../../../shared/AuthContext';

const PAGE_SIZE = 20;

const statusMeta: Record<OvertimeRequest['status'], { label: string; badge: string }> = {
  PENDING: { label: 'Menunggu', badge: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'Disetujui', badge: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Ditolak', badge: 'bg-red-100 text-red-800' },
};

const fmtDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

const fmtDateTime = (d?: string) =>
  d
    ? new Date(d).toLocaleString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '-';

const DetailModal: React.FC<{ request: OvertimeRequest; onClose: () => void }> = ({ request, onClose }) => {
  const rows: Array<[string, string]> = [
    ['Karyawan', request.user?.name || '-'],
    ['Tanggal', fmtDate(request.date)],
    ['Durasi', `${request.hours} jam`],
    ['Alasan', request.reason],
    ['Catatan', request.note || '-'],
    ['Status', statusMeta[request.status]?.label || request.status],
    ['Diajukan', fmtDateTime(request.createdAt)],
    ['Disetujui oleh', request.approvedBy ? fmtDateTime(request.approvedAt) : '-'],
  ];
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Detail Lembur</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-4 space-y-3">
          {rows.map(([label, value]) => (
            <div key={label}>
              <div className="text-xs text-gray-500">{label}</div>
              <div className="text-sm text-gray-900">{value}</div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

const EditModal: React.FC<{ request: OvertimeRequest; onClose: () => void; onSaved: () => void }> = ({
  request, onClose, onSaved,
}) => {
  const [form, setForm] = useState({
    date: request.date.slice(0, 10),
    hours: request.hours,
    reason: request.reason,
    note: request.note || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await overtimeApi.updateOvertime(request.id, form);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengubah lembur');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <form className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Edit Lembur</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durasi</label>
            <input
              type="text"
              inputMode="numeric"
              value={form.hours}
              onChange={(e) => setForm({ ...form, hours: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: 6:30"
              pattern="^\d{1,2}(:\d{1,2})?$"
              title="Format jam:menit, contoh 6:30 atau 6"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Format jam:menit — 6:30 berarti 6 jam 30 menit</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alasan</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Opsional"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Batal
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
        </form>
      </div>
  );
};

export const OvertimeList: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<OvertimeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | OvertimeRequest['status']>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalHours, setTotalHours] = useState('0:00');
  const [actingId, setActingId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OvertimeRequest | null>(null);
  const [editing, setEditing] = useState<OvertimeRequest | null>(null);

  const canManage = ['HR', 'ADMIN'].includes(user?.role || '');

  const fetchOvertimeRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = await overtimeApi.getOvertimeRequests({
        page,
        pageSize: PAGE_SIZE,
        status: filter === 'all' ? undefined : filter,
      });
      setItems(result.data || []);
      setTotal(result.total || 0);
      setTotalHours(result.totalHours || '0:00');
      setTotalPages(result.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengambil data lembur');
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchOvertimeRequests();
  }, [fetchOvertimeRequests]);

  const handleStatus = async (id: string, action: 'approve' | 'reject') => {
    if (!confirm(`Apakah Anda yakin ingin ${action === 'approve' ? 'menyetujui' : 'menolak'} permintaan lembur ini?`)) return;
    setActingId(id);
    setError('');
    try {
      if (action === 'approve') await overtimeApi.approveOvertime(id);
      else await overtimeApi.rejectOvertime(id);
      await fetchOvertimeRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || `Gagal ${action === 'approve' ? 'menyetujui' : 'menolak'} lembur`);
    } finally {
      setActingId(null);
    }
  };

  const handleDelete = async (request: OvertimeRequest) => {
    if (!confirm(`Hapus lembur ${request.user?.name || ''} tanggal ${fmtDate(request.date)}?`)) return;
    setActingId(request.id);
    setError('');
    try {
      await overtimeApi.deleteOvertime(request.id);
      await fetchOvertimeRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menghapus lembur');
    } finally {
      setActingId(null);
    }
  };

  const goToPage = (p: number) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  return (
    <>
    <div className="space-y-6">
      {/* Total */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 inline-flex gap-8">
        <div>
          <div className="text-sm text-gray-500">Total Permintaan</div>
          <div className="text-2xl font-bold text-gray-900">{total}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Total Durasi</div>
          <div className="text-2xl font-bold text-gray-900">{totalHours} jam</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['all', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => { setFilter(status); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === status
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {status === 'all' ? 'Semua' : statusMeta[status].label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Karyawan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Durasi</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Alasan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Catatan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Diajukan</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Memuat data...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    Tidak ada permintaan lembur
                  </td>
                </tr>
              ) : (
                items.map((request, idx) => {
                  const meta = statusMeta[request.status];
                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{request.user?.name || '-'}</div>
                        <div className="text-xs text-gray-500">{request.user?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(request.date).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{request.hours} jam</td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{request.reason}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{request.note || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2 flex-wrap">
                          <button
                            onClick={() => setDetail(request)}
                            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200"
                          >
                            Detail
                          </button>
                          {canManage && (
                            <>
                              <button
                                onClick={() => setEditing(request)}
                                disabled={actingId !== null}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(request)}
                                disabled={actingId !== null}
                                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actingId === request.id ? '...' : 'Hapus'}
                              </button>
                            </>
                          )}
                          {request.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatus(request.id, 'approve')}
                                disabled={actingId !== null}
                                className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actingId === request.id ? '...' : 'Setujui'}
                              </button>
                              <button
                                onClick={() => handleStatus(request.id, 'reject')}
                                disabled={actingId !== null}
                                className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actingId === request.id ? '...' : 'Tolak'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Halaman {page} dari {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || loading}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
      </div>

      {detail && <DetailModal request={detail} onClose={() => setDetail(null)} />}
      {editing && (
        <EditModal
          request={editing}
          onClose={() => setEditing(null)}
          onSaved={fetchOvertimeRequests}
        />
      )}
    </>
  );
};

export default OvertimeList;
