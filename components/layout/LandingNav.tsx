'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Categories', href: '#categories' },
]

export default function LandingNav({ hasSession }: { hasSession: boolean }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <>
      <nav
        className="sticky top-0 z-50"
        style={{
          borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
          background: scrolled ? 'rgba(7,7,15,0.95)' : 'rgba(7,7,15,0.7)',
          backdropFilter: 'blur(16px)',
          transition: 'border-color 0.2s, background 0.2s',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-8 flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
              style={{ background: 'var(--accent)', color: '#09090b' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span
              className="text-sm font-bold tracking-widest uppercase"
              style={{ color: 'var(--text-1)' }}
            >
              HOURR
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="px-3 py-1.5 rounded text-xs font-medium tracking-wide transition-colors"
                style={{ color: 'var(--text-3)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {hasSession ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                style={{ background: 'var(--accent)', color: '#09090b' }}
              >
                Dashboard
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                  style={{ color: 'var(--text-2)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                  style={{ background: 'var(--accent)', color: '#09090b' }}
                >
                  Get started
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: auth shortcut + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {hasSession ? (
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest"
                style={{ background: 'var(--accent)', color: '#09090b' }}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest"
                style={{ background: 'var(--accent)', color: '#09090b' }}
              >
                Start free
              </Link>
            )}
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
              style={{
                background: open ? 'var(--bg-elevated)' : 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-2)',
              }}
              aria-label="Toggle menu"
            >
              {open ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {open && (
          <div
            className="md:hidden px-4 pb-4 flex flex-col gap-1"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-lg text-sm font-medium transition-colors"
                style={{ color: 'var(--text-2)' }}
              >
                {l.label}
              </a>
            ))}
            <div className="h-px my-1" style={{ background: 'var(--border)' }} />
            {!hasSession && (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-lg text-sm font-bold text-center transition-colors"
                style={{ color: 'var(--text-2)', border: '1px solid var(--border)' }}
              >
                Sign in
              </Link>
            )}
          </div>
        )}
      </nav>
    </>
  )
}
