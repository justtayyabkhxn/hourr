'use client'

import { useState } from 'react'
import { CATEGORIES } from '@/lib/utils/categories'
import TimePicker, { TimeValue, dateToTimeValue, timeValueTo24h } from '@/components/TimePicker'

interface Entry {
  _id: string
  startTime: string
  endTime: string | null
  category: string
  notes: string
  tags: string[]
  isRunning: boolean
}

export default function EditEntryModal({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  const dateStr = entry.startTime.split('T')[0]

  const [form, setForm] = useState({
    date: dateStr,
    category: entry.category,
    notes: entry.notes ?? '',
    tags: (entry.tags ?? []).join(', '),
  })
  const [startTime, setStartTime] = useState<TimeValue>(dateToTimeValue(new Date(entry.startTime)))
  const [endTime, setEndTime] = useState<TimeValue>(
    entry.endTime ? dateToTimeValue(new Date(entry.endTime)) : dateToTimeValue(new Date())
  )
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const start = new Date(`${form.date}T${timeValueTo24h(startTime)}`)
    const end = entry.isRunning ? null : new Date(`${form.date}T${timeValueTo24h(endTime)}`)
    if (end && end <= start) { setError('End time must be after start time'); setLoading(false); return }

    try {
      const res = await fetch(`/api/entries/${entry._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: start.toISOString(),
          ...(end ? { endTime: end.toISOString() } : {}),
          category: form.category,
          notes: form.notes,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })
      if (!res.ok) { setError((await res.json()).error ?? 'Failed'); return }
      onClose()
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch(`/api/entries/${entry._id}`, { method: 'DELETE' })
      onClose()
    } catch { setError('Delete failed') }
    finally { setDeleting(false) }
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
            <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-1)', letterSpacing: '0.1em' }}>Edit entry</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)', fontWeight: 400 }}>Update or delete this session</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all hover:opacity-70 flex-shrink-0"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-3 sm:py-2.5" style={{ fontSize: 16 }} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>Start</label>
              <TimePicker value={startTime} onChange={setStartTime} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>End</label>
              <TimePicker value={endTime} onChange={setEndTime} disabled={entry.isRunning} />
            </div>
          </div>

          {entry.isRunning && (
            <p className="text-xs" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
              End time is locked — stop the timer first to change it.
            </p>
          )}

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
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>Note</label>
            <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="What were you doing?" className="w-full px-3 py-3 sm:py-2.5" style={{ fontWeight: 400, fontSize: 16 }} />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>Tags</label>
            <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="client, project-x" className="w-full px-3 py-3 sm:py-2.5" style={{ fontWeight: 400, fontSize: 16 }} />
          </div>

          {error && (
            <div className="px-3 py-2.5 rounded-lg text-xs" style={{ background: 'rgba(251,44,54,0.08)', border: '1px solid rgba(251,44,54,0.2)', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2 mt-1">
            {confirmDelete ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-opacity disabled:opacity-40"
                  style={{ background: 'rgba(251,44,54,0.1)', border: '1px solid rgba(251,44,54,0.25)', color: 'var(--danger)', letterSpacing: '0.08em' }}
                >
                  {deleting ? 'Deleting…' : 'Confirm delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-2)', letterSpacing: '0.08em' }}
                >
                  Keep
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-2)', letterSpacing: '0.08em' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-opacity disabled:opacity-40 hover:opacity-80"
                    style={{ background: 'var(--accent)', color: '#09090b', letterSpacing: '0.08em' }}
                  >
                    {loading ? 'Saving…' : 'Save'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
                  style={{ background: 'transparent', border: '1px solid rgba(251,44,54,0.2)', color: 'var(--danger)', letterSpacing: '0.08em' }}
                >
                  Delete entry
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
