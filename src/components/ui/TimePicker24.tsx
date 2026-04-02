import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
};

/**
 * TimePicker24 Component
 * Simple and clean time picker using react-time-picker
 * Format: HH:mm (24-hour format)
 */
export default function TimePicker24({ value, onChange, label }: Props) {
  const parseTimeValue = (timeValue: string | Date | null): string | null => {
    if (!timeValue) return null;

    const date = typeof timeValue === 'string'
      ? new Date(`2000-01-01T${timeValue}`)
      : timeValue;

    if (isNaN(date.getTime())) return null;

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleChange = (timeValue: string | Date | null) => {
    const parsed = parseTimeValue(timeValue);
    if (parsed) {
      onChange(parsed);
    }
  };

  const getDateValue = (): Date | null => {
    if (!value) return null;
    const date = new Date(`2000-01-01T${value}`);
    return isNaN(date.getTime()) ? null : date;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div className="w-full relative">
        <TimePicker
          onChange={handleChange}
          value={getDateValue()}
          format="HH:mm"
          clearIcon={null}
          disableClock={false}
          openClockOnFocus={true}
          className="w-full [&_.react-time-picker__inputGroup]:border [&_.react-time-picker__inputGroup]:border-slate-300 [&_.react-time-picker__inputGroup]:rounded-lg [&_.react-time-picker__inputGroup]:focus-within:ring-2 [&_.react-time-picker__inputGroup]:focus-within:ring-blue-500"
        />
      </div>
    </div>
  );
}
