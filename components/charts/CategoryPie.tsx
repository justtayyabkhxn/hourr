'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { getCategoryById } from '@/lib/utils/categories'

interface Props {
  data: Record<string, number>
}

function fmtDur(m: number) {
  if (!m) return '0m'
  const h = Math.floor(m / 60), rem = Math.round(m % 60)
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`
}

export default function CategoryPie({ data }: Props) {
  const entries = Object.entries(data)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, mins]) => ({ name: getCategoryById(cat).label, value: mins, color: getCategoryById(cat).color, catId: cat }))

  if (!entries.length) {
    return (
      <div className="flex items-center justify-center h-44" style={{ color: 'var(--text-3)' }}>
        <span className="text-sm">No data yet</span>
      </div>
    )
  }

  const total = entries.reduce((s, e) => s + e.value, 0)

  return (
    <div className="flex items-center gap-6">
      <div className="shrink-0" style={{ width: 160, height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={entries} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={2} dataKey="value" strokeWidth={0}>
              {entries.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload
                return (
                  <div className="px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                    <div className="font-semibold" style={{ color: d.color }}>{d.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{fmtDur(d.value)}</div>
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-2.5 flex-1">
        {entries.slice(0, 6).map((e) => {
          const pct = Math.round((e.value / total) * 100)
          return (
            <div key={e.catId} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: e.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--text-2)' }}>{e.name}</span>
                  <span className="font-medium" style={{ color: 'var(--text-1)' }}>{fmtDur(e.value)}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: e.color }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
