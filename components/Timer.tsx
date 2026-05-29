'use client'

import { useEffect, useState } from 'react'
import { useTimerStore } from '@/store/timerStore'
import { CATEGORIES } from '@/lib/utils/categories'
import { useQueryClient } from '@tanstack/react-query'

function pad(n: number) { return String(n).padStart(2, '0') }
function formatElapsed(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}

export default function Timer() {
  const { isRunning, category, elapsed, startTime, entryId, startTimer, stopTimer, setEntryId, tick } = useTimerStore()
  const [selectedCat, setSelectedCat] = useState('work')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCatPicker, setShowCatPicker] = useState(false)
  const qc = useQueryClient()

  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isRunning, tick])

  async function handleStart() {
    setLoading(true)
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime: new Date().toISOString(), category: selectedCat, notes, isRunning: true }),
      })
      const data = await res.json()
      startTimer(selectedCat, notes)
      setEntryId(data.entry._id)
      qc.invalidateQueries({ queryKey: ['entries'] })
    } finally { setLoading(false) }
  }

  async function handleStop() {
    if (!entryId) { stopTimer(); return }
    setLoading(true)
    try {
      await fetch(`/api/entries/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stop: true }),
      })
      stopTimer()
      qc.invalidateQueries({ queryKey: ['entries'] })
      qc.invalidateQueries({ queryKey: ['insights'] })
    } finally { setLoading(false) }
  }

  const activeCat = CATEGORIES.find((c) => c.id === (isRunning ? category : selectedCat))!

  const ActionButton = ({ className = '' }: { className?: string }) => (
    <button
      onClick={isRunning ? handleStop : handleStart}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-widest shrink-0 transition-opacity disabled:opacity-40 hover:opacity-80 ${className}`}
      style={isRunning ? {
        background: 'rgba(251,44,54,0.1)',
        border: '1px solid rgba(251,44,54,0.25)',
        color: 'var(--danger)',
      } : {
        background: 'var(--accent)',
        color: '#09090b',
      }}
    >
      {isRunning ? (
        <>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
          </svg>
          Stop
        </>
      ) : (
        <>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
          Start
        </>
      )}
    </button>
  )

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 rounded-lg transition-all"
      style={{
        background: isRunning ? `${activeCat.color}08` : 'var(--bg-card)',
        border: isRunning ? `1px solid ${activeCat.color}35` : '1px solid var(--border)',
        boxShadow: isRunning ? `0 0 24px ${activeCat.color}12` : 'none',
        paddingTop: isRunning ? 16 : 12,
        paddingBottom: isRunning ? 16 : 12,
      }}
    >
      {/* Top row: category picker + action button (mobile) */}
      <div className="flex items-center gap-3">
        {/* Category picker */}
        <div className="relative flex-1 sm:flex-none">
          <button
            disabled={isRunning}
            onClick={() => !isRunning && setShowCatPicker(!showCatPicker)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all w-full sm:w-auto"
            style={{
              background: `${activeCat.color}12`,
              border: `1px solid ${activeCat.color}35`,
              color: activeCat.color,
              cursor: isRunning ? 'default' : 'pointer',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: activeCat.color, boxShadow: `0 0 5px ${activeCat.color}80` }}
            />
            <span style={{ display: 'flex', alignItems: 'center', color: activeCat.color }}>{activeCat.icon}</span>
            <span>{activeCat.label}</span>
            {!isRunning && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            )}
          </button>

          {showCatPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowCatPicker(false)} />
              <div
                className="absolute top-full left-0 mt-2 z-50 p-1.5 rounded-xl"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 24px 56px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)',
                  width: 200,
                  maxHeight: 340,
                  overflowY: 'auto',
                }}
              >
                <div className="flex flex-col gap-0.5">
                  {CATEGORIES.map((c) => {
                    const sel = selectedCat === c.id
                    return (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCat(c.id); setShowCatPicker(false) }}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all"
                        style={{
                          background: sel ? `${c.color}14` : 'transparent',
                          border: `1px solid ${sel ? c.color + '30' : 'transparent'}`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            background: c.color,
                            boxShadow: sel ? `0 0 6px ${c.color}` : 'none',
                            opacity: sel ? 1 : 0.5,
                          }}
                        />
                        <span
                          className="shrink-0"
                          style={{ color: sel ? c.color : 'var(--text-3)', display: 'flex', alignItems: 'center' }}
                        >
                          {c.icon}
                        </span>
                        <span
                          className="text-xs font-bold uppercase tracking-widest truncate"
                          style={{ color: sel ? c.color : 'var(--text-2)' }}
                        >
                          {c.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action button — visible only on mobile */}
        <ActionButton className="sm:hidden" />
      </div>

      {/* Note input / Timer display */}
      {isRunning ? (
        <div className="flex items-center gap-4 flex-1">
          <span className="w-2 h-2 rounded-full animate-pulse-dot shrink-0" style={{ background: activeCat.color, boxShadow: `0 0 8px ${activeCat.color}` }} />
          <span
            className="font-bold tabular-nums tracking-tight"
            style={{ color: activeCat.color, fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: 1 }}
          >
            {formatElapsed(elapsed)}
          </span>
          {startTime && (
            <span className="text-xs" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
              since {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      ) : (
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleStart()}
          placeholder="What are you working on?"
          className="flex-1 px-3 py-2"
          style={{ fontWeight: 400, fontSize: 13 }}
        />
      )}

      {/* Action button — visible only on desktop */}
      <ActionButton className="hidden sm:flex" />
    </div>
  )
}
