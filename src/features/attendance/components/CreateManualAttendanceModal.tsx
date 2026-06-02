import { useState, useEffect } from 'react';
import { useCreateOrUpdateAttendance } from '@/features/attendance/hooks/useCreateOrUpdateAttendance';
import { privateApi } from '@/services/authApi';

interface CreateManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  userId: string;
  userName: string;
  date: string;
  clockIn: string;
  status: 'HADIR' | 'TERLAMBAT';
  editReason: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function CreateManualAttendanceModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateManualAttendanceModalProps) {
  const [formData, setFormData] = useState<FormData>({
    userId: '',
    userName: '',
    date: new Date().toISOString().split('T')[0],
    clockIn: '08:00',
    status: 'HADIR',
    editReason: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const createMutation = useCreateOrUpdateAttendance();

  // Auto-calculate status based on clock-in time
  useEffect(() => {
    const [hours, minutes] = formData.clockIn.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const lateThreshold = 9 * 60 + 15; // 09:15
    
    if (totalMinutes > lateThreshold) {
      setFormData(prev => ({ ...prev, status: 'TERLAMBAT' }));
    } else {
      setFormData(prev => ({ ...prev, status: 'HADIR' }));
    }
  }, [formData.clockIn]);

  // Fetch users when search query changes
  useEffect(() => {
    if (searchQuery.length >= 2 && isOpen) {
      const timeoutId = setTimeout(async () => {
        setIsLoading(true);
        try {
          const response = await privateApi.get('/user', {
            params: { q: searchQuery, page: 1, limit: 10 }
          });
          
          const usersData = response.data?.data?.users || 
                           response.data?.data?.data?.users || 
                           response.data?.users || 
                           response.data?.data || 
                           [];
          
          setUsers(Array.isArray(usersData) ? usersData : []);
          setShowSuggestions(usersData.length > 0);
        } catch (error) {
          console.error('Error fetching users:', error);
          setUsers([]);
          setShowSuggestions(false);
        } finally {
          setIsLoading(false);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setUsers([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, isOpen]);

  const handleSelectUser = (user: User) => {
    setFormData({
      ...formData,
      userId: user.id,
      userName: `${user.name} (${user.email})`,
    });
    setSearchQuery(`${user.name} (${user.email})`);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId || !formData.date || !formData.editReason) {
      alert('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    try {
      await createMutation.mutateAsync({
        userId: formData.userId,
        date: formData.date,
        attendanceData: {
          clockIn: new Date(`${formData.date}T${formData.clockIn}:00`).toISOString(),
          status: formData.status,
          editReason: formData.editReason,
        },
      });

      alert('Attendance berhasil dibuat!');
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Gagal membuat attendance';
      alert(`Error: ${errorMessage}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Buat Attendance Manual</h2>
        <p className="text-sm text-gray-600 mb-4">
          Buat record clock-in untuk user yang belum absen karena masalah teknis
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama User / Email *
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setFormData({ ...formData, userId: '', userName: '' });
              }}
              onFocus={() => {
                if (users.length > 0) setShowSuggestions(true);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Ketik minimal 2 karakter untuk mencari..."
              autoComplete="off"
              required
            />
            {isLoading && (
              <div className="absolute right-3 top-10 text-gray-400">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
            
            {showSuggestions && users.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="px-4 py-3 cursor-pointer hover:bg-indigo-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      {user.role && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {user.role}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {formData.userId && (
              <div className="mt-2 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Terpilih: {formData.userName}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jam Masuk *
            </label>
            <input
              type="time"
              value={formData.clockIn}
              onChange={(e) => setFormData({ ...formData, clockIn: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Status akan otomatis: HADIR jika ≤ 09:15, TERLAMBAT jika &gt; 09:15
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className={`px-3 py-2 rounded-lg border ${
              formData.status === 'HADIR' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <span className="font-semibold">{formData.status}</span>
              {formData.status === 'TERLAMBAT' && (
                <span className="ml-2 text-xs">(!)</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alasan Pembuatan Manual *
            </label>
            <textarea
              value={formData.editReason}
              onChange={(e) => setFormData({ ...formData, editReason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Contoh: User tidak bisa absen karena aplikasi bermasalah"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !formData.userId}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
