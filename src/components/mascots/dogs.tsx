import type { ReactNode } from 'react'
import type { CharacterId } from '@/types'

export type DogExpression = 'happy' | 'thinking' | 'proud'

export interface Palette {
  base: string
  shade: string
  light: string
  nose: string
  /** Light rim used on the black coat so it stays visible on the dark navy background. */
  outline?: string
}

/** Where the head sits. Hats and glasses are drawn for a reference head and mapped onto each dog with these numbers. */
export interface Anchor {
  cx: number
  cy: number
  rx: number
  ry: number
  /** Vertical shift and width scale for the collar, badge and neckwear. */
  neckDy: number
  neckScale: number
  badgeY: number
  badgeR: number
}

export const PALETTES: Record<CharacterId, Palette> = {
  vector: { base: '#6e452b', shade: '#4a2d1b', light: '#8c5d3f', nose: '#1d1411' },
  vertex: { base: '#efd085', shade: '#d3ae58', light: '#f8e8b4', nose: '#3a2a24' },
  axis: { base: '#33333b', shade: '#1b1b21', light: '#4e4e5b', nose: '#0d0d11', outline: '#8a97b5' },
  slope: { base: '#dba23d', shade: '#b47b22', light: '#efc979', nose: '#2a1d17' },
  curve: { base: '#f1e5cd', shade: '#d6c19a', light: '#faf3e3', nose: '#4a352c' },
}

export const ANCHORS: Record<CharacterId, Anchor> = {
  vector: { cx: 100, cy: 92, rx: 56, ry: 48, neckDy: 4, neckScale: 1.0, badgeY: 180, badgeR: 13 },
  vertex: { cx: 100, cy: 102, rx: 38, ry: 40, neckDy: 12, neckScale: 0.78, badgeY: 188, badgeR: 11 },
  axis: { cx: 100, cy: 86, rx: 40, ry: 46, neckDy: 4, neckScale: 0.88, badgeY: 182, badgeR: 12 },
  slope: { cx: 100, cy: 92, rx: 50, ry: 48, neckDy: 4, neckScale: 1.1, badgeY: 182, badgeR: 13 },
  curve: { cx: 100, cy: 99, rx: 46, ry: 43, neckDy: 8, neckScale: 0.94, badgeY: 186, badgeR: 12 },
}

interface Part {
  p: Palette
  a: Anchor
  expression: DogExpression
}

const eyePos = (a: Anchor) => ({ lx: a.cx - 18 * (a.rx / 47), rx: a.cx + 18 * (a.rx / 47), y: a.cy - 8 * (a.ry / 45) })
const line = (p: Palette) => (p.outline ? { stroke: p.outline, strokeWidth: 1.6, strokeLinejoin: 'round' as const } : {})

function Eye({ x, y, r, hl = 1.8 }: { x: number; y: number; r: number; hl?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#17100d" />
      <circle cx={x + r * 0.38} cy={y - r * 0.38} r={hl} fill="#fff" />
    </g>
  )
}

const Tongue = ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => <path d={`M${x - w} ${y} Q${x} ${y + h * 1.7} ${x + w} ${y} Z`} fill="#f2788f" />
const brow = (p: Palette, d: string) => <path d={d} stroke={p.shade} strokeWidth="3.4" fill="none" strokeLinecap="round" />

/** Extra raised brow when the character is "thinking". */
function Thinking({ p, x, y }: { p: Palette; x: number; y: number }) {
  return <path d={`M${x - 9} ${y - 12} Q${x} ${y - 20} ${x + 10} ${y - 13}`} stroke={p.shade} strokeWidth="3.6" fill="none" strokeLinecap="round" />
}

/* ---------------------------------------------------------------- Hector: broad, sturdy chocolate Labrador */
function HectorBody({ p }: Part) {
  return (
    <g {...line(p)} fill={p.base}>
      <rect x="66" y="116" width="68" height="50" />
      <path d="M14 204 Q18 150 62 138 L138 138 Q182 150 186 204 Z" />
    </g>
  )
}
function HectorHead({ p, a, expression }: Part) {
  const e = eyePos(a)
  return (
    <g>
      <g fill={p.shade} {...line(p)}>
        <path d="M52 64 Q22 70 22 116 Q26 138 52 128 Q62 104 62 76 Z" />
        <path d="M148 64 Q178 70 178 116 Q174 138 148 128 Q138 104 138 76 Z" />
      </g>
      <ellipse cx={a.cx} cy={a.cy} rx={a.rx} ry={a.ry} fill={p.base} {...line(p)} />
      <ellipse cx="100" cy="117" rx="38" ry="23" fill={p.light} />
      <rect x="86" y="99" width="28" height="16" rx="8" fill={p.nose} />
      <path d="M100 114 V123 M100 123 Q88 133 74 124 M100 123 Q113 133 128 120" stroke={p.nose} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {expression === 'happy' && <Tongue x={100} y={126} w={7} h={9} />}
      <Eye x={e.lx} y={e.y} r={4.6} />
      <Eye x={e.rx} y={e.y} r={4.6} />
      {brow(p, `M${e.lx - 10} ${e.y - 11} L${e.lx + 8} ${e.y - 8}`)}
      {expression === 'thinking' ? <Thinking p={p} x={e.rx} y={e.y} /> : brow(p, `M${e.rx - 8} ${e.y - 8} L${e.rx + 10} ${e.y - 11}`)}
    </g>
  )
}

