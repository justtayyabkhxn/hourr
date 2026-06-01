'use client'

import { useEffect } from 'react'
import { CATEGORIES } from '@/lib/utils/categories'

function pad(n: number) { return String(n).padStart(2, '0') }
function formatElapsed(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h > 0
    ? `${pad(h)}:${pad(m)}:${pad(sec)}`
    : `${pad(m)}:${pad(sec)}`
}

interface Props {
  elapsed: number
  category: string
  notes: string
  startTime: Date | null
  loading: boolean
  onStop: () => void
  onExit: () => void
}

export default function FocusMode({ elapsed, category, notes, startTime, loading, onStop, onExit }: Props) {
  const cat = CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[0]

  // Escape to exit, not stop
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onExit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onExit])

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center select-none"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${cat.color}18 0%, #07070F 70%)`,
        backgroundColor: '#07070F',
      }}
    >
      {/* Ambient top glow */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${cat.color}60, transparent)` }}
      />

      {/* Exit button — top right */}
      <button
        onClick={onExit}
        className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all hover:opacity-70"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-3)', letterSpacing: '0.08em' }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Exit focus
      </button>

      {/* Keyboard hint */}
      <p className="absolute top-6 left-5 text-xs" style={{ color: 'var(--text-3)', opacity: 0.4 }}>
        esc to exit
      </p>

      {/* Main content */}
      <div className="flex flex-col items-center gap-6 px-8 text-center">
        {/* Category pill */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}
        >
          {/* Pulsing dot */}
          <span
            className="w-2 h-2 rounded-full animate-pulse-dot"
            style={{ background: cat.color, boxShadow: `0 0 8px ${cat.color}` }}
          />
          <span style={{ display: 'flex', alignItems: 'center', color: cat.color }}>{cat.icon}</span>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: cat.color, letterSpacing: '0.12em' }}>
            {cat.label}
          </span>
        </div>

        {/* Elapsed time */}
        <span
          className="tabular-nums font-bold"
          style={{
            fontSize: 'clamp(4rem, 18vw, 8rem)',
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: 'var(--text-1)',
            textShadow: `0 0 80px ${cat.color}30`,
          }}
        >
          {formatElapsed(elapsed)}
        </span>

        {/* Notes + start time */}
        <div className="flex flex-col items-center gap-1">
          {notes && (
            <p className="text-base" style={{ color: 'var(--text-2)', fontWeight: 400 }}>
              {notes}
            </p>
          )}
          {startTime && (
            <p className="text-sm" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
              started at {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Stop button */}
        <button
          onClick={onStop}
          disabled={loading}
          className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-40 hover:opacity-80 mt-2"
          style={{
            background: 'rgba(251,44,54,0.12)',
            border: '1px solid rgba(251,44,54,0.3)',
            color: 'var(--danger)',
            letterSpacing: '0.1em',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
          </svg>
          {loading ? 'Stopping…' : 'Stop timer'}
        </button>
      </div>
    </div>
  )
}
