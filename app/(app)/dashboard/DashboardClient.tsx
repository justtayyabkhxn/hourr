'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Timeline from '@/components/timeline/Timeline'
import StatCard from '@/components/cards/StatCard'
import InsightCard from '@/components/cards/InsightCard'
import GoalCard from '@/components/cards/GoalCard'
import Timer from '@/components/Timer'
import EntryModal from '@/components/EntryModal'
import { getCategoryById } from '@/lib/utils/categories'

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
interface Goal {
  _id: string; title: string; targetHours: number; category: string; period: string; currentMinutes: number
}
interface Insight {
  content: string; metric?: string; trend?: 'up' | 'down' | 'neutral'
}

function fmtDur(m: number) {
  if (m < 60) return `${Math.round(m)}m`
  const h = Math.floor(m / 60), rem = Math.round(m % 60)
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`
}

export default function DashboardClient({
  initialEntries, totalMinutes, focusRatio, topCat, insights, goals, userName,
}: {
  initialEntries: Entry[]
  totalMinutes: number
  focusRatio: number
  topCat: { id: string; label: string; color: string; minutes: number } | null
  insights: Insight[]
  goals: Goal[]
  userName: string
}) {
  const [showEntryModal, setShowEntryModal] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  const { data: entriesData } = useQuery<{ entries: Entry[] }>({
    queryKey: ['entries', 'today'],
    queryFn: () => fetch(`/api/entries?date=${today}`).then((r) => r.json()),
    initialData: { entries: initialEntries },
    refetchInterval: 30_000,
  })
  const { data: insightsData } = useQuery<{ insights: Insight[] }>({
    queryKey: ['insights', 'today'],
    queryFn: () => fetch(`/api/insights?date=${today}`).then((r) => r.json()),
    initialData: { insights },
  })

  const entries = entriesData?.entries ?? initialEntries
  const liveInsights = insightsData?.insights ?? insights

  const completed = entries.filter((e) => e.endTime !== null)
  const liveTotalMins = completed.reduce((s, e) => s + e.duration, 0)
  const liveDistractionMins = completed.filter((e) => e.category === 'distraction').reduce((s, e) => s + e.duration, 0)
  const liveFocusRatio = liveTotalMins > 0 ? Math.round(((liveTotalMins - liveDistractionMins) / liveTotalMins) * 100) : focusRatio

  const catMap = completed.reduce<Record<string, number>>((acc, e) => ({ ...acc, [e.category]: (acc[e.category] ?? 0) + e.duration }), {})
  const liveTopCatEntry = Object.entries(catMap).sort(([, a], [, b]) => b - a)[0]
  const liveTopCat = liveTopCatEntry ? { ...getCategoryById(liveTopCatEntry[0]), minutes: liveTopCatEntry[1] } : topCat

  const hour = new Date().getHours()
  const greeting = hour < 5 ? 'Night' : hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-3)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-2xl font-bold tracking-tight leading-tight" style={{ color: 'var(--text-1)' }}>
            Good {greeting},{' '}
            <span style={{ color: 'var(--accent)' }}>{userName.split(' ')[0]}</span>
          </h1>
          {liveTotalMins > 0 && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
              {fmtDur(liveTotalMins)} tracked today · {completed.length} session{completed.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowEntryModal(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all hover:opacity-80 shrink-0"
          style={{ background: 'var(--accent)', color: '#09090b' }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span className="hidden sm:inline">Log time</span>
          <span className="sm:hidden">Log</span>
        </button>
      </div>

      {/* Timer */}
      <div className="mb-5">
        <Timer />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <StatCard
          label="Tracked Today"
          value={fmtDur(liveTotalMins)}
          sub={`${completed.length} session${completed.length !== 1 ? 's' : ''}`}
          accent="var(--accent)"
          trend={liveTotalMins > 60 ? 'up' : 'neutral'}
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <StatCard
          label="Focus Ratio"
          value={`${liveFocusRatio}%`}
          sub="of time focused"
          accent={liveFocusRatio >= 70 ? 'var(--success)' : liveFocusRatio >= 40 ? 'var(--warning)' : 'var(--danger)'}
          trend={liveFocusRatio >= 70 ? 'up' : liveFocusRatio >= 40 ? 'neutral' : 'down'}
        />
        <StatCard
          label="Top Category"
          value={liveTopCat?.label ?? '—'}
          sub={liveTopCat ? fmtDur(liveTopCat.minutes) : 'no entries yet'}
          accent={liveTopCat?.color}
        />
      </div>

      {/* Timeline */}
      <div className="rounded-lg mb-5 overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-soft)' }}>
          <div className="flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
              Today's Timeline
            </span>
          </div>
          <span className="text-xs tabular-nums" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div className="p-4">
          <Timeline entries={entries} />
        </div>
      </div>

      {/* Insights + Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-5">
        <div className="col-span-1 lg:col-span-3">
          <InsightCard insights={liveInsights} />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <div className="rounded-lg h-full overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-soft)' }}>
              <div className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                </svg>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>Goals</span>
              </div>
              <a href="/goals" className="text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--accent)' }}>
                Manage →
              </a>
            </div>
            <div className="p-4">
              {goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl mb-3"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                    </svg>
                  </div>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-3)', fontWeight: 400 }}>No goals set yet</p>
                  <a href="/goals" className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                    Set a goal →
                  </a>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {goals.slice(0, 4).map((g) => <GoalCard key={g._id} goal={g} currentMinutes={g.currentMinutes} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sessions list */}
      {entries.length > 0 && (
        <div className="rounded-lg overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border-soft)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
              Sessions
            </span>
            <span
              className="ml-auto text-xs font-bold tabular-nums px-2 py-0.5 rounded-full"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-3)', border: '1px solid var(--border-soft)' }}
            >
              {entries.length}
            </span>
          </div>
          <div className="flex flex-col" style={{ gap: 0 }}>
            {[...entries].reverse().map((e) => {
              const cat = getCategoryById(e.category)
              const start = new Date(e.startTime)
              const end = e.endTime ? new Date(e.endTime) : null
              return (
                <div
                  key={e._id}
                  className="flex items-center gap-3 px-4 py-3 transition-all"
                  style={{
                    background: e.isRunning ? `${cat.color}06` : 'transparent',
                    borderTop: '1px solid var(--border-soft)',
                  }}
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                    style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}
                  >
                    <span style={{ color: cat.color, display: 'flex', alignItems: 'center' }}>{cat.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: cat.color }}>
                        {cat.label}
                      </span>
                      {e.isRunning && (
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse-dot" style={{ background: 'var(--accent)' }} />
                      )}
                    </div>
                    {e.notes ? (
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-3)', fontWeight: 400 }}>{e.notes}</p>
                    ) : (
                      <p className="text-xs mt-0.5 hidden sm:block" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
                        {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        {' – '}
                        {end ? end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'running'}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {e.duration > 0 && (
                      <div className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-1)' }}>
                        {fmtDur(e.duration)}
                      </div>
                    )}
                    <div className="text-xs tabular-nums hidden sm:block" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
                      {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      {' – '}
                      {end ? end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'now'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {showEntryModal && <EntryModal onClose={() => setShowEntryModal(false)} />}
    </>
  )
}
