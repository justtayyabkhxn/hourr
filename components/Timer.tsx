'use client'

import { useEffect, useState } from 'react'
import { useTimerStore } from '@/store/timerStore'
import { CATEGORIES } from '@/lib/utils/categories'
import { useQueryClient } from '@tanstack/react-query'
import FocusMode from '@/components/FocusMode'

function pad(n: number) { return String(n).padStart(2, '0') }
function formatElapsed(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}

export default function Timer() {
  const { isRunning, category, elapsed, startTime, entryId, startTimer, stopTimer, setEntryId, tick, recoverTimer } = useTimerStore()
  const [selectedCat, setSelectedCat] = useState('work')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCatPicker, setShowCatPicker] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const qc = useQueryClient()

  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isRunning, tick])

  // Recover a running timer from the DB after a page refresh
  useEffect(() => {
    if (isRunning) return
    const today = new Date().toISOString().split('T')[0]
    fetch(`/api/entries?date=${today}`)
      .then((r) => r.json())
      .then((data: { entries?: Array<{ _id: string; isRunning: boolean; category: string; notes: string; startTime: string }> }) => {
        const running = data.entries?.find((e) => e.isRunning)
        if (running) {
          recoverTimer(running._id, running.category, running.notes ?? '', new Date(running.startTime))
          setSelectedCat(running.category)
          if (running.notes) setNotes(running.notes)
        }
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  if (isRunning) {
    return (
      <>
        {focusMode && (
          <FocusMode
            elapsed={elapsed}
            category={category ?? selectedCat}
            notes={notes}
            startTime={startTime}
            loading={loading}
            onStop={async () => { await handleStop(); setFocusMode(false) }}
            onExit={() => setFocusMode(false)}
          />
        )}

        <div
          className="relative overflow-hidden rounded-xl px-5 py-4 transition-all"
          style={{
            background: `${activeCat.color}0a`,
            border: `1px solid ${activeCat.color}40`,
            boxShadow: `0 0 32px ${activeCat.color}10`,
          }}
        >
          {/* Subtle animated glow strip */}
          <div
            className="absolute inset-x-0 top-0 h-px animate-glow-pulse"
            style={{ background: `linear-gradient(90deg, transparent, ${activeCat.color}80, transparent)` }}
          />

          <div className="flex items-center justify-between gap-4">
            {/* Category + time info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Pulsing indicator */}
              <div className="relative shrink-0">
                <div
                  className="w-2.5 h-2.5 rounded-full animate-pulse-dot"
                  style={{ background: activeCat.color, boxShadow: `0 0 10px ${activeCat.color}` }}
                />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span style={{ display: 'flex', alignItems: 'center', color: activeCat.color }}>{activeCat.icon}</span>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: activeCat.color }}>
                    {activeCat.label}
                  </span>
                </div>
                {startTime && (
                  <span className="text-xs" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
                    since {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    {notes && <span style={{ color: 'var(--text-3)' }}> · {notes}</span>}
                  </span>
                )}
              </div>
            </div>

            {/* Elapsed time */}
            <span
              className="font-bold tabular-nums tracking-tight shrink-0"
              style={{ color: activeCat.color, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: 1, letterSpacing: '-0.02em' }}
            >
              {formatElapsed(elapsed)}
            </span>

            {/* Focus button */}
            <button
              onClick={() => setFocusMode(true)}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:opacity-70"
              style={{ background: `${activeCat.color}15`, border: `1px solid ${activeCat.color}30`, color: activeCat.color }}
              title="Focus mode"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
                <path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
              </svg>
            </button>

            {/* Stop button */}
            <button
              onClick={handleStop}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shrink-0 transition-all disabled:opacity-40 hover:opacity-80"
              style={{
                background: 'rgba(251,44,54,0.12)',
                border: '1px solid rgba(251,44,54,0.3)',
                color: 'var(--danger)',
                letterSpacing: '0.08em',
              }}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
              Stop
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <div
      className="rounded-xl transition-all"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-0">
        {/* Category + input row */}
        <div className="flex items-center gap-0 flex-1 min-w-0">
          {/* Category picker */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowCatPicker(!showCatPicker)}
              className="flex items-center gap-2 pl-4 pr-3 py-3.5 text-xs font-bold uppercase tracking-widest transition-all rounded-l-xl"
              style={{
                background: `${activeCat.color}10`,
                borderRight: `1px solid ${activeCat.color}25`,
                color: activeCat.color,
                letterSpacing: '0.08em',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{activeCat.icon}</span>
              <span className="hidden sm:inline">{activeCat.label}</span>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
            </button>

            {showCatPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCatPicker(false)} />
                <div
                  className="absolute top-full left-0 mt-2 z-50 p-1.5 rounded-xl animate-slide-up"
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
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all"
                          style={{
                            background: sel ? `${c.color}12` : 'transparent',
                            border: `1px solid ${sel ? c.color + '28' : 'transparent'}`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: c.color, opacity: sel ? 1 : 0.45 }}
                          />
                          <span style={{ color: sel ? c.color : 'var(--text-3)', display: 'flex', alignItems: 'center' }}>
                            {c.icon}
                          </span>
                          <span
                            className="text-xs font-bold uppercase tracking-widest truncate"
                            style={{ color: sel ? c.color : 'var(--text-2)', letterSpacing: '0.08em' }}
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

          {/* Note input */}
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleStart()}
            placeholder="What are you working on?"
            className="flex-1 px-4 py-3.5 bg-transparent"
            style={{
              fontWeight: 400,
              fontSize: 13,
              border: 'none',
              outline: 'none',
              borderRadius: 0,
              boxShadow: 'none',
            }}
          />
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40 hover:opacity-85 rounded-b-xl sm:rounded-b-none sm:rounded-r-xl shrink-0"
          style={{
            background: 'var(--accent)',
            color: '#09090b',
            borderTop: '1px solid rgba(0,187,127,0.3)',
            letterSpacing: '0.08em',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
          Start
        </button>
      </div>
    </div>
  )
}
