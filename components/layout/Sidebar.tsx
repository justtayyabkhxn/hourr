'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const NAV = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
        <line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
  },
  {
    href: '/goals',
    label: 'Goals',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
  },
]

function pad(n: number) { return String(n).padStart(2, '0') }

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [time, setTime] = useState('')

  useEffect(() => {
    function update() {
      const d = new Date()
      setTime(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <aside
      className="hidden md:flex flex-col w-52 shrink-0 h-full"
      style={{
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 h-14 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
          style={{
            background: 'rgba(0,187,127,0.1)',
            border: '1px solid rgba(0,187,127,0.2)',
            boxShadow: '0 0 16px rgba(0,187,127,0.1)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <span className="text-sm font-bold" style={{ color: 'var(--text-1)', letterSpacing: '0.18em' }}>
          HOURR
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col flex-1 px-3 py-4 gap-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all relative"
              style={active ? {
                color: 'var(--accent)',
                background: 'rgba(0,187,127,0.07)',
                border: '1px solid rgba(0,187,127,0.15)',
              } : {
                color: 'var(--text-3)',
                border: '1px solid transparent',
              }}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full"
                  style={{ background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }}
                />
              )}
              <span style={{ display: 'flex', alignItems: 'center', color: active ? 'var(--accent)' : 'inherit', flexShrink: 0 }}>
                {icon}
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 flex flex-col gap-1.5" style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 12 }}>
        {/* Clock */}
        {time && (
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-soft)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot shrink-0" style={{ background: 'var(--accent)' }} />
            <span
              className="tabular-nums text-xs font-bold flex-1"
              style={{ color: 'var(--accent)', letterSpacing: '0.1em' }}
            >
              {time}
            </span>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={logout}
          className="sidebar-link flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
          style={{ color: 'var(--text-3)', border: '1px solid transparent', letterSpacing: '0.08em' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}
