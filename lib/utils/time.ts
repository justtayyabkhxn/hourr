export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function formatDurationLong(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} minutes`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (m === 0) return `${h} hour${h !== 1 ? 's' : ''}`
  return `${h}h ${m}m`
}

export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatTimeInput(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function daysInRange(start: Date, end: Date): Date[] {
  const days: Date[] = []
  const current = new Date(start)
  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return days
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function percentOfDay(minutes: number): number {
  return (minutes / 1440) * 100
}
