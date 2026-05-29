import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { TimeEntry } from '@/lib/db/models/TimeEntry'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? 'week' // week | month

  await connectDB()

  const now = new Date()
  let start: Date

  if (period === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
  } else {
    // week — last 7 days
    start = new Date(now)
    start.setDate(now.getDate() - 6)
    start.setHours(0, 0, 0, 0)
  }

  const entries = await TimeEntry.find({
    userId: session.userId,
    startTime: { $gte: start, $lte: now },
    endTime: { $ne: null },
  }).sort({ startTime: 1 })

  // Group by day
  const byDay: Record<string, number> = {}
  const byCat: Record<string, number> = {}
  const byHour: Record<number, number> = {}

  for (const e of entries) {
    const day = e.startTime.toISOString().split('T')[0]
    byDay[day] = (byDay[day] ?? 0) + e.duration
    byCat[e.category] = (byCat[e.category] ?? 0) + e.duration
    const hour = new Date(e.startTime).getHours()
    byHour[hour] = (byHour[hour] ?? 0) + e.duration
  }

  const totalMinutes = Object.values(byCat).reduce((s, v) => s + v, 0)

  return NextResponse.json({
    byDay,
    byCategory: byCat,
    byHour,
    totalMinutes,
    entryCount: entries.length,
  })
}
