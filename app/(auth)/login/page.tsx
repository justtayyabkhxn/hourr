'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Login failed'); return }
      router.push('/dashboard')
      router.refresh()
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm animate-slide-up">

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-10">
          <span className="text-lg font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>HOURR</span>
        </Link>

        {/* Card */}
        <div className="p-7 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="mb-7">
            <h1 className="text-base font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-1)' }}>
              Sign in
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
              Welcome back to your time tracker.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
                Email
              </label>
              <input
                type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
                Password
              </label>
              <input
                type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2.5"
              />
            </div>

            {error && (
              <div
                className="px-3 py-2.5 rounded text-xs"
                style={{ background: 'rgba(251,44,54,0.08)', border: '1px solid rgba(251,44,54,0.2)', color: 'var(--danger)' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded text-xs font-bold uppercase tracking-widest mt-1 transition-opacity disabled:opacity-40"
              style={{ background: 'var(--accent)', color: '#09090b' }}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
          No account?{' '}
          <Link href="/register" className="font-bold" style={{ color: 'var(--accent)' }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}
