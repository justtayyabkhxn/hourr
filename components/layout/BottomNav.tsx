'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    href: '/analytics',
    label: 'Stats',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex items-stretch"
      style={{
        background: 'rgba(13,13,17,0.96)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -1px 0 rgba(255,255,255,0.03), 0 -16px 40px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(16px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV.map(({ href, label, icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-1.5 flex-1 py-2.5 transition-all"
            style={{ color: active ? 'var(--accent)' : 'var(--text-3)' }}
          >
            <div
              className="flex items-center justify-center w-10 h-7 rounded-lg transition-all"
              style={active ? {
                background: 'rgba(0,187,127,0.12)',
                boxShadow: '0 0 12px rgba(0,187,127,0.15)',
              } : {}}
            >
              {icon}
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {label}
            </span>
          </Link>
        )
      })}

      {/* Sign out */}
      <button
        onClick={logout}
        className="flex flex-col items-center justify-center gap-1.5 flex-1 py-2.5 transition-all"
        style={{ color: 'var(--text-3)' }}
      >
        <div className="flex items-center justify-center w-10 h-7 rounded-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sign out</span>
      </button>
    </nav>
  )
}
