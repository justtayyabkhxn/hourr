interface Insight {
  content: string
  metric?: string
  trend?: 'up' | 'down' | 'neutral'
}

const TREND = {
  up:      { color: 'var(--success)', bg: 'rgba(0,187,127,0.08)',  border: 'rgba(0,187,127,0.2)',  icon: '↑' },
  down:    { color: 'var(--danger)',  bg: 'rgba(251,44,54,0.08)',  border: 'rgba(251,44,54,0.2)',  icon: '↓' },
  neutral: { color: 'var(--warning)', bg: 'rgba(237,178,0,0.08)', border: 'rgba(237,178,0,0.2)',  icon: '→' },
}

export default function InsightCard({ insights, loading }: { insights: Insight[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="p-5 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-3 rounded animate-pulse" style={{ background: 'var(--bg-elevated)', width: i === 1 ? '100%' : '70%' }} />
          ))}
        </div>
      </div>
    )
  }

  if (!insights?.length) return null

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: '1px solid var(--border-soft)', borderLeft: '2px solid var(--accent)' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
          Insights
        </span>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {insights.map((ins, i) => {
          const t = ins.trend ? TREND[ins.trend] : null
          return (
            <div key={i}>
              <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-1)', fontWeight: 400 }}>
                {ins.content}
              </p>
              {ins.metric && t && (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-widest"
                  style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.color }}
                >
                  {t.icon} {ins.metric}
                </span>
              )}
              {i < insights.length - 1 && (
                <div className="mt-4 h-px" style={{ background: 'var(--border-soft)' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
