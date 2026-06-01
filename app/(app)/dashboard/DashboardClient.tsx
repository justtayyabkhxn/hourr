'use client'

import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Timeline from '@/components/timeline/Timeline'
import StatCard from '@/components/cards/StatCard'
import InsightCard from '@/components/cards/InsightCard'
import GoalCard from '@/components/cards/GoalCard'
import Timer from '@/components/Timer'
import EntryModal from '@/components/EntryModal'
import EditEntryModal from '@/components/EditEntryModal'
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

function SectionHeader({ icon, title, right }: { icon: React.ReactNode; title: string; right?: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderBottom: '1px solid var(--border-soft)' }}
    >
      <div className="flex items-center gap-2">
        <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-3)' }}>{icon}</span>
        <span className="section-label">{title}</span>
      </div>
      {right}
    </div>
  )
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
  const todayStr = new Date().toISOString().split('T')[0]
  const [viewDate, setViewDate] = useState(todayStr)
  const isToday = viewDate === todayStr

  const [showEntryModal, setShowEntryModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)

  const qc = useQueryClient()

  const { data: entriesData } = useQuery<{ entries: Entry[] }>({
    queryKey: ['entries', viewDate],
    queryFn: () => fetch(`/api/entries?date=${viewDate}`).then((r) => r.json()),
    initialData: isToday ? { entries: initialEntries } : undefined,
    refetchInterval: isToday ? 30_000 : false,
  })
  const { data: insightsData } = useQuery<{ insights: Insight[] }>({
    queryKey: ['insights', viewDate],
    queryFn: () => fetch(`/api/insights?date=${viewDate}`).then((r) => r.json()),
    initialData: isToday ? { insights } : undefined,
  })

  const entries = entriesData?.entries ?? (isToday ? initialEntries : [])
  const liveInsights = insightsData?.insights ?? (isToday ? insights : [])

  const completed = entries.filter((e) => e.endTime !== null)
  const liveTotalMins = completed.reduce((s, e) => s + e.duration, 0)
  const liveDistractionMins = completed.filter((e) => e.category === 'distraction').reduce((s, e) => s + e.duration, 0)
  const liveFocusRatio = liveTotalMins > 0
    ? Math.round(((liveTotalMins - liveDistractionMins) / liveTotalMins) * 100)
    : (isToday ? focusRatio : 0)

  const catMap = completed.reduce<Record<string, number>>((acc, e) => ({ ...acc, [e.category]: (acc[e.category] ?? 0) + e.duration }), {})
  const liveTopCatEntry = Object.entries(catMap).sort(([, a], [, b]) => b - a)[0]
  const liveTopCat = liveTopCatEntry
    ? { ...getCategoryById(liveTopCatEntry[0]), minutes: liveTopCatEntry[1] }
    : (isToday ? topCat : null)

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    for (const e of entries) for (const t of e.tags ?? []) tags.add(t)
    return [...tags].sort()
  }, [entries])

  const filteredEntries = useMemo(
    () => (tagFilter ? entries.filter((e) => (e.tags ?? []).includes(tagFilter)) : entries),
    [entries, tagFilter]
  )

  const hour = new Date().getHours()
  const greeting = hour < 5 ? 'Night' : hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'

  function changeDate(delta: number) {
    const d = new Date(viewDate + 'T12:00:00')
    d.setDate(d.getDate() + delta)
    const s = d.toISOString().split('T')[0]
    if (s <= todayStr) {
      setViewDate(s)
      setTagFilter(null)
    }
  }

  async function handleDeleteEntry(id: string) {
    await fetch(`/api/entries/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    qc.invalidateQueries({ queryKey: ['entries'] })
    qc.invalidateQueries({ queryKey: ['insights'] })
  }

  const viewDateLabel = new Date(viewDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-7 px-4 md:px-0">
        <div className="flex-1 min-w-0">
          {/* Date navigation */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => changeDate(-1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
              title="Previous day"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="section-label">{viewDateLabel}</span>
            {isToday && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{ background: 'var(--accent)', color: '#09090b', fontSize: 9, letterSpacing: '0.1em' }}
              >
                TODAY
              </span>
            )}
            <button
              onClick={() => changeDate(1)}
              disabled={isToday}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-20 disabled:cursor-not-allowed"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
              title="Next day"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {isToday ? (
            <h1 className="text-2xl font-bold tracking-tight leading-tight" style={{ color: 'var(--text-1)' }}>
              Good {greeting},{' '}
              <span style={{ color: 'var(--accent)' }}>{userName.split(' ')[0]}</span>
            </h1>
          ) : (
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>
              {new Date(viewDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })}
            </h1>
          )}
          {liveTotalMins > 0 && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
              {fmtDur(liveTotalMins)} tracked · {completed.length} session{completed.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <button
          onClick={() => setShowEntryModal(true)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all hover:opacity-80 shrink-0"
          style={{ background: 'var(--accent)', color: '#09090b', letterSpacing: '0.08em' }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span className="hidden sm:inline">Log time</span>
          <span className="sm:hidden">Log</span>
        </button>
      </div>

      {/* ── Timer ──────────────────────────────────────────────────── */}
      {isToday && (
        <div className="mb-6 px-4 md:px-0">
          <Timer />
        </div>
      )}

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 px-4 md:px-0">
        <StatCard
          label="Tracked"
          value={fmtDur(liveTotalMins)}
          sub={`${completed.length} session${completed.length !== 1 ? 's' : ''}`}
          accent="var(--accent)"
          trend={liveTotalMins > 60 ? 'up' : 'neutral'}
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <StatCard
          label="Focus Ratio"
          value={`${liveFocusRatio}%`}
          sub="non-distraction time"
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

      {/* ── Timeline ───────────────────────────────────────────────── */}
      <div className="rounded-xl mb-6 overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <SectionHeader
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
          title={isToday ? "Today's Timeline" : 'Timeline'}
        />
        <div className="p-4">
          <Timeline entries={entries} hideNow={!isToday} />
        </div>
      </div>

      {/* ── Insights + Goals ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6 px-4 md:px-0">
        <div className={`col-span-1 ${isToday ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
          <InsightCard insights={liveInsights} />
        </div>
        {isToday && (
          <div className="col-span-1 lg:col-span-2">
            <div className="rounded-xl h-full overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <SectionHeader
                icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>}
                title="Goals"
                right={
                  <a href="/goals" className="text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--accent)', letterSpacing: '0.08em' }}>
                    Manage →
                  </a>
                }
              />
              <div className="p-4">
                {goals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                      </svg>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-3)', fontWeight: 400 }}>No goals set yet</p>
                    <a href="/goals" className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)', letterSpacing: '0.08em' }}>Set a goal →</a>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {goals.slice(0, 4).map((g) => <GoalCard key={g._id} goal={g} currentMinutes={g.currentMinutes} />)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Sessions list ──────────────────────────────────────────── */}
      {entries.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <SectionHeader
            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>}
            title="Sessions"
            right={
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-3)', border: '1px solid var(--border-soft)' }}
                >
                  {filteredEntries.length}{tagFilter ? `/${entries.length}` : ''}
                </span>
                {allTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTagFilter(tagFilter === t ? null : t)}
                    className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-widest transition-all"
                    style={{
                      background: tagFilter === t ? 'var(--accent)' : 'var(--bg-elevated)',
                      color: tagFilter === t ? '#09090b' : 'var(--text-3)',
                      border: `1px solid ${tagFilter === t ? 'var(--accent)' : 'var(--border-soft)'}`,
                      letterSpacing: '0.08em',
                    }}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            }
          />

          <div className="flex flex-col">
            {[...filteredEntries].reverse().map((e) => {
              const cat = getCategoryById(e.category)
              const start = new Date(e.startTime)
              const end = e.endTime ? new Date(e.endTime) : null
              const isDeleting = deletingId === e._id

              return (
                <div
                  key={e._id}
                  className="group interactive-row flex items-center gap-3 px-4 py-3.5"
                  style={{
                    borderTop: '1px solid var(--border-soft)',
                    background: e.isRunning ? `${cat.color}05` : undefined,
                  }}
                >
                  {/* Category icon */}
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                    style={{ background: `${cat.color}12`, border: `1px solid ${cat.color}28` }}
                  >
                    <span style={{ color: cat.color, display: 'flex', alignItems: 'center' }}>{cat.icon}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: cat.color, letterSpacing: '0.08em' }}>
                        {cat.label}
                      </span>
                      {e.isRunning && (
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse-dot" style={{ background: 'var(--accent)' }} />
                      )}
                      {(e.tags ?? []).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTagFilter(tagFilter === t ? null : t)}
                          className="rounded transition-all"
                          style={{
                            background: tagFilter === t ? 'var(--accent)' : 'var(--bg-elevated)',
                            color: tagFilter === t ? '#09090b' : 'var(--text-3)',
                            border: `1px solid ${tagFilter === t ? 'var(--accent)' : 'var(--border-soft)'}`,
                            fontSize: 10,
                            padding: '1px 6px',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                          }}
                        >
                          #{t}
                        </button>
                      ))}
                    </div>
                    {e.notes ? (
                      <p className="text-xs truncate" style={{ color: 'var(--text-3)', fontWeight: 400 }}>{e.notes}</p>
                    ) : (
                      <p className="text-xs hidden sm:block" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
                        {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        {' – '}
                        {end ? end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'running'}
                      </p>
                    )}
                  </div>

                  {/* Right side */}
                  {isDeleting ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDeleteEntry(e._id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest"
                        style={{ background: 'rgba(251,44,54,0.1)', border: '1px solid rgba(251,44,54,0.25)', color: 'var(--danger)', letterSpacing: '0.08em' }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-2)', letterSpacing: '0.08em' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
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
                      {!e.isRunning && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingEntry(e)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
                            title="Edit"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeletingId(e._id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
                            title="Delete"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {showEntryModal && (
        <EntryModal onClose={() => setShowEntryModal(false)} defaultDate={viewDate} />
      )}
      {editingEntry && (
        <EditEntryModal
          entry={editingEntry}
          onClose={() => {
            setEditingEntry(null)
            qc.invalidateQueries({ queryKey: ['entries'] })
            qc.invalidateQueries({ queryKey: ['insights'] })
          }}
        />
      )}
    </>
  )
}
