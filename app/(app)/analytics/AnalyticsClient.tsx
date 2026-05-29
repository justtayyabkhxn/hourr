'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import CategoryPie from '@/components/charts/CategoryPie'
import TrendLine from '@/components/charts/TrendLine'
import StatCard from '@/components/cards/StatCard'
import { getCategoryById } from '@/lib/utils/categories'

interface Props {
  byDay: Record<string, number>
  byCategory: Record<string, number>
  byHour: Record<number, number>
  totalMinutes: number
  entryCount: number
}

function fmtDur(m: number) {
  if (!m) return '0m'
  const h = Math.floor(m / 60), rem = Math.round(m % 60)
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`
}

function buildTrendData(byDay: Record<string, number>) {
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, mins]) => ({
      label: new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      minutes: mins,
    }))
}

function buildHourData(byHour: Record<number, number>) {
  return Array.from({ length: 24 }, (_, h) => ({
    label: h === 0 ? '12a' : h === 12 ? '12p' : h < 12 ? `${h}a` : `${h - 12}p`,
    minutes: byHour[h] ?? 0,
  }))
}

export default function AnalyticsClient({ byDay, byCategory, byHour, totalMinutes, entryCount }: Props) {
  const [period, setPeriod] = useState<'week' | 'month'>('week')

  const { data } = useQuery({
    queryKey: ['analytics', period],
    queryFn: () => fetch(`/api/analytics?period=${period}`).then((r) => r.json()),
    initialData: { byDay, byCategory, byHour, totalMinutes, entryCount },
  })

  const d = data ?? { byDay, byCategory, byHour, totalMinutes, entryCount }
  const trendData = buildTrendData(d.byDay)
  const hourData = buildHourData(d.byHour)

  const peakHour = Object.entries(d.byHour as Record<number, number>).sort(([, a], [, b]) => b - a)[0]
  const peakLabel = peakHour
    ? (Number(peakHour[0]) === 0 ? '12am' : Number(peakHour[0]) === 12 ? '12pm'
      : Number(peakHour[0]) < 12 ? `${peakHour[0]}am` : `${Number(peakHour[0]) - 12}pm`)
    : '—'

  const dayCount = Object.values(d.byDay as Record<string, number>).filter((v) => v > 0).length
  const avgDaily = dayCount > 0 ? Math.round(d.totalMinutes / dayCount) : 0
  const topCatEntry = Object.entries(d.byCategory as Record<string, number>).sort(([, a], [, b]) => b - a)[0]
  const topCat = topCatEntry ? getCategoryById(topCatEntry[0]) : null

  return (
    <>
      {/* Period selector */}
      <div className="flex items-center gap-2 mb-5">
        {(['week', 'month'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all"
            style={{
              background: period === p ? 'var(--accent-dim)' : 'var(--bg-elevated)',
              border: period === p ? '1px solid rgba(0,187,127,0.25)' : '1px solid var(--border)',
              color: period === p ? 'var(--accent)' : 'var(--text-3)',
            }}
          >
            {p === 'week' ? 'This week' : 'This month'}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          label="Total Tracked"
          value={fmtDur(d.totalMinutes)}
          sub={`${d.entryCount} sessions`}
          accent="var(--accent)"
        />
        <StatCard
          label="Daily Avg"
          value={fmtDur(avgDaily)}
          sub={`${dayCount} active day${dayCount !== 1 ? 's' : ''}`}
          accent="var(--success)"
          trend="neutral"
        />
        <StatCard
          label="Peak Hour"
          value={peakLabel}
          sub="most active time"
          accent="var(--warning)"
        />
        <StatCard
          label="Top Category"
          value={topCat?.label ?? '—'}
          sub={topCatEntry ? fmtDur(topCatEntry[1]) : ''}
          accent={topCat?.color}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
        <div className="col-span-1 md:col-span-3 p-4 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <span className="text-xs font-bold uppercase tracking-widest mb-4 block" style={{ color: 'var(--text-3)' }}>
            Time Trend
          </span>
          <TrendLine data={trendData} />
        </div>
        <div className="col-span-1 md:col-span-2 p-4 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <span className="text-xs font-bold uppercase tracking-widest mb-4 block" style={{ color: 'var(--text-3)' }}>
            By Category
          </span>
          <CategoryPie data={d.byCategory} />
        </div>
      </div>

      {/* Hour heatmap */}
      <div className="p-4 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <span className="text-xs font-bold uppercase tracking-widest mb-4 block" style={{ color: 'var(--text-3)' }}>
          Activity by Hour
        </span>
        <TrendLine data={hourData} color="var(--accent)" />
      </div>
    </>
  )
}
