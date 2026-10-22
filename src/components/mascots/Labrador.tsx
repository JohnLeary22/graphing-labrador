import type { CharacterId, Equipped } from '@/types'
import { CHARACTERS } from '@/data/curriculum/labs'
import { ANCHORS, DOGS, PALETTES } from './dogs'
import { BACKGROUNDS, EYES, HATS, NECK } from './cosmetics'

export type Expression = 'happy' | 'thinking' | 'proud'

interface Props {
  character: CharacterId
  equipped?: Equipped
  expression?: Expression
  size?: number
  /** Decorative bobbing only; never required to understand content. */
  idle?: boolean
  showBackground?: boolean
  label?: string
}

function Motif({ kind, color }: { kind: string; color: string }) {
  const p = { stroke: color, strokeWidth: 2.2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (kind) {
    case 'arrow':
      return <path {...p} d="M-6 5 L6 -5 M0 -6 L6 -5 L5 1" />
    case 'parabola':
      return <path {...p} d="M-7 -6 Q0 14 7 -6" />
    case 'axes':
      return <path {...p} d="M-6 -6 V6 H6 M-6 6 L4 -4" />
    case 'slope':
      return <path {...p} d="M-7 6 L7 -6 M-7 6 H7 V-1" />
    default:
      return <path {...p} d="M-8 0 Q-4 -9 0 0 T8 0" />
  }
}

export function Labrador({ character, equipped = {}, expression = 'happy', size = 160, idle = false, showBackground = true, label }: Props) {
  const c = CHARACTERS[character]
  const anchor = ANCHORS[character]
  const dog = DOGS[character]
  const part = { p: PALETTES[character], a: anchor, expression }
  // Hats and glasses are drawn for a reference head; this maps them onto this dog's head.
  const sx = anchor.rx / 47
  const sy = anchor.ry / 45
  const headT = `translate(${anchor.cx} ${anchor.cy}) scale(${sx} ${sy}) translate(-100 -92)`
  const neckT = `translate(100 ${anchor.neckDy}) scale(${anchor.neckScale} 1) translate(-100 0)`
  const name = label ?? `${c.nickname} the Labrador (${c.name})`
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={name} className={idle ? 'mascot-idle' : undefined}>
      <defs>
        <clipPath id={`clip-${character}`}>
          <rect width="200" height="200" rx="28" />
        </clipPath>
      </defs>
      <g clipPath={`url(#clip-${character})`}>
        {showBackground ? (BACKGROUNDS[equipped.background ?? ''] ?? BACKGROUNDS.default) : null}
        {dog.Body(part)}
        <g transform={neckT}>
          <path d="M66 146 Q100 168 134 146 L134 156 Q100 178 66 156 Z" fill={c.accent} />
        </g>
        <g transform={`translate(100 ${anchor.badgeY})`}>
          <circle r={anchor.badgeR} fill="#0b1b3a" stroke={c.accent} strokeWidth="2" />
          <g transform={`scale(${anchor.badgeR / 13})`}><Motif kind={c.motif} color={c.accent} /></g>
        </g>
        <g transform={neckT}>{NECK[equipped.neckwear ?? '']}</g>
        {dog.Head(part)}
        <g transform={headT}>
          {EYES[equipped.eyewear ?? '']}
          {HATS[equipped.hat ?? '']}
        </g>
      </g>
    </svg>
  )
}
