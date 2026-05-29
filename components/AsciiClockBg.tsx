'use client'

import { useEffect, useState } from 'react'

const D: Record<string, [string, string, string]> = {
  '0': [' _ ', '| |', '|_|'],
  '1': ['   ', ' | ', ' | '],
  '2': [' _ ', ' _|', '|_ '],
  '3': [' _ ', ' _|', ' _|'],
  '4': ['   ', '|_|', '  |'],
  '5': [' _ ', '|_ ', ' _|'],
  '6': [' _ ', '|_ ', '|_|'],
  '7': [' _ ', '  |', '  |'],
  '8': [' _ ', '|_|', '|_|'],
  '9': [' _ ', '|_|', ' _|'],
  ':': ['   ', ' : ', '   '],
}

function toAscii(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  const rows: [string, string, string] = ['', '', '']
  for (const ch of `${hh}:${mm}:${ss}`) {
    const seg = D[ch] ?? ['   ', '   ', '   ']
    rows[0] += seg[0]
    rows[1] += seg[1]
    rows[2] += seg[2]
  }
  return rows.join('\n')
}

const INSTANCES: Array<{
  pos: React.CSSProperties
  opacity: number
  fontSize: number
}> = [
  { pos: { top: '6%',    right: '4%'  },                                opacity: 0.055, fontSize: 18 },
  { pos: { top: '38%',   right: '2%'  },                                opacity: 0.04,  fontSize: 30 },
  { pos: { bottom: '6%', right: '6%'  },                                opacity: 0.04,  fontSize: 16 },
  { pos: { top: '12%',   left:  '60%' },                                opacity: 0.03,  fontSize: 13 },
  { pos: { top: '52%',   left:  '53%', transform: 'translateX(-50%)' }, opacity: 0.018, fontSize: 62 },
]

export default function AsciiClockBg() {
  const [ascii, setAscii] = useState('')

  useEffect(() => {
    function update() { setAscii(toAscii(new Date())) }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  if (!ascii) return null

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {INSTANCES.map(({ pos, opacity, fontSize }, i) => (
        <pre
          key={i}
          style={{
            position: 'absolute',
            ...pos,
            color: '#00bb7f',
            opacity,
            fontSize,
            lineHeight: 1.25,
            fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
            letterSpacing: '0.04em',
            userSelect: 'none',
            margin: 0,
            whiteSpace: 'pre',
          }}
        >
          {ascii}
        </pre>
      ))}
    </div>
  )
}
