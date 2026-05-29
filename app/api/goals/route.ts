import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { Goal } from '@/lib/db/models/Goal'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const goals = await Goal.find({ userId: session.userId, isActive: true }).sort({ createdAt: -1 })
  return NextResponse.json({ goals })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, targetHours, category, period } = await req.json()

  if (!title || !targetHours || !category) {
    return NextResponse.json({ error: 'title, targetHours, and category are required' }, { status: 400 })
  }

  await connectDB()
  const goal = await Goal.create({
    userId: session.userId,
    title,
    targetHours: Number(targetHours),
    category,
    period: period ?? 'daily',
  })

  return NextResponse.json({ goal }, { status: 201 })
}
