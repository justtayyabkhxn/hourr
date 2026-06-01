import { ITimeEntry } from '@/lib/db/models/TimeEntry'
import { CATEGORIES } from '@/lib/utils/categories'
import { formatDurationLong } from '@/lib/utils/time'

export interface InsightResult {
  content: string
  metric?: string
  trend?: 'up' | 'down' | 'neutral'
}

export interface WeekContext {
  dailyMinutes: number[]      // past N days totals, oldest first, NOT including today
  dailyDistractions: number[] // past N days distraction mins, oldest first
}

function groupByHour(entries: ITimeEntry[]): Record<number, number> {
  const hourMap: Record<number, number> = {}
  for (const entry of entries) {
    if (!entry.endTime) continue
    const hour = new Date(entry.startTime).getHours()
    hourMap[hour] = (hourMap[hour] ?? 0) + entry.duration
  }
  return hourMap
}

function groupByCategory(entries: ITimeEntry[]): Record<string, number> {
  const catMap: Record<string, number> = {}
  for (const entry of entries) {
    catMap[entry.category] = (catMap[entry.category] ?? 0) + entry.duration
  }
  return catMap
}

function findPeakHour(hourMap: Record<number, number>): number | null {
  let peak = -1
  let peakMinutes = 0
  for (const [h, m] of Object.entries(hourMap)) {
    if (m > peakMinutes) {
      peakMinutes = m
      peak = Number(h)
    }
  }
  return peak >= 0 ? peak : null
}

function hourLabel(h: number): string {
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

export function generateDailyInsights(entries: ITimeEntry[], weekContext?: WeekContext): InsightResult[] {
  if (entries.length === 0) {
    return [
      {
        content: 'No entries tracked today. Start logging your time to unlock insights.',
        metric: '0 min tracked',
        trend: 'neutral',
      },
    ]
  }

  const insights: InsightResult[] = []
  const completedEntries = entries.filter((e) => e.endTime !== null)
  const totalMinutes = completedEntries.reduce((s, e) => s + e.duration, 0)
  const catMap = groupByCategory(completedEntries)
  const hourMap = groupByHour(completedEntries)

  // Peak productivity hour
  const peakHour = findPeakHour(hourMap)
  if (peakHour !== null) {
    const peakMinutes = hourMap[peakHour]
    insights.push({
      content: `You were most active around ${hourLabel(peakHour)}, logging ${formatDurationLong(peakMinutes)} in that hour alone.`,
      metric: `Peak: ${hourLabel(peakHour)}`,
      trend: 'up',
    })
  }

  // Top category
  const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]
  if (topCat) {
    const catInfo = CATEGORIES.find((c) => c.id === topCat[0])
    const pct = Math.round((topCat[1] / totalMinutes) * 100)
    insights.push({
      content: `${catInfo?.label ?? topCat[0]} consumed ${pct}% of your tracked time today — ${formatDurationLong(topCat[1])}.`,
      metric: `${pct}% ${catInfo?.label ?? topCat[0]}`,
      trend: catInfo?.isDistraction ? 'down' : 'up',
    })
  }

  // Distraction ratio
  const distractionMinutes = catMap['distraction'] ?? 0
  if (distractionMinutes > 0 && totalMinutes > 0) {
    const ratio = Math.round((distractionMinutes / totalMinutes) * 100)
    const trend = ratio > 20 ? 'down' : 'neutral'
    insights.push({
      content:
        ratio > 20
          ? `${ratio}% of your time went to distractions. Consider blocking high-distraction hours.`
          : `Distractions were minimal today — only ${ratio}% of tracked time.`,
      metric: `${ratio}% distraction`,
      trend,
    })
  }

  // Long unbroken sessions
  const sortedByTime = [...completedEntries].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )
  let longestStreak = 0
  let currentStreak = 0
  for (const e of sortedByTime) {
    if (!e.isRunning && e.category !== 'break') {
      currentStreak += e.duration
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }
  if (longestStreak >= 90) {
    insights.push({
      content: `You had a deep focus streak of ${formatDurationLong(longestStreak)} without a break. Recovery time matters — schedule breaks.`,
      metric: `${formatDurationLong(longestStreak)} streak`,
      trend: 'neutral',
    })
  }

  // Diversity of activities
  const uniqueCategories = Object.keys(catMap).length
  if (uniqueCategories === 1) {
    insights.push({
      content: `All tracked time was in one category. A diverse schedule tends to sustain energy better.`,
      metric: '1 category',
      trend: 'neutral',
    })
  }

  // Cross-day insights (requires week context with at least 2 prior days)
  if (weekContext && weekContext.dailyMinutes.length >= 2 && totalMinutes > 0) {
    const activeDays = weekContext.dailyMinutes.filter((m) => m > 0)
    if (activeDays.length >= 2) {
      const weekAvg = Math.round(activeDays.reduce((s, v) => s + v, 0) / activeDays.length)
      const pct = Math.round(((totalMinutes - weekAvg) / weekAvg) * 100)
      if (Math.abs(pct) >= 20) {
        insights.push({
          content: pct > 0
            ? `You're tracking ${pct}% more than your recent daily average of ${formatDurationLong(weekAvg)}. Strong session.`
            : `Today is ${Math.abs(pct)}% below your recent daily average of ${formatDurationLong(weekAvg)}.`,
          metric: `${pct > 0 ? '+' : ''}${pct}% vs avg`,
          trend: pct > 0 ? 'up' : 'down',
        })
      }
    }

    // Distraction trend — is it climbing over the last 3+ days?
    if (weekContext.dailyMinutes.length >= 3) {
      const recentMins = weekContext.dailyMinutes.slice(-3)
      const recentDist = weekContext.dailyDistractions.slice(-3)
      const recentRatios = recentMins.map((m, i) => (m > 0 ? recentDist[i] / m : 0))
      const todayDistraction = (catMap['distraction'] ?? 0) + (catMap['social-media'] ?? 0)
      const todayRatio = todayDistraction / totalMinutes
      const allRising = recentRatios.every((r, i) => i === 0 || r >= recentRatios[i - 1])
      if (allRising && todayRatio > recentRatios[recentRatios.length - 1] && todayRatio > 0.1) {
        insights.push({
          content: `Distraction time has been climbing for ${recentRatios.length + 1} days in a row. Consider scheduling dedicated focus blocks.`,
          metric: 'distraction trend ↑',
          trend: 'down',
        })
      }
    }
  }

  return insights.slice(0, 3)
}

export function generateWeeklyInsight(
  dailyTotals: number[],
  prevWeekTotals: number[]
): InsightResult {
  const thisWeek = dailyTotals.reduce((s, v) => s + v, 0)
  const lastWeek = prevWeekTotals.reduce((s, v) => s + v, 0)
  const diff = thisWeek - lastWeek
  const pct = lastWeek > 0 ? Math.round(Math.abs(diff / lastWeek) * 100) : 0

  if (diff > 0) {
    return {
      content: `You tracked ${pct}% more time than last week. Consistency is building.`,
      metric: `+${pct}% vs last week`,
      trend: 'up',
    }
  } else if (diff < 0) {
    return {
      content: `Your tracked time dropped ${pct}% compared to last week.`,
      metric: `-${pct}% vs last week`,
      trend: 'down',
    }
  }
  return {
    content: `Your weekly time tracking is consistent with last week.`,
    metric: 'stable',
    trend: 'neutral',
  }
}
