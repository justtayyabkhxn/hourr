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
  const remainLabel = done ? 'Done' : `${h > 0 ? `${h}h ` : ''}${m}m left`

  return (
    <div
      className="p-4 rounded-lg transition-all"
      style={{
        background: 'var(--bg-card)',
        border: hover ? '1px solid var(--border)' : '1px solid var(--border-soft)',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-widest truncate mb-0.5" style={{ color: 'var(--text-1)' }}>
            {goal.title}
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
            <span style={{ display: 'flex', alignItems: 'center', color: cat.color }}>{cat.icon}</span>
            <span>{cat.label}</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span>{goal.period}</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span>{goal.targetHours}h</span>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="w-6 h-6 rounded flex items-center justify-center text-xs transition-all ml-2 shrink-0"
          style={{
            color: 'var(--text-3)',
            opacity: hover ? 1 : 0.3,
            background: hover ? 'var(--bg-elevated)' : 'transparent',
          }}
          title="Delete"
        >
          ×
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'var(--bg-input)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${progress}%`,
            background: done ? 'var(--success)' : cat.color,
            boxShadow: done ? '0 0 6px var(--success)' : `0 0 6px ${cat.color}80`,
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold" style={{ color: done ? 'var(--success)' : cat.color }}>
          {Math.round(progress)}%
        </span>
        <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest" style={{ color: done ? 'var(--success)' : 'var(--text-3)' }}>
          {done && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
          {remainLabel}
        </span>
      </div>
    </div>
  )
}
