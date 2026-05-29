import { getSession } from '@/lib/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Goal } from '@/lib/db/models/Goal'
import { TimeEntry } from '@/lib/db/models/TimeEntry'
import { startOfDay, endOfDay, startOfWeek } from '@/lib/utils/time'
import GoalsClient from './GoalsClient'

export default async function GoalsPage() {
  const session = await getSession()
  if (!session) return null

  await connectDB()

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const weekStart = startOfWeek(now)

  const [goals, todayEntries, weekEntries] = await Promise.all([
    Goal.find({ userId: session.userId, isActive: true }).sort({ createdAt: -1 }),
    TimeEntry.find({
      userId: session.userId,
      startTime: { $gte: todayStart, $lte: todayEnd },
      endTime: { $ne: null },
    }),
    TimeEntry.find({
      userId: session.userId,
      startTime: { $gte: weekStart, $lte: now },
      endTime: { $ne: null },
    }),
  ])

  // Build category maps
  const todayMap: Record<string, number> = {}
  for (const e of todayEntries) {
    todayMap[e.category] = (todayMap[e.category] ?? 0) + e.duration
  }

  const weekMap: Record<string, number> = {}
  for (const e of weekEntries) {
    weekMap[e.category] = (weekMap[e.category] ?? 0) + e.duration
  }

  const goalsWithProgress = goals.map((g) => {
    const minutes = g.period === 'daily' ? (todayMap[g.category] ?? 0) : (weekMap[g.category] ?? 0)
    return {
      _id: g._id.toString(),
      title: g.title,
      targetHours: g.targetHours,
      category: g.category,
      period: g.period,
      currentMinutes: minutes,
    }
  })

  return <GoalsClient goals={goalsWithProgress} />
}
