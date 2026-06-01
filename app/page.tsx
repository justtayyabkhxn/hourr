import Link from 'next/link'
import { getSession } from '@/lib/auth'
import LandingNav from '@/components/layout/LandingNav'

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Live Timer', desc: 'Start tracking with one click. Every second counts.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="4" rx="1"/><rect x="3" y="10" width="12" height="4" rx="1"/><rect x="3" y="17" width="16" height="4" rx="1"/>
      </svg>
    ),
    title: 'Visual Timeline', desc: 'See your full day as a color-coded 24h bar.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
    title: 'Deep Analytics', desc: 'Weekly trends, hourly heatmaps, category breakdowns.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: 'Instant Insights', desc: 'Know your peak hours and focus ratio automatically.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    title: 'Goal Tracking', desc: 'Set daily and weekly targets. Watch progress fill.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: 'Private by Default', desc: 'Your data stays yours. No ads, no tracking.',
  },
]

const STEPS = [
  { n: '01', title: 'Start a timer', desc: 'Hit start when you begin working. Choose a category. Add a note.' },
  { n: '02', title: 'See your day', desc: 'Watch the timeline fill in as you work. Gaps become visible.' },
  { n: '03', title: 'Discover patterns', desc: 'Hourr generates insights about when you\'re most focused.' },
]

const CATS = [
  { label: 'Work',       color: '#00bb7f' },
  { label: 'Study',      color: '#3080ff' },
  { label: 'Exercise',   color: '#00bb7f' },
  { label: 'Personal',   color: '#ec4899' },
  { label: 'Break',      color: '#edb200' },
  { label: 'Social',     color: '#f97316' },
  { label: 'Creative',   color: '#a685ff' },
  { label: 'Distraction',color: '#71717b' },
  { label: 'Sleep',      color: '#8b5cf6' },
  { label: 'Commuting',  color: '#60A5FA' },
  { label: 'Other',      color: '#14b8a6' },
]

