'use client'

import { useEffect, useState } from 'react'

// ── Character pools ───────────────────────────────────────────────
const POOLS = [
  '░▒▓▪▫·∙•◦○◉●◎',
  '╱╲╳┼╋╬│─┤├┬┴┐└┘┌',
  '01101001110100110',
  '▲▼◀▶△▽◁▷◆◇■□▩▨▧',
  '@#$%^&*!?~+=<>[]{}|\\',
  'abcdefghijklmnopqrstuvwxyz',
  '∞∑∏∂∇∈∉∩∪⊂⊃⊕⊗≈≠≤≥',
  '⌘⌥⌃⇧⇥⌫⌦↑↓←→⇐⇒⇑⇓',
]

// ── Seeded LCG random (stable per seed) ──────────────────────────
function lcg(seed: number) {
  let s = seed >>> 0
  return () => {
    s = Math.imul(s, 1664525) + 1013904223 >>> 0
    return s / 0x100000000
  }
}

// ── Pattern generators ────────────────────────────────────────────
function noisePatch(rand: () => number, w: number, h: number, pool: string, density: number): string {
  const rows: string[] = []
  for (let r = 0; r < h; r++) {
    let line = ''
    for (let c = 0; c < w; c++) {
      line += rand() < density ? pool[Math.floor(rand() * pool.length)] : ' '
    }
    rows.push(line)
  }
  return rows.join('\n')
}

function diagonalStripe(rand: () => number, w: number, h: number, pool: string): string {
  const rows: string[] = []
  for (let r = 0; r < h; r++) {
    let line = ''
    for (let c = 0; c < w; c++) {
      const on = ((r + c) % 4 === 0) || ((r - c + 999) % 7 === 0)
      line += on ? pool[Math.floor(rand() * pool.length)] : ' '
    }
    rows.push(line)
  }
  return rows.join('\n')
}

function cascadeColumn(rand: () => number, w: number, h: number, pool: string, tick: number): string {
  const rows: string[] = []
  for (let r = 0; r < h; r++) {
    let line = ''
    for (let c = 0; c < w; c++) {
      const drop = ((r + tick * 2 + c * 3) % h) < Math.floor(h * 0.4)
      line += drop ? pool[Math.floor(rand() * pool.length)] : ' '
    }
    rows.push(line)
  }
  return rows.join('\n')
}

function glitchBlock(rand: () => number, w: number, h: number, pool: string): string {
  const rows: string[] = []
  for (let r = 0; r < h; r++) {
    const rowFull = rand() < 0.25
    let line = ''
    for (let c = 0; c < w; c++) {
      line += rowFull || rand() < 0.6 ? pool[Math.floor(rand() * pool.length)] : ' '
    }
    rows.push(line)
  }
  return rows.join('\n')
}

// ── Block definitions ─────────────────────────────────────────────
type BlockDef = {
  top: string; left: string; w: number; h: number
  fontSize: number; opacity: number; rotate: number
  poolIdx: number; style: 'noise' | 'diagonal' | 'cascade' | 'glitch'
  density: number; speed: number  // speed = how many ticks to skip between updates
}

const BLOCKS: BlockDef[] = [
  { top:  '1%', left:  '0%',  w: 18, h:  8, fontSize:  8, opacity: 0.13, rotate:  -6, poolIdx: 0, style: 'noise',    density: 0.55, speed: 1 },
  { top:  '3%', left: '68%',  w: 22, h: 10, fontSize:  9, opacity: 0.11, rotate:  12, poolIdx: 1, style: 'diagonal', density: 0.4,  speed: 0 },
  { top: '16%', left: '84%',  w: 14, h: 12, fontSize:  7, opacity: 0.14, rotate:  -3, poolIdx: 2, style: 'cascade',  density: 0.5,  speed: 1 },
  { top: '22%', left:  '3%',  w: 20, h:  9, fontSize: 10, opacity: 0.10, rotate:  18, poolIdx: 3, style: 'glitch',   density: 0.45, speed: 2 },
  { top: '35%', left: '44%',  w: 16, h: 14, fontSize:  8, opacity: 0.09, rotate:  -8, poolIdx: 4, style: 'noise',    density: 0.5,  speed: 1 },
  { top: '50%', left: '76%',  w: 20, h:  8, fontSize:  9, opacity: 0.12, rotate:   6, poolIdx: 5, style: 'cascade',  density: 0.4,  speed: 1 },
  { top: '58%', left:  '0%',  w: 18, h: 11, fontSize:  8, opacity: 0.11, rotate: -14, poolIdx: 6, style: 'diagonal', density: 0.5,  speed: 0 },
  { top: '70%', left: '32%',  w: 14, h:  9, fontSize:  7, opacity: 0.13, rotate:  10, poolIdx: 7, style: 'glitch',   density: 0.55, speed: 2 },
  { top: '78%', left: '62%',  w: 22, h: 12, fontSize:  9, opacity: 0.10, rotate: -18, poolIdx: 0, style: 'noise',    density: 0.45, speed: 1 },
  { top: '88%', left: '16%',  w: 20, h:  8, fontSize: 10, opacity: 0.12, rotate:   4, poolIdx: 2, style: 'cascade',  density: 0.5,  speed: 1 },
]

// ── Component ─────────────────────────────────────────────────────
export default function AsciiClocksBg() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden"
      aria-hidden="true"
    >
      {BLOCKS.map((b, i) => {
        // blocks with speed>0 only update every N ticks
        const seed = b.speed === 0 ? i * 999 : i * 999 + Math.floor(tick / (b.speed + 1))
        const rand = lcg(seed)
        const pool = POOLS[b.poolIdx]

        let text: string
        switch (b.style) {
          case 'diagonal': text = diagonalStripe(rand, b.w, b.h, pool);          break
          case 'cascade':  text = cascadeColumn(rand, b.w, b.h, pool, tick);     break
          case 'glitch':   text = glitchBlock(rand, b.w, b.h, pool);             break
          default:         text = noisePatch(rand, b.w, b.h, pool, b.density);   break
        }

        return (
          <pre
            key={i}
            style={{
              position:     'absolute',
              top:           b.top,
              left:          b.left,
              fontSize:      b.fontSize,
              lineHeight:    1.4,
              opacity:       b.opacity,
              transform:    `rotate(${b.rotate}deg)`,
              color:        'var(--accent)',
              fontFamily:   'monospace',
              margin:        0,
              padding:       0,
              whiteSpace:   'pre',
              letterSpacing: 0,
            }}
          >
            {text}
          </pre>
        )
      })}
    </div>
  )
}
