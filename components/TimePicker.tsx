'use client'

export interface TimeValue {
  hour: string    // '1'–'12'
  minute: string  // '00','05',…,'55'
  period: 'AM' | 'PM'
}

/** Convert a Date to a TimeValue (minutes rounded to nearest 5) */
export function dateToTimeValue(date: Date): TimeValue {
  let h = date.getHours()
  const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  const rawMin = date.getMinutes()
  const roundedMin = Math.min(55, Math.round(rawMin / 5) * 5)
  return { hour: String(h), minute: String(roundedMin).padStart(2, '0'), period }
}

/** Convert a TimeValue to a 24h "HH:MM" string for Date construction */
export function timeValueTo24h({ hour, minute, period }: TimeValue): string {
  let h = parseInt(hour)
  if (period === 'AM' && h === 12) h = 0
  if (period === 'PM' && h !== 12) h += 12
  return `${String(h).padStart(2, '0')}:${minute}`
}

const HOURS = ['1','2','3','4','5','6','7','8','9','10','11','12']
const MINUTES = ['00','05','10','15','20','25','30','35','40','45','50','55']

const selectStyle: React.CSSProperties = {
  background: 'var(--bg-input)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  color: 'var(--text-1)',
  fontFamily: 'inherit',
  fontWeight: 700,
  fontSize: 14,
  padding: '10px 4px',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
  textAlign: 'center',
  minHeight: 44,
}

interface Props {
  value: TimeValue
  onChange: (v: TimeValue) => void
  disabled?: boolean
}

export default function TimePicker({ value, onChange, disabled }: Props) {
  const togglePeriod = () =>
    onChange({ ...value, period: value.period === 'AM' ? 'PM' : 'AM' })

  return (
    <div className="flex items-center gap-1 w-full" style={{ opacity: disabled ? 0.4 : 1 }}>
      {/* Hour */}
      <select
        value={value.hour}
        onChange={(e) => onChange({ ...value, hour: e.target.value })}
        disabled={disabled}
        style={{ ...selectStyle, flex: 1, minWidth: 0 }}
      >
        {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
      </select>

      <span className="font-bold flex-shrink-0" style={{ color: 'var(--text-3)', fontSize: 13 }}>:</span>

      {/* Minute */}
      <select
        value={value.minute}
        onChange={(e) => onChange({ ...value, minute: e.target.value })}
        disabled={disabled}
        style={{ ...selectStyle, flex: 1, minWidth: 0 }}
      >
        {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>

      {/* AM/PM single-tap toggle */}
      <button
        type="button"
        disabled={disabled}
        onClick={togglePeriod}
        style={{
          ...selectStyle,
          width: 42,
          flexShrink: 0,
          background: 'var(--accent)',
          color: '#09090b',
          border: 'none',
          borderRadius: 'var(--radius)',
        }}
      >
        {value.period}
      </button>
    </div>
  )
}
