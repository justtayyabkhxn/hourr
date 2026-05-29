'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DataPoint { label: string; minutes: number }

function fmtDur(m: number) {
  if (!m) return '0'
  const h = Math.floor(m / 60), rem = m % 60
  return h > 0 ? (rem > 0 ? `${h}h${rem}m` : `${h}h`) : `${rem}m`
}

export default function TrendLine({ data, color = 'var(--accent)' }: { data: DataPoint[]; color?: string }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-40" style={{ color: 'var(--text-3)' }}>
        <span className="text-sm">No data for this period</span>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color.replace(/[^a-z]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmtDur} tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            return (
              <div className="px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                <div className="text-xs mb-0.5" style={{ color: 'var(--text-3)' }}>{label}</div>
                <div className="font-semibold" style={{ color }}>{fmtDur(payload[0].value as number)}</div>
              </div>
            )
          }}
        />
        <Area
          type="monotone"
          dataKey="minutes"
          stroke={color}
          strokeWidth={2}
          fill={`url(#grad-${color.replace(/[^a-z]/gi, '')})`}
          dot={{ fill: color, r: 3, strokeWidth: 0 }}
          activeDot={{ fill: color, r: 5, strokeWidth: 2, stroke: 'var(--bg)' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
