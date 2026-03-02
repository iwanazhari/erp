import { useState } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
};

export default function TimePicker24({ value, onChange, label }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Parse current value with fallback
  const timeParts = (value || '00:00').split(':');
  const hours = parseInt(timeParts[0] || '0', 10);
  const minutes = parseInt(timeParts[1] || '0', 10);

  // Generate hours (0-23)
  const hours24 = Array.from({ length: 24 }, (_, i) => i);
  
  // Generate minutes (0-59)
  const minutes60 = Array.from({ length: 60 }, (_, i) => i);

  const handleSelect = (h: number, m: number) => {
    const newHours = h.toString().padStart(2, '0');
    const newMinutes = m.toString().padStart(2, '0');
    onChange(`${newHours}:${newMinutes}`);
    setIsOpen(false);
  };

  // Format display time
  const displayTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      
      {/* Display/Input Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-left hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <span className="text-lg font-mono font-semibold text-slate-800">
          {displayTime}
        </span>
        <span className="text-xs text-slate-500 ml-2">(WIB)</span>
      </button>

      {/* Dropdown Picker */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Picker Modal */}
          <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 p-4 w-full max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-700">Pilih Waktu</h4>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Hours */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">
                  Jam (0-23)
                </label>
                <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2">
                  {hours24.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleSelect(h, minutes)}
                      className={`px-2 py-2 text-sm rounded transition-colors ${
                        hours === h
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-slate-50 hover:bg-blue-50 text-slate-700'
                      }`}
                    >
                      {h.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minutes */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">
                  Menit (0-59)
                </label>
                <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2">
                  {minutes60.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelect(hours, m)}
                      className={`px-2 py-2 text-sm rounded transition-colors ${
                        minutes === m
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-slate-50 hover:bg-blue-50 text-slate-700'
                      }`}
                    >
                      {m.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Select Buttons */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <label className="block text-xs font-medium text-slate-500 mb-2">
                Pilihan Cepat:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '08:00', h: 8, m: 0 },
                  { label: '09:00', h: 9, m: 0 },
                  { label: '10:00', h: 10, m: 0 },
                  { label: '13:00', h: 13, m: 0 },
                  { label: '14:00', h: 14, m: 0 },
                  { label: '15:00', h: 15, m: 0 },
                  { label: '16:00', h: 16, m: 0 },
                  { label: '17:00', h: 17, m: 0 },
                ].map((time) => (
                  <button
                    key={time.label}
                    type="button"
                    onClick={() => handleSelect(time.h, time.m)}
                    className="px-2 py-1.5 text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded transition-colors font-medium"
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Time Button */}
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const options: Intl.DateTimeFormatOptions = {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                  timeZone: 'Asia/Jakarta'
                };
                const timeStr = new Intl.DateTimeFormat('id-ID', options).format(now);
                const [h, m] = timeStr.split(':').map(Number);
                handleSelect(h, m);
              }}
              className="mt-3 w-full px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Gunakan Waktu Sekarang
            </button>
          </div>
        </>
      )}
    </div>
  );
}
