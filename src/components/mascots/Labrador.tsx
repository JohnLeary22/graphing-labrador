import type { CharacterId, Equipped } from '@/types'
import { CHARACTERS } from '@/data/curriculum/labs'

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

const COATS: Record<string, { base: string; shade: string; light: string }> = {
  yellow: { base: '#e2b45f', shade: '#c4902f', light: '#f1d08e' },
  'col-chocolate': { base: '#6e4630', shade: '#4f301f', light: '#8a5a40' },
  'col-black': { base: '#33333a', shade: '#1a1a1f', light: '#4a4a54' },
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

function Background({ id }: { id?: string }) {
  switch (id) {
    case 'bg-grid':
      return (
        <g>
          <rect width="200" height="200" fill="#0b1b3a" />
          <path d="M0 40H200M0 80H200M0 120H200M0 160H200M40 0V200M80 0V200M120 0V200M160 0V200" stroke="#2dd4bf" strokeOpacity="0.35" strokeWidth="1" />
        </g>
      )
    case 'bg-sunset':
      return (
        <g>
          <rect width="100" height="100" fill="#f59e0b" />
          <rect x="100" width="100" height="100" fill="#ef4444" />
          <rect y="100" width="100" height="100" fill="#7c3aed" />
          <rect x="100" y="100" width="100" height="100" fill="#0ea5e9" />
          <rect width="200" height="200" fill="#000" opacity="0.2" />
        </g>
      )
    case 'bg-night':
      return (
        <g>
          <rect width="200" height="200" fill="#050b1f" />
          <path d="M0 50H200M0 100H200M0 150H200M50 0V200M100 0V200M150 0V200" stroke="#60a5fa" strokeOpacity="0.5" strokeWidth="1.5" />
          <circle cx="160" cy="36" r="10" fill="#fde68a" opacity="0.9" />
        </g>
      )
    default:
      return <rect width="200" height="200" fill="#14305f" />
  }
}

export function Labrador({ character, equipped = {}, expression = 'happy', size = 160, idle = false, showBackground = true, label }: Props) {
  const c = CHARACTERS[character]
  const coat = COATS[equipped.colour ?? 'yellow'] ?? COATS.yellow
  const name = label ?? `${c.nickname} the Labrador (${c.name})`
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={name} className={idle ? 'mascot-idle' : undefined}>
      <defs>
        <clipPath id={`clip-${character}`}>
          <rect width="200" height="200" rx="28" />
        </clipPath>
      </defs>
      <g clipPath={`url(#clip-${character})`}>
        {showBackground ? <Background id={equipped.background} /> : null}
        {/* shoulders */}
        <ellipse cx="100" cy="196" rx="66" ry="50" fill={coat.base} />
        {/* collar */}
        <path d="M66 146 Q100 168 134 146 L134 156 Q100 178 66 156 Z" fill={c.accent} />
        {/* badge */}
        <g transform="translate(100 176)">
          <circle r="13" fill="#0b1b3a" stroke={c.accent} strokeWidth="2" />
          <Motif kind={c.motif} color={c.accent} />
        </g>
        {/* neckwear */}
        {equipped.neckwear === 'neck-bandana' && (
          <g>
            <polygon points="68,142 132,142 100,182" fill="#0e7490" />
            <path d="M84 150H116M90 160H110M96 170H104M88 144V156M100 144V176M112 144V156" stroke="#99f6e4" strokeWidth="1" opacity="0.7" />
          </g>
        )}
        {equipped.neckwear === 'neck-bowtie' && (
          <g fill="#dc2626">
            <polygon points="100,152 76,140 76,164" />
            <polygon points="100,152 124,140 124,164" />
            <circle cx="100" cy="152" r="6" fill="#991b1b" />
          </g>
        )}
        {equipped.neckwear === 'neck-scarf' && (
          <g>
            <rect x="62" y="140" width="76" height="16" rx="8" fill="#14b8a6" />
            <rect x="112" y="150" width="14" height="34" rx="5" fill="#0f766e" />
          </g>
        )}
        {/* ears */}
        <ellipse cx="55" cy="96" rx="17" ry="34" transform="rotate(14 55 96)" fill={coat.shade} />
        <ellipse cx="145" cy="96" rx="17" ry="34" transform="rotate(-14 145 96)" fill={coat.shade} />
        {/* head */}
        <ellipse cx="100" cy="92" rx="47" ry="45" fill={coat.base} />
        {/* snout */}
        <ellipse cx="100" cy="112" rx="27" ry="21" fill={coat.light} />
        <ellipse cx="100" cy="102" rx="9" ry="6.5" fill="#15151a" />
        <path d="M100 108 V116 M100 116 Q92 124 84 117 M100 116 Q108 124 116 117" stroke="#15151a" strokeWidth="2" fill="none" strokeLinecap="round" />
        {(expression === 'happy' || expression === 'proud') && <path d="M95 122 Q100 138 105 122 Z" fill="#f472b6" />}
        {/* eyes */}
        <g fill="#15151a">
          <circle cx="82" cy="84" r="5.5" />
          <circle cx="118" cy="84" r="5.5" />
        </g>
        <g fill="#fff">
          <circle cx="84" cy="82" r="1.8" />
          <circle cx="120" cy="82" r="1.8" />
        </g>
        {expression === 'thinking' && <path d="M72 70 Q82 64 92 70 M108 66 Q118 62 128 68" stroke={coat.shade} strokeWidth="3" fill="none" strokeLinecap="round" />}
        {expression === 'proud' && <path d="M72 72 Q82 67 92 72 M108 72 Q118 67 128 72" stroke={coat.shade} strokeWidth="3" fill="none" strokeLinecap="round" />}
        {/* eyewear */}
        {equipped.eyewear === 'eye-glasses' && (
          <g stroke="#111827" strokeWidth="2.5" fill="rgb(255 255 255 / 0.15)">
            <circle cx="82" cy="84" r="12" />
            <circle cx="118" cy="84" r="12" />
            <path d="M94 84H106" fill="none" />
          </g>
        )}
        {equipped.eyewear === 'eye-shades' && (
          <g fill="#0f172a">
            <rect x="66" y="74" width="30" height="19" rx="8" />
            <rect x="104" y="74" width="30" height="19" rx="8" />
            <path d="M96 80H104" stroke="#0f172a" strokeWidth="3" />
            <path d="M70 78 L80 78" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" />
          </g>
        )}
        {/* headwear */}
        {equipped.hat === 'hat-beanie' && (
          <g>
            <path d="M56 66 Q100 6 144 66 Z" fill="#1e3a8a" />
            <rect x="52" y="62" width="96" height="14" rx="7" fill="#1d4ed8" />
            <circle cx="100" cy="22" r="7" fill="#93c5fd" />
          </g>
        )}
        {equipped.hat === 'hat-cap' && (
          <g>
            <path d="M56 66 Q100 14 144 66 Z" fill="#0e7490" />
            <path d="M92 64 Q150 58 168 70 Q130 76 92 72 Z" fill="#f59e0b" />
          </g>
        )}
        {equipped.hat === 'hat-headphones' && (
          <g>
            <path d="M54 92 Q54 28 100 28 Q146 28 146 92" stroke="#111827" strokeWidth="7" fill="none" strokeLinecap="round" />
            <rect x="42" y="78" width="18" height="32" rx="8" fill="#2dd4bf" />
            <rect x="140" y="78" width="18" height="32" rx="8" fill="#2dd4bf" />
          </g>
        )}
        {equipped.hat === 'hat-crown' && (
          <g>
            <polygon points="66,56 72,24 88,44 100,18 112,44 128,24 134,56" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
            <circle cx="100" cy="46" r="4" fill="#ef4444" />
          </g>
        )}
      </g>
    </svg>
  )
}
