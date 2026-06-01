'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CATEGORIES } from '@/lib/utils/categories'
import TimePicker, { TimeValue, dateToTimeValue, timeValueTo24h } from '@/components/TimePicker'

export default function EntryModal({ onClose, defaultDate }: { onClose: () => void; defaultDate?: string }) {
  const today = defaultDate ?? new Date().toISOString().split('T')[0]
  const now = new Date()
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  const [form, setForm] = useState({
    date: today,
    category: 'work',
    notes: '',
    tags: '',
  })
  const [startTime, setStartTime] = useState<TimeValue>(dateToTimeValue(hourAgo))
  const [endTime, setEndTime] = useState<TimeValue>(dateToTimeValue(now))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const qc = useQueryClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const start = new Date(`${form.date}T${timeValueTo24h(startTime)}`)
    const end = new Date(`${form.date}T${timeValueTo24h(endTime)}`)
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
        className="relative w-full max-w-md rounded-xl animate-slide-up overflow-y-auto"
        style={{
          zIndex: 51,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.5), 0 24px 64px rgba(0,0,0,0.6)',
          maxHeight: '92dvh',
          padding: '1rem',
        }}
      >

        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-1)', letterSpacing: '0.1em' }}>Log time</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)', fontWeight: 400 }}>Add a past session</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all hover:opacity-70 flex-shrink-0"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <div>
            <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-2.5 py-2"
              style={{ fontSize: 14 }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>Start</label>
              <TimePicker value={startTime} onChange={setStartTime} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>End</label>
              <TimePicker value={endTime} onChange={setEndTime} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2"
              style={{ fontSize: 14 }}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>Note</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="What were you doing?"
              className="w-full px-3 py-2"
              style={{ fontWeight: 400, fontSize: 16 }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="client, project-x"
              className="w-full px-3 py-2"
              style={{ fontWeight: 400, fontSize: 16 }}
            />
          </div>

          {error && (
            <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(251,44,54,0.08)', border: '1px solid rgba(251,44,54,0.2)', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:opacity-80"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-2)', letterSpacing: '0.08em' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-opacity disabled:opacity-40 hover:opacity-80"
              style={{ background: 'var(--accent)', color: '#09090b', letterSpacing: '0.08em' }}
            >
              {loading ? 'Saving…' : 'Log entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