/* ---------------------------------------------------------------- Tex: small, youthful pale-yellow Labrador */
function TexBody({ p }: Part) {
  return (
    <g {...line(p)} fill={p.base}>
      <rect x="74" y="126" width="52" height="50" />
      <ellipse cx="100" cy="208" rx="50" ry="52" />
    </g>
  )
}
function TexHead({ p, a, expression }: Part) {
  const e = eyePos(a)
  return (
    <g>
      <g fill={p.shade} {...line(p)}>
        <path d="M70 72 Q30 62 24 118 Q22 164 46 160 Q64 152 66 112 Z" />
        <path d="M130 72 Q170 62 176 118 Q178 164 154 160 Q136 152 134 112 Z" />
      </g>
      <ellipse cx={a.cx} cy={a.cy} rx={a.rx} ry={a.ry} fill={p.base} {...line(p)} />
      <ellipse cx="100" cy="120" rx="19" ry="16" fill={p.light} />
      <ellipse cx="100" cy="113" rx="7.5" ry="5.5" fill={p.nose} />
      <path d="M100 118 V124 M100 124 Q92 131 85 125 M100 124 Q108 131 115 125" stroke={p.nose} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <Tongue x={100} y={128} w={6} h={9} />
      <Eye x={e.lx} y={e.y} r={6.4} hl={2.4} />
      <Eye x={e.rx} y={e.y} r={6.4} hl={2.4} />
      {brow(p, `M${e.lx - 8} ${e.y - 11} Q${e.lx} ${e.y - 15} ${e.lx + 7} ${e.y - 11}`)}
      {expression === 'thinking' ? <Thinking p={p} x={e.rx} y={e.y} /> : brow(p, `M${e.rx - 7} ${e.y - 15} Q${e.rx + 1} ${e.y - 20} ${e.rx + 9} ${e.y - 14}`)}
    </g>
  )
}

/* ---------------------------------------------------------------- Axel: lean, athletic black Labrador with a long muzzle */
function AxelBody({ p }: Part) {
  return (
    <g {...line(p)} fill={p.base}>
      <rect x="72" y="118" width="56" height="52" stroke="none" />
      <path d="M36 204 Q40 156 72 146 L128 146 Q160 156 164 204 Z" />
    </g>
  )
}
function AxelHead({ p, a, expression }: Part) {
  const e = eyePos(a)
  return (
    <g>
      <g fill={p.shade} {...line(p)}>
        {/* Left ear hangs and folds; right ear is lifted, so the two are clearly different. */}
        <path d="M66 56 Q42 52 36 86 Q34 108 52 106 Q62 92 64 70 Z" />
        <path d="M134 50 Q166 30 168 66 Q166 94 144 88 Q134 72 134 50 Z" />
      </g>
      <ellipse cx={a.cx} cy={a.cy} rx={a.rx} ry={a.ry} fill={p.base} {...line(p)} />
      <path d="M81 106 Q82 95 100 94 Q118 95 119 106 Q121 148 100 148 Q79 148 81 106 Z" fill={p.light} />
      <ellipse cx="100" cy="141" rx="9" ry="6" fill={p.nose} />
      <path d="M100 146 V150 M100 150 Q93 155 87 151 M100 150 Q107 155 113 151" stroke={p.nose} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {expression === 'happy' && <Tongue x={100} y={153} w={5} h={7} />}
      {/* Almond, alert eyes with a bright highlight. */}
      {[e.lx, e.rx].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={e.y} rx="6.2" ry="4.4" fill="#17100d" />
          <circle cx={x + 2} cy={e.y - 1.6} r="1.9" fill="#fff" />
        </g>
      ))}
      {brow(p, `M${e.lx - 9} ${e.y - 9} L${e.lx + 8} ${e.y - 13}`)}
      {expression === 'thinking' ? <Thinking p={p} x={e.rx} y={e.y} /> : brow(p, `M${e.rx - 8} ${e.y - 13} L${e.rx + 9} ${e.y - 9}`)}
    </g>
  )
}