export default async function LandingPage() {
  const session = await getSession()

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--bg)' }}>

      {/* ─── Nav ─────────────────────────────────────────────────── */}
      <LandingNav hasSession={!!session} />

      {/* ─── Hero ────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 pt-20 sm:pt-32 pb-16 sm:pb-24">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-6 sm:mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest"
            style={{ background: 'var(--accent-dim)', border: '1px solid rgba(0,187,127,0.2)', color: 'var(--accent)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)' }} />
            Time intelligence system
          </div>
          <a
            href="https://github.com/weforprivacy/hourr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
            </svg>
            Open source
          </a>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold leading-tight tracking-tight mb-5 sm:mb-6" style={{ color: 'var(--text-1)' }}>
          Stop wondering<br />
          <span style={{ color: 'var(--accent)' }}>where time goes.</span>
        </h1>

        <p className="text-sm max-w-lg mb-8 sm:mb-10 leading-relaxed" style={{ color: 'var(--text-2)', fontWeight: 400 }}>
          Hourr tracks your time, reveals patterns, and generates insights about how you actually spend your day. No fluff. Just data.
        </p>

        <div className="flex flex-col xs:flex-row flex-wrap items-start xs:items-center gap-3 mb-12 sm:mb-20">
          <Link
            href={session ? '/dashboard' : '/register'}
            className="px-6 py-3 rounded text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
            style={{ background: 'var(--accent)', color: '#09090b' }}
          >
            {session ? 'Open dashboard' : 'Start tracking free'} →
          </Link>
          {!session && (
            <Link
              href="/login"
              className="px-6 py-3 rounded text-sm font-bold uppercase tracking-widest transition-all"
              style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Dashboard preview */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#fb2c36' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#edb200' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#00bb7f' }} />
            <span className="text-xs ml-3" style={{ color: 'var(--text-3)', fontWeight: 400 }}>hourr — dashboard</span>
          </div>

          {/* Mock dashboard content */}
          <div className="p-4 sm:p-6">
            {/* Timer bar */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded mb-4"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-3)', fontWeight: 400 }}>Work</span>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)' }} />
                  <span className="text-lg font-bold" style={{ color: 'var(--accent)' }}>02:14:33</span>
                </div>
              </div>
              <div
                className="px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest"
                style={{ background: 'rgba(251,44,54,0.1)', border: '1px solid rgba(251,44,54,0.2)', color: 'var(--danger)' }}
              >
                Stop
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Tracked', value: '7h 23m' },
                { label: 'Focus', value: '82%' },
                { label: 'Sessions', value: '6' },
                { label: 'Peak', value: '10am' },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-3)', fontWeight: 400 }}>{s.label}</div>
                  <div className="text-base font-bold" style={{ color: 'var(--text-1)' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Timeline bar */}
            <div className="rounded overflow-hidden" style={{ background: 'var(--bg-input)', height: 32, position: 'relative', border: '1px solid var(--border-soft)' }}>
              {[
                { left: 0,   w: 12, color: '#8b5cf6' },
                { left: 14,  w: 8,  color: '#00bb7f' },
                { left: 23,  w: 3,  color: '#edb200' },
                { left: 27,  w: 13, color: '#00bb7f' },
                { left: 41,  w: 5,  color: '#3080ff' },
                { left: 47,  w: 2,  color: '#edb200' },
                { left: 50,  w: 10, color: '#00bb7f' },
                { left: 61,  w: 5,  color: '#ec4899' },
              ].map((b, i) => (
                <div
                  key={i}
                  className="absolute top-1 bottom-1 rounded"
                  style={{ left: `${b.left}%`, width: `${b.w}%`, background: `${b.color}CC` }}
                />
              ))}
              <div className="absolute top-0 bottom-0 w-px" style={{ left: '72%', background: 'var(--accent)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats bar ───────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-10 grid grid-cols-3 gap-4 sm:gap-8">
          {[
            { value: '24h', label: 'Full day timeline' },
            { value: '11', label: 'Built-in categories' },
            { value: '0', label: 'Ads or trackers' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-bold mb-1" style={{ color: 'var(--accent)' }}>{s.value}</div>
              <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-3)', fontWeight: 400 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Features ────────────────────────────────────────────── */}
      <section id="features" className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
        <div className="mb-10 sm:mb-14">
          <div className="text-xs uppercase tracking-widest mb-3 font-bold" style={{ color: 'var(--accent)' }}>Features</div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>
            Everything you need to<br />
            <span style={{ color: 'var(--text-2)', fontWeight: 400 }}>understand your time.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-lg transition-colors"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg mb-4"
                style={{ background: 'var(--accent-dim)', border: '1px solid rgba(0,187,127,0.18)', color: 'var(--accent)' }}
              >
                {f.icon}
              </div>
              <h3 className="text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-1)' }}>
                {f.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)', fontWeight: 400 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How it works ────────────────────────────────────────── */}
      <section id="how-it-works" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <div className="mb-10 sm:mb-14">
            <div className="text-xs uppercase tracking-widest mb-3 font-bold" style={{ color: 'var(--accent)' }}>How it works</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>
              Three steps to<br />
              <span style={{ color: 'var(--text-2)', fontWeight: 400 }}>time clarity.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            {STEPS.map((s) => (
              <div key={s.n}>
                <div className="text-4xl font-bold mb-5" style={{ color: 'var(--accent)' }}>{s.n}</div>
                <h3 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-1)' }}>
                  {s.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)', fontWeight: 400 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ──────────────────────────────────────────── */}
      <section id="categories" className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-widest mb-3 font-bold" style={{ color: 'var(--accent)' }}>Categories</div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>10 built-in categories.</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <div
              key={c.label}
              className="px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest"
              style={{
                background: `${c.color}10`,
                border: `1px solid ${c.color}30`,
                color: c.color,
              }}
            >
              {c.label}
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pb-16 sm:pb-24">
        <div
          className="p-8 sm:p-16 rounded-lg text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="text-xs uppercase tracking-widest mb-4 font-bold" style={{ color: 'var(--accent)' }}>
            Get started
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3" style={{ color: 'var(--text-1)' }}>
            Your time is your only<br className="hidden sm:inline" /> non-renewable resource.
          </h2>
          <p className="text-sm mb-10" style={{ color: 'var(--text-2)', fontWeight: 400 }}>
            Start understanding it today. Free, forever. Open source.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={session ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 px-8 py-4 rounded text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
              style={{ background: 'var(--accent)', color: '#09090b' }}
            >
              {session ? 'Open your dashboard' : 'Create free account'} →
            </Link>
            <a
              href="https://github.com/weforprivacy/hourr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-4 rounded text-sm font-bold uppercase tracking-widest transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
              </svg>
              Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer
        className="px-4 sm:px-8 py-6"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>HOURR</span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/weforprivacy/hourr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: 'var(--text-3)', fontWeight: 400 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
              </svg>
              Open source
            </a>
            <span className="text-xs" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
              Time intelligence for intentional living.
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
