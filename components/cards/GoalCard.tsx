'use client'

import { useState } from 'react'
import { getCategoryById } from '@/lib/utils/categories'
import { useQueryClient } from '@tanstack/react-query'

interface Goal {
  _id: string
  title: string
  targetHours: number
  category: string
  period: string
}

interface Props {
  goal: Goal
  currentMinutes: number
}

export default function GoalCard({ goal, currentMinutes }: Props) {
  const cat = getCategoryById(goal.category)
  const targetMinutes = goal.targetHours * 60
  const progress = Math.min((currentMinutes / targetMinutes) * 100, 100)
  const [hover, setHover] = useState(false)
  const qc = useQueryClient()

  async function handleDelete() {
    await fetch(`/api/goals/${goal._id}`, { method: 'DELETE' })
    qc.invalidateQueries({ queryKey: ['goals'] })
  }

  const done = currentMinutes >= targetMinutes
  const remaining = targetMinutes - currentMinutes
  const h = Math.floor(Math.abs(remaining) / 60)
  const m = Math.round(Math.abs(remaining) % 60)
  const remainLabel = done ? 'Complete' : `${h > 0 ? `${h}h ` : ''}${m}m left`

  return (
    <div
      className="p-4 rounded-xl transition-all"
      style={{
        background: done ? `${cat.color}08` : 'var(--bg-elevated)',
        border: `1px solid ${done ? cat.color + '30' : 'var(--border-soft)'}`,
        transition: 'all 0.15s',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-widest truncate mb-1" style={{ color: done ? cat.color : 'var(--text-1)' }}>
            {goal.title}
          </div>
          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
            <span style={{ display: 'flex', alignItems: 'center', color: cat.color }}>{cat.icon}</span>
            <span className="text-xs" style={{ fontWeight: 400 }}>{cat.label}</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="text-xs capitalize" style={{ fontWeight: 400 }}>{goal.period}</span>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="w-6 h-6 rounded flex items-center justify-center text-xs transition-all ml-2 shrink-0"
          style={{
            color: 'var(--text-3)',
            opacity: hover ? 1 : 0,
            background: hover ? 'var(--bg-card)' : 'transparent',
            border: hover ? '1px solid var(--border)' : '1px solid transparent',
          }}
          title="Delete goal"
        >
          ×
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden mb-2.5" style={{ background: 'var(--bg-card)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${progress}%`,
            background: done
              ? `linear-gradient(90deg, ${cat.color}, ${cat.color}cc)`
              : cat.color,
            boxShadow: `0 0 8px ${cat.color}60`,
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tabular-nums" style={{ color: done ? cat.color : 'var(--text-2)' }}>
          {Math.round(progress)}%
        </span>
        <span
          className="flex items-center gap-1 text-xs font-bold"
          style={{ color: done ? cat.color : 'var(--text-3)' }}
        >
          {done && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
          {remainLabel}
        </span>
      </div>
    </div>
  )
}
