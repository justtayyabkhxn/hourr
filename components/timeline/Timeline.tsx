'use client'

import { useMemo, useState } from 'react'
import { getCategoryById } from '@/lib/utils/categories'
import { formatTime } from '@/lib/utils/time'

interface Entry {
  _id: string
  startTime: string
  endTime: string | null
  duration: number
  category: string
  notes: string
  tags: string[]
  isRunning: boolean
}

const TOTAL_MINS = 1440
const HOUR_MARKS = [0, 3, 6, 9, 12, 15, 18, 21, 24]

function toPercent(mins: number) { return (mins / TOTAL_MINS) * 100 }
function minsFromDate(d: Date) { return d.getHours() * 60 + d.getMinutes() }
function hourLabel(h: number) {
  if (h === 0 || h === 24) return '12am'
  if (h === 12) return '12pm'
  return h < 12 ? `${h}am` : `${h - 12}pm`
}

export default function Timeline({ entries, currentTime = new Date() }: { entries: Entry[]; currentTime?: Date }) {
  const [tooltip, setTooltip] = useState<{ entry: Entry; x: number; y: number } | null>(null)

  const nowPct = useMemo(() => toPercent(minsFromDate(currentTime)), [currentTime])

  const blocks = useMemo(() =>
    entries
      .filter((e) => e.endTime !== null || e.isRunning)
      .map((e) => {
        const start = minsFromDate(new Date(e.startTime))
        const end = e.endTime ? minsFromDate(new Date(e.endTime)) : minsFromDate(currentTime)
        return { ...e, left: toPercent(start), width: Math.max(toPercent(Math.max(end - start, 0)), 0.2) }
      }),
    [entries, currentTime]
  )

  return (
    <div className="select-none">
      {/* Hour labels */}
      <div className="relative h-5 mb-2">
        {HOUR_MARKS.map((h) => (
          <span
            key={h}
            className="absolute text-xs"
            style={{
              left: `${toPercent(h * 60)}%`,
              color: 'var(--text-3)',
              fontSize: 10,
              transform: h === 24 ? 'translateX(-100%)' : 'translateX(-50%)',
            }}
          >
            {hourLabel(h)}
          </span>
        ))}
      </div>

      {/* Track */}
      <div
        className="timeline-track relative h-14"
        style={{ position: 'relative' }}
      >
        {/* Hour grid */}
        {HOUR_MARKS.slice(1, -1).map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 w-px"
            style={{ left: `${toPercent(h * 60)}%`, background: 'var(--border-soft)' }}
          />
        ))}

        {/* Blocks */}
        {blocks.map((b) => {
          const cat = getCategoryById(b.category)
          return (
            <div
              key={b._id}
              className="timeline-block absolute top-1.5 bottom-1.5 rounded-lg"
              style={{
                left: `${b.left}%`,
                width: `${b.width}%`,
                background: `${cat.color}CC`,
                minWidth: 3,
              }}
              onMouseEnter={(e) => {
                const r = e.currentTarget.getBoundingClientRect()
                setTooltip({ entry: b, x: r.left + r.width / 2, y: r.top })
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              {b.isRunning && (
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 rounded-r-lg animate-pulse-dot"
                  style={{ background: cat.color, boxShadow: `0 0 10px ${cat.color}` }}
                />
              )}
            </div>
          )
        })}

        {/* Now indicator */}
        {nowPct >= 0 && nowPct <= 100 && (
          <div
            className="absolute top-0 bottom-0 w-px z-10"
            style={{ left: `${nowPct}%`, background: 'var(--accent)', boxShadow: '0 0 8px rgba(124,58,237,0.8)' }}
          >
            <div
              className="absolute -top-0.5 -translate-x-1/2 w-2 h-2 rounded-full"
              style={{ background: 'var(--accent)', boxShadow: '0 0 6px rgba(124,58,237,0.8)' }}
            />
          </div>
        )}
      </div>

      {/* Legend */}
      {blocks.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-4">
          {Object.entries(
            blocks.reduce<Record<string, number>>((acc, b) => {
              if (b.endTime) acc[b.category] = (acc[b.category] ?? 0) + b.duration
              return acc
            }, {})
          )
            .sort(([, a], [, b]) => b - a)
            .map(([catId, mins]) => {
              const cat = getCategoryById(catId)
              const h = Math.floor(mins / 60), m = mins % 60
              return (
                <div key={catId} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                    {cat.label} · {h > 0 ? `${h}h ` : ''}{m > 0 ? `${m}m` : ''}
                  </span>
                </div>
              )
            })}
        </div>
      )}

      {blocks.length === 0 && (
        <div className="flex items-center justify-center mt-3">
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>
            No tracked time yet today — start a timer or log an entry
          </span>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none animate-fade-in"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, calc(-100% - 10px))' }}
        >
          <div
            className="px-3.5 py-2.5 rounded-xl text-sm"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
              minWidth: 160,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ background: getCategoryById(tooltip.entry.category).color }} />
              <span className="font-semibold" style={{ color: 'var(--text-1)' }}>
                {getCategoryById(tooltip.entry.category).label}
              </span>
            </div>
            <div className="text-xs" style={{ color: 'var(--text-2)' }}>
              {formatTime(new Date(tooltip.entry.startTime))} → {tooltip.entry.endTime ? formatTime(new Date(tooltip.entry.endTime)) : 'now'}
            </div>
            {tooltip.entry.notes && (
              <div className="text-xs mt-1 truncate max-w-48" style={{ color: 'var(--text-3)' }}>
                {tooltip.entry.notes}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
