import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { TimeEntry } from '@/lib/db/models/TimeEntry'
import { getSession } from '@/lib/auth'
import { generateDailyInsights, WeekContext } from '@/lib/analytics/insights'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  await connectDB()

  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  // Past 7 days before the requested date for cross-day context
  const contextEnd = new Date(start.getTime() - 1)
  const contextStart = new Date(start)
  contextStart.setDate(contextStart.getDate() - 7)
  contextStart.setHours(0, 0, 0, 0)

  const [entries, weekEntries] = await Promise.all([
    TimeEntry.find({ userId: session.userId, startTime: { $gte: start, $lte: end } }),
    TimeEntry.find({
      userId: session.userId,
      startTime: { $gte: contextStart, $lte: contextEnd },
      endTime: { $ne: null },
    }).sort({ startTime: 1 }),
  ])

  // Build per-day week context
  const byDay: Record<string, { total: number; distraction: number }> = {}
  for (const e of weekEntries) {
    const day = e.startTime.toISOString().split('T')[0]
    if (!byDay[day]) byDay[day] = { total: 0, distraction: 0 }
    byDay[day].total += e.duration
    if (e.category === 'distraction' || e.category === 'social-media') {
      byDay[day].distraction += e.duration
    }
  }

  const sortedDays = Object.keys(byDay).sort()
  const weekContext: WeekContext | undefined = sortedDays.length >= 2
    ? {
        dailyMinutes: sortedDays.map((d) => byDay[d].total),
        dailyDistractions: sortedDays.map((d) => byDay[d].distraction),
      }
    : undefined

  const insights = generateDailyInsights(entries, weekContext)
  return NextResponse.json({ insights })
}
