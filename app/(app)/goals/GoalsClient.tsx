'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import GoalCard from '@/components/cards/GoalCard'
import { CATEGORIES } from '@/lib/utils/categories'

interface Goal {
  _id: string; title: string; targetHours: number; category: string; period: string; currentMinutes: number
}

export default function GoalsClient({ goals: initialGoals }: { goals: Goal[] }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', targetHours: '4', category: 'work', period: 'daily' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const qc = useQueryClient()

  const { data: goalsData } = useQuery<{ goals: Goal[] }>({
    queryKey: ['goals'],
    queryFn: () => fetch('/api/goals').then((r) => r.json()),
    initialData: { goals: initialGoals },
  })
  const goals = goalsData?.goals ?? initialGoals

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, targetHours: parseFloat(form.targetHours), category: form.category, period: form.period }),
      })
      if (!res.ok) { setError((await res.json()).error ?? 'Failed'); return }
      qc.invalidateQueries({ queryKey: ['goals'] })
      setForm({ title: '', targetHours: '4', category: 'work', period: 'daily' })
      setShowForm(false)
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  const daily = goals.filter((g) => g.period === 'daily')
  const weekly = goals.filter((g) => g.period === 'weekly')

  return (
    <>
      {/* Action row */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
          Set time targets per category and track progress.
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-3 py-2 rounded text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{ background: 'var(--accent)', color: '#09090b' }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New goal
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="p-5 rounded-lg mb-5 animate-slide-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-1)' }}>Create a goal</h3>
          <p className="text-xs mb-5" style={{ color: 'var(--text-3)', fontWeight: 400 }}>Set a time target for a category.</p>

          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>Goal name</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Deep work" className="w-full px-3 py-2.5" style={{ fontWeight: 400 }} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>Hours target</label>
                <input type="number" required min="0.25" max="24" step="0.25" value={form.targetHours} onChange={(e) => setForm({ ...form, targetHours: e.target.value })} className="w-full px-3 py-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
                {CATEGORIES.map((c) => {
                  const sel = form.category === c.id
                  return (
                    <button
                      key={c.id} type="button"
                      onClick={() => setForm({ ...form, category: c.id })}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all"
                      style={{
                        background: sel ? `${c.color}14` : 'var(--bg-elevated)',
                        border: `1px solid ${sel ? c.color + '35' : 'var(--border-soft)'}`,
                        borderLeft: `2px solid ${sel ? c.color : 'transparent'}`,
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', color: sel ? c.color : 'var(--text-3)' }}>
                        {c.icon}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-widest truncate" style={{ color: sel ? c.color : 'var(--text-2)' }}>
                        {c.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>Period</label>
              <div className="flex gap-2">
                {[{ id: 'daily', label: 'Daily' }, { id: 'weekly', label: 'Weekly' }].map((p) => (
                  <button
                    key={p.id} type="button"
                    onClick={() => setForm({ ...form, period: p.id })}
                    className="flex-1 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all"
                    style={{
                      background: form.period === p.id ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                      border: form.period === p.id ? '1px solid rgba(0,187,127,0.25)' : '1px solid var(--border)',
                      color: form.period === p.id ? 'var(--accent)' : 'var(--text-2)',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="px-3 py-2.5 rounded text-xs" style={{ background: 'rgba(251,44,54,0.08)', border: '1px solid rgba(251,44,54,0.2)', color: 'var(--danger)' }}>
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded text-xs font-bold uppercase tracking-widest" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-opacity disabled:opacity-40 hover:opacity-80" style={{ background: 'var(--accent)', color: '#09090b' }}>
                {loading ? 'Saving…' : 'Create goal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty */}
      {goals.length === 0 && !showForm && (
        <div className="p-16 rounded-lg text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl mx-auto mb-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-1)' }}>No goals yet</h3>
          <p className="text-xs max-w-xs mx-auto mb-6" style={{ color: 'var(--text-2)', fontWeight: 400 }}>
            Set a daily target and track yourself against it.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
            style={{ background: 'var(--accent)', color: '#09090b' }}
          >
            Create your first goal
          </button>
        </div>
      )}

      {/* Daily */}
      {daily.length > 0 && (
        <div className="mb-5">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Daily Goals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {daily.map((g) => <GoalCard key={g._id} goal={g} currentMinutes={g.currentMinutes} />)}
          </div>
        </div>
      )}

      {/* Weekly */}
      {weekly.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Weekly Goals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {weekly.map((g) => <GoalCard key={g._id} goal={g} currentMinutes={g.currentMinutes} />)}
          </div>
        </div>
      )}
    </>
  )
}
