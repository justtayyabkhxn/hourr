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
    label: '↑',
  },
  down: {
    color: 'var(--danger)',
    label: '↓',
  },
  neutral: {
    color: 'var(--warning)',
    label: '→',
  },
}

export default function StatCard({ label, value, sub, accent, trend, icon }: Props) {
  const trendInfo = trend ? TREND[trend] : null

  return (
    <div
      className="relative overflow-hidden p-5 rounded-xl"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderTop: `2px solid ${accent ?? 'var(--border)'}`,
      }}
    >
      {/* Accent gradient bleed */}
      {accent && (
        <div
          className="absolute inset-x-0 top-0 h-20 pointer-events-none"
          style={{ background: `linear-gradient(180deg, ${accent}0d 0%, transparent 100%)` }}
        />
      )}

      <div className="relative flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}
          >
            {label}
          </span>
          {icon && (
            <span style={{ color: accent ?? 'var(--text-3)', opacity: 0.4 }}>{icon}</span>
          )}
        </div>

        <div
          className="font-bold tabular-nums leading-none"
          style={{ color: 'var(--text-1)', fontSize: 'clamp(1.5rem, 3vw, 1.875rem)' }}
        >
          {value}
        </div>

        <div className="flex items-center gap-2">
          {trendInfo && (
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded"
              style={{ color: trendInfo.color, background: `${trendInfo.color}15`, letterSpacing: '0.04em' }}
            >
              {trendInfo.label}
            </span>
          )}
          {sub && (
            <span className="text-xs" style={{ color: 'var(--text-3)', fontWeight: 400 }}>{sub}</span>
          )}
        </div>
      </div>
    </div>
  )
}