/* ---------------------------------------------------------------- Slobber: medium, round-faced golden Labrador, stockier */
function SlobberBody({ p }: Part) {
  return (
    <g {...line(p)} fill={p.base}>
      <rect x="62" y="118" width="76" height="52" />
      <ellipse cx="100" cy="206" rx="78" ry="58" />
    </g>
  )
}
function SlobberHead({ p, a, expression }: Part) {
  const e = eyePos(a)
  return (
    <g>
      <g fill={p.shade} {...line(p)}>
        <path d="M58 64 Q26 68 28 112 Q32 134 56 124 Q62 98 62 74 Z" />
        <path d="M142 64 Q174 68 172 112 Q168 134 144 124 Q138 98 138 74 Z" />
      </g>
      <ellipse cx={a.cx} cy={a.cy} rx={a.rx} ry={a.ry} fill={p.base} {...line(p)} />
      <ellipse cx="100" cy="114" rx="28" ry="21" fill={p.light} />
      <ellipse cx="100" cy="104" rx="9.5" ry="7" fill={p.nose} />
      {/* Wide, cheerful open smile. */}
      <path d="M100 111 V116 M100 116 Q84 134 70 118 M100 116 Q116 134 130 118" stroke={p.nose} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M86 124 Q100 142 114 124 Q100 128 86 124 Z" fill="#7a2e3a" />
      <Tongue x={100} y={130} w={7} h={7} />
      <Eye x={e.lx} y={e.y} r={5.4} hl={2.1} />
      <Eye x={e.rx} y={e.y} r={5.4} hl={2.1} />
      {brow(p, `M${e.lx - 8} ${e.y - 11} Q${e.lx} ${e.y - 15} ${e.lx + 8} ${e.y - 11}`)}
      {expression === 'thinking' ? <Thinking p={p} x={e.rx} y={e.y} /> : brow(p, `M${e.rx - 8} ${e.y - 11} Q${e.rx} ${e.y - 15} ${e.rx + 8} ${e.y - 11}`)}
    </g>
  )
}

/* ---------------------------------------------------------------- Kirby: compact cream Labrador, soft face, short muzzle */
function KirbyBody({ p }: Part) {
  return (
    <g {...line(p)} fill={p.base}>
      <rect x="71" y="124" width="58" height="48" />
      <ellipse cx="100" cy="206" rx="62" ry="50" />
    </g>
  )
}
function KirbyHead({ p, a, expression }: Part) {
  const e = eyePos(a)
  return (
    <g>
      <g fill={p.shade} {...line(p)}>
        {/* Long, soft ears set high; the right tip flips outward. */}
        <path d="M66 60 Q36 58 30 104 Q30 144 54 148 Q62 130 62 96 Z" />
        <path d="M134 60 Q164 58 170 100 Q172 124 156 134 Q146 122 152 116 Q140 112 138 96 Z" />
      </g>
      <ellipse cx={a.cx} cy={a.cy} rx={a.rx} ry={a.ry} fill={p.base} {...line(p)} />
      <ellipse cx="100" cy="117" rx="21" ry="14" fill={p.light} />
      <ellipse cx="100" cy="109" rx="8" ry="5.5" fill={p.nose} />
      <path d="M100 114 V119 M100 119 Q93 125 86 120 M100 119 Q107 125 114 120" stroke={p.nose} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {expression === 'happy' && <Tongue x={100} y={122} w={5} h={6} />}
      {/* Gentle eyes: soft lower lids and sloping brows. */}
      <Eye x={e.lx} y={e.y} r={5.2} hl={2} />
      <Eye x={e.rx} y={e.y} r={5.2} hl={2} />
      <path d={`M${e.lx - 6} ${e.y + 7} Q${e.lx} ${e.y + 10} ${e.lx + 6} ${e.y + 7}`} stroke={p.shade} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d={`M${e.rx - 6} ${e.y + 7} Q${e.rx} ${e.y + 10} ${e.rx + 6} ${e.y + 7}`} stroke={p.shade} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {brow(p, `M${e.lx - 9} ${e.y - 9} L${e.lx + 7} ${e.y - 12}`)}
      {expression === 'thinking' ? <Thinking p={p} x={e.rx} y={e.y} /> : brow(p, `M${e.rx - 7} ${e.y - 12} L${e.rx + 9} ${e.y - 9}`)}
    </g>
  )
}

export const DOGS: Record<CharacterId, { Body: (p: Part) => ReactNode; Head: (p: Part) => ReactNode }> = {
  vector: { Body: HectorBody, Head: HectorHead },
  vertex: { Body: TexBody, Head: TexHead },
  axis: { Body: AxelBody, Head: AxelHead },
  slope: { Body: SlobberBody, Head: SlobberHead },
  curve: { Body: KirbyBody, Head: KirbyHead },
}
