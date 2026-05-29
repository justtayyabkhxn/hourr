import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { Goal } from '@/lib/db/models/Goal'
import { getSession } from '@/lib/auth'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()
  await Goal.findOneAndUpdate({ _id: id, userId: session.userId }, { isActive: false })
  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  await connectDB()

  const goal = await Goal.findOneAndUpdate(
    { _id: id, userId: session.userId },
    { $set: body },
    { new: true }
  )
  if (!goal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ goal })
}
