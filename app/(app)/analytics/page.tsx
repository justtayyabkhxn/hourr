import { getSession } from '@/lib/auth'
import { connectDB } from '@/lib/db/mongoose'
import { TimeEntry } from '@/lib/db/models/TimeEntry'
import { startOfDay } from '@/lib/utils/time'
import AnalyticsClient from './AnalyticsClient'

export default async function AnalyticsPage() {
  const session = await getSession()
  if (!session) return null

  await connectDB()

  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(now.getDate() - 6)
  weekAgo.setHours(0, 0, 0, 0)

  const entries = await TimeEntry.find({
    userId: session.userId,
    startTime: { $gte: weekAgo, $lte: now },
    endTime: { $ne: null },
  }).sort({ startTime: 1 })

  // Group by day
  const byDay: Record<string, number> = {}
  const byCat: Record<string, number> = {}
  const byHour: Record<number, number> = {}

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekAgo)
    d.setDate(weekAgo.getDate() + i)
    byDay[d.toISOString().split('T')[0]] = 0
  }

  for (const e of entries) {
    const day = e.startTime.toISOString().split('T')[0]
    byDay[day] = (byDay[day] ?? 0) + e.duration
    byCat[e.category] = (byCat[e.category] ?? 0) + e.duration
    const hour = new Date(e.startTime).getHours()
    byHour[hour] = (byHour[hour] ?? 0) + e.duration
  }

  const totalMinutes = Object.values(byCat).reduce((s, v) => s + v, 0)

  return (
    <AnalyticsClient
      byDay={byDay}
      byCategory={byCat}
      byHour={byHour}
      totalMinutes={totalMinutes}
      entryCount={entries.length}
    />
  )
}
