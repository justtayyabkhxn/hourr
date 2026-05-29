import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { TimeEntry } from '@/lib/db/models/TimeEntry'
import { getSession } from '@/lib/auth'
import { generateDailyInsights } from '@/lib/analytics/insights'

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

  const entries = await TimeEntry.find({
    userId: session.userId,
    startTime: { $gte: start, $lte: end },
  })

  const insights = generateDailyInsights(entries)
  return NextResponse.json({ insights })
}
