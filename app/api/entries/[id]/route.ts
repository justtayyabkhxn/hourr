import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { TimeEntry } from '@/lib/db/models/TimeEntry'
import { getSession } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  await connectDB()

  const entry = await TimeEntry.findOne({ _id: id, userId: session.userId })
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Stopping a running timer
  if (body.stop === true) {
    const now = new Date()
    const duration = Math.round((now.getTime() - new Date(entry.startTime).getTime()) / 60000)
    entry.endTime = now
    entry.duration = duration
    entry.isRunning = false
    await entry.save()
    return NextResponse.json({ entry })
  }

  // General update
  const { startTime, endTime, category, tags, notes } = body
  if (startTime) entry.startTime = new Date(startTime)
  if (endTime) {
    entry.endTime = new Date(endTime)
    entry.duration = Math.round(
      (new Date(endTime).getTime() - new Date(entry.startTime).getTime()) / 60000
    )
  }
  if (category) entry.category = category
  if (tags !== undefined) entry.tags = tags
  if (notes !== undefined) entry.notes = notes

  await entry.save()
  return NextResponse.json({ entry })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()

  await TimeEntry.deleteOne({ _id: id, userId: session.userId })
  return NextResponse.json({ success: true })
}
