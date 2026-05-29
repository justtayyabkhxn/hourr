import { getSession } from '@/lib/auth'
import { connectDB } from '@/lib/db/mongoose'
import { TimeEntry } from '@/lib/db/models/TimeEntry'
import { Goal } from '@/lib/db/models/Goal'
import { formatDate, startOfDay, endOfDay, formatDuration } from '@/lib/utils/time'
import { generateDailyInsights } from '@/lib/analytics/insights'
import { getCategoryById } from '@/lib/utils/categories'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null

  await connectDB()

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  const [entries, goals] = await Promise.all([
    TimeEntry.find({
      userId: session.userId,
      startTime: { $gte: todayStart, $lte: todayEnd },
    }).sort({ startTime: 1 }),
    Goal.find({ userId: session.userId, isActive: true }),
  ])

  const completedEntries = entries.filter((e) => e.endTime !== null)
  const totalMinutes = completedEntries.reduce((s, e) => s + e.duration, 0)

  // Category breakdown
  const catMap: Record<string, number> = {}
  for (const e of completedEntries) {
    catMap[e.category] = (catMap[e.category] ?? 0) + e.duration
  }

  // Focus ratio (non-distraction / total)
  const distractionMins = catMap['distraction'] ?? 0
  const focusRatio = totalMinutes > 0
    ? Math.round(((totalMinutes - distractionMins) / totalMinutes) * 100)
    : 0

  // Top category
  const topCatEntry = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]
  const topCat = topCatEntry ? getCategoryById(topCatEntry[0]) : null
  const topCatMinutes = topCatEntry?.[1] ?? 0

  // Insights
  const insights = generateDailyInsights(entries as never)

  // Goal progress: match category to today's minutes
  const goalsWithProgress = goals.map((g) => ({
    _id: g._id.toString(),
    title: g.title,
    targetHours: g.targetHours,
    category: g.category,
    period: g.period,
    currentMinutes: catMap[g.category] ?? 0,
  }))

  // Serialise entries for client
  const serialisedEntries = entries.map((e) => ({
    _id: e._id.toString(),
    startTime: e.startTime.toISOString(),
    endTime: e.endTime?.toISOString() ?? null,
    duration: e.duration,
    category: e.category,
    notes: e.notes,
    tags: e.tags,
    isRunning: e.isRunning,
  }))

  return (
    <DashboardClient
      initialEntries={serialisedEntries}
      totalMinutes={totalMinutes}
      focusRatio={focusRatio}
      topCat={topCat ? { id: topCat.id, label: topCat.label, color: topCat.color, minutes: topCatMinutes } : null}
      insights={insights}
      goals={goalsWithProgress}
      userName={session.name}
    />
  )
}
