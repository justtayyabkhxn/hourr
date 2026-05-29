import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { TimeEntry } from '@/lib/db/models/TimeEntry'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') // YYYY-MM-DD
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  await connectDB()

  const query: Record<string, unknown> = { userId: session.userId }

  if (date) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    query.startTime = { $gte: start, $lte: end }
  } else if (from || to) {
    const timeQuery: Record<string, Date> = {}
    if (from) timeQuery.$gte = new Date(from)
    if (to) timeQuery.$lte = new Date(to)
    query.startTime = timeQuery
  }

  const entries = await TimeEntry.find(query).sort({ startTime: -1 }).limit(200)
  return NextResponse.json({ entries })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { startTime, endTime, category, tags, notes, isRunning } = body

  if (!startTime || !category) {
    return NextResponse.json({ error: 'startTime and category are required' }, { status: 400 })
  }

  await connectDB()

  // Stop any running entry
  if (isRunning) {
    await TimeEntry.updateMany(
      { userId: session.userId, isRunning: true },
      {
        $set: {
          isRunning: false,
          endTime: new Date(),
          duration: Math.round(
            (new Date().getTime() - new Date(startTime).getTime()) / 60000
          ),
        },
      }
    )
  }

  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : null
  const duration = end ? Math.round((end.getTime() - start.getTime()) / 60000) : 0

  const entry = await TimeEntry.create({
    userId: session.userId,
    startTime: start,
    endTime: end,
    duration,
    category,
    tags: tags ?? [],
    notes: notes ?? '',
    isRunning: isRunning ?? false,
  })

  return NextResponse.json({ entry }, { status: 201 })
}
