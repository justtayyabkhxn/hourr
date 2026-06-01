interface Insight {
  content: string
  metric?: string
  trend?: 'up' | 'down' | 'neutral'
}

const TREND = {
  up:      { color: 'var(--success)', bg: 'rgba(0,187,127,0.08)',  border: 'rgba(0,187,127,0.2)',  label: '↑' },
  down:    { color: 'var(--danger)',  bg: 'rgba(251,44,54,0.08)',  border: 'rgba(251,44,54,0.2)',  label: '↓' },
  neutral: { color: 'var(--warning)', bg: 'rgba(237,178,0,0.07)', border: 'rgba(237,178,0,0.18)', label: '→' },
}

export default function InsightCard({ insights, loading }: { insights: Insight[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="p-5 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-2.5 rounded-full animate-pulse" style={{ background: 'var(--bg-elevated)', width: i === 1 ? '80%' : i === 2 ? '60%' : '70%' }} />
          ))}
        </div>
      </div>
    )
  }

  if (!insights?.length) return null

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ borderBottom: '1px solid var(--border-soft)', borderLeft: '3px solid var(--accent)' }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)', letterSpacing: '0.1em' }}>
          Insights
        </span>
      </div>

      <div className="flex flex-col">
        {insights.map((ins, i) => {
          const t = ins.trend ? TREND[ins.trend] : null
          return (
            <div
              key={i}
              className="px-4 py-4"
              style={{
                borderTop: i > 0 ? '1px solid var(--border-soft)' : 'none',
                borderLeft: t ? `3px solid ${t.color}40` : '3px solid transparent',
              }}
            >
              <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-2)', fontWeight: 400, lineHeight: 1.7 }}>
                {ins.content}
              </p>
              {ins.metric && t && (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-widest"
                  style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.color, letterSpacing: '0.08em' }}
                >
                  {t.label} {ins.metric}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
