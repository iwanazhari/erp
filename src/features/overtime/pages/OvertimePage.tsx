import React, { useState } from 'react';
import { RequestOvertimeForm } from '../components/RequestOvertimeForm';
import { OvertimeList } from '../components/OvertimeList';
import { useAuth } from '../../../shared/AuthContext';
import type { Role } from '../../../modules/auth/types';

const OvertimePage: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'list' | 'request'>('list');
  const [requestForOthers, setRequestForOthers] = useState(false);

  // Check user role - convert to lowercase for consistency
  const role = (user?.role?.toLowerCase() || '') as Role;
  
  // Manager, HR, Admin can request for others
  const canRequest = ['employee', 'manager', 'hr', 'admin'].includes(role);
  const canRequestForOthers = ['manager', 'hr', 'admin'].includes(role);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Lembur</h1>
          <p className="text-gray-500 mt-1">Kelola permintaan lembur karyawan</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setView('list');
              setRequestForOthers(false);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Daftar Lembur
          </button>

          {canRequest && (
            <button
              onClick={() => {
                setView('request');
                setRequestForOthers(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'request' && !requestForOthers
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ajukan Lembur
            </button>
          )}

          {canRequestForOthers && (
            <button
              onClick={() => {
                setView('request');
                setRequestForOthers(true);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'request' && requestForOthers
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ajukan untuk Karyawan
            </button>
          )}
        </div>
      </div>

      {view === 'request' ? (
        <div className="max-w-2xl">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {requestForOthers ? 'Ajukan Lembur untuk Karyawan' : 'Ajukan Permintaan Lembur'}
            </h2>
            <RequestOvertimeForm 
              requestForOthers={requestForOthers}
              onSuccess={() => setView('list')} 
            />
          </div>
        </div>
      ) : (
        <OvertimeList />
      )}
    </div>
  );
};

export default OvertimePage;
