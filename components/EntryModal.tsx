'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CATEGORIES } from '@/lib/utils/categories'
import { formatTimeInput } from '@/lib/utils/time'

export default function EntryModal({ onClose, defaultDate }: { onClose: () => void; defaultDate?: string }) {
  const today = defaultDate ?? new Date().toISOString().split('T')[0]
  const now = new Date()
  const [form, setForm] = useState({
    date: today,
    startTime: formatTimeInput(new Date(now.getTime() - 60 * 60 * 1000)),
    endTime: formatTimeInput(now),
    category: 'work',
    notes: '',
    tags: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const qc = useQueryClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const start = new Date(`${form.date}T${form.startTime}`)
    const end = new Date(`${form.date}T${form.endTime}`)
    if (end <= start) { setError('End time must be after start time'); setLoading(false); return }

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          category: form.category,
          notes: form.notes,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          isRunning: false,
        }),
      })
      if (!res.ok) { setError((await res.json()).error ?? 'Failed'); return }
      qc.invalidateQueries({ queryKey: ['entries'] })
      qc.invalidateQueries({ queryKey: ['insights'] })
      onClose()
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md p-6 rounded-lg animate-slide-up"
        style={{ zIndex: 51, background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-1)' }}>
              Log time
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)', fontWeight: 400 }}>Add a past session</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-xs transition-all"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2.5" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>Start</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full px-3 py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>End</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full px-3 py-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>Category</label>
            <div className="grid grid-cols-2 gap-1">
              {CATEGORIES.map((c) => {
                const sel = form.category === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setForm({ ...form, category: c.id })}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all"
                    style={{
                      background: sel ? `${c.color}14` : 'var(--bg-elevated)',
                      border: `1px solid ${sel ? c.color + '35' : 'var(--border-soft)'}`,
                      borderLeft: `2px solid ${sel ? c.color : 'transparent'}`,
                    }}
                  >
                    <span
                      style={{ display: 'flex', alignItems: 'center', color: sel ? c.color : 'var(--text-3)' }}
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

          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>Note</label>
            <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="What were you doing?" className="w-full px-3 py-2.5" style={{ fontWeight: 400 }} />
          </div>

          {error && (
            <div className="px-3 py-2.5 rounded text-xs" style={{ background: 'rgba(251,44,54,0.08)', border: '1px solid rgba(251,44,54,0.2)', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-opacity disabled:opacity-40 hover:opacity-80" style={{ background: 'var(--accent)', color: '#09090b' }}>
              {loading ? 'Saving…' : 'Log entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
