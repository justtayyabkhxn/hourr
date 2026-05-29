interface Props {
  label: string
  value: string
  sub?: string
  accent?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
}

const TREND = {
  up: {
    color: 'var(--success)',
    icon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
    ),
  },
  down: {
    color: 'var(--danger)',
    icon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    ),
  },
  neutral: {
    color: 'var(--warning)',
    icon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
  },
}

export default function StatCard({ label, value, sub, accent, trend, icon }: Props) {
  const trendInfo = trend ? TREND[trend] : null

  return (
    <div
      className="p-4 rounded-lg"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderTop: accent ? `2px solid ${accent}` : '1px solid var(--border)',
        boxShadow: accent ? `0 -1px 16px ${accent}14` : 'none',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
          {label}
        </span>
        {icon && (
          <span style={{ color: accent ?? 'var(--text-3)', opacity: 0.45 }}>{icon}</span>
        )}
      </div>

      <div className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-1)', lineHeight: 1 }}>
        {value}
      </div>

      <div className="flex items-center gap-1.5">
        {trendInfo && (
          <span
            className="flex items-center justify-center w-4 h-4 rounded"
            style={{ color: trendInfo.color, background: `${trendInfo.color}18` }}
          >
            {trendInfo.icon}
          </span>
        )}
        {sub && (
          <span className="text-xs" style={{ color: 'var(--text-3)', fontWeight: 400 }}>{sub}</span>
        )}
      </div>
    </div>
  )
}
