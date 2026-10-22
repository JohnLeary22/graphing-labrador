import type { ReactNode } from 'react'

/**
 * Artwork for every shop cosmetic, keyed by item id. Hats, glasses and neckwear are drawn for a reference
 * Labrador head (centre 100,92; eyes at 82,84 and 118,84) and mapped onto each dog by Labrador.tsx.
 * Legendary items animate with CSS classes from index.css, which switch off when reduced motion is requested.
 */
const star = (cx: number, cy: number, r: number, fill: string, cls?: string, delay = 0) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? r : r * 0.45
    return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`
  }).join(' ')
  return <polygon key={`${cx}-${cy}`} points={pts} fill={fill} className={cls} style={delay ? { animationDelay: `${delay}s` } : undefined} />
}

const heart = (x: number, y: number, s: number, fill: string) => (
  <path key={x} transform={`translate(${x} ${y}) scale(${s})`} d="M0 6 C-14 -4 -8 -14 0 -6 C8 -14 14 -4 0 6Z" fill={fill} stroke="#111827" strokeWidth="1.2" />
)

/* ------------------------------------------------------------------ headwear */
export const HATS: Record<string, ReactNode> = {
  'hat-beanie': (
    <g>
      <path d="M56 66 Q100 6 144 66 Z" fill="#1e3a8a" />
      <rect x="52" y="62" width="96" height="14" rx="7" fill="#1d4ed8" />
      <circle cx="100" cy="22" r="7" fill="#93c5fd" />
    </g>
  ),
  'hat-bucket': (
    <g>
      <ellipse cx="100" cy="64" rx="58" ry="11" fill="#a3b18a" />
      <path d="M66 64 Q68 30 100 28 Q132 30 134 64Z" fill="#a3b18a" />
      <rect x="66" y="54" width="68" height="7" fill="#6b7f5a" />
    </g>
  ),
  'hat-headband': (
    <g>
      <path d="M54 72 Q100 56 146 72 L146 82 Q100 66 54 82Z" fill="#ef4444" />
      <circle cx="146" cy="78" r="5" fill="#b91c1c" />
    </g>
  ),
  'hat-party': (
    <g>
      <polygon points="100,8 76,64 124,64" fill="#a855f7" />
      <path d="M89 38 L111 38 M83 52 L117 52" stroke="#fde047" strokeWidth="4" />
      <circle cx="100" cy="8" r="6" fill="#fde047" />
    </g>
  ),
  'hat-flat': (
    <g>
      <path d="M56 68 Q60 40 100 38 Q140 40 144 68 Q100 60 56 68Z" fill="#6b7280" />
      <path d="M110 64 Q150 62 160 72 Q130 74 110 70Z" fill="#4b5563" />
    </g>
  ),
  'hat-cap': (
    <g>
      <path d="M56 66 Q100 14 144 66 Z" fill="#0e7490" />
      <path d="M92 64 Q150 58 168 70 Q130 76 92 72 Z" fill="#f59e0b" />
    </g>
  ),
  'hat-beret': (
    <g transform="rotate(-8 100 52)">
      <ellipse cx="98" cy="52" rx="46" ry="17" fill="#be123c" />
      <rect x="96" y="32" width="5" height="9" rx="2" fill="#9f1239" />
    </g>
  ),
  'hat-chef': (
    <g>
      <rect x="62" y="52" width="76" height="16" fill="#f8fafc" stroke="#cbd5e1" />
      <path d="M60 54 Q50 26 76 28 Q84 6 106 18 Q132 8 138 32 Q152 40 140 54Z" fill="#f8fafc" stroke="#cbd5e1" />
    </g>
  ),
  'hat-cowboy': (
    <g>
      <path d="M26 66 Q60 80 100 72 Q140 80 174 66 Q150 60 138 58 Q134 28 100 28 Q66 28 62 58 Q50 60 26 66Z" fill="#92400e" />
      <path d="M64 58 Q100 68 136 58" stroke="#451a03" strokeWidth="5" fill="none" />
    </g>
  ),
  'hat-headphones': (
    <g>
      <path d="M54 92 Q54 28 100 28 Q146 28 146 92" stroke="#111827" strokeWidth="7" fill="none" strokeLinecap="round" />
      <rect x="42" y="78" width="18" height="32" rx="8" fill="#2dd4bf" />
      <rect x="140" y="78" width="18" height="32" rx="8" fill="#2dd4bf" />
    </g>
  ),
  'hat-wizard': (
    <g>
      <path d="M36 66 Q100 82 164 66 Q132 62 122 56 L108 4 Q100 -2 94 6 L80 56 Q68 62 36 66Z" fill="#4c1d95" />
      <path d="M82 54 Q100 60 120 54" stroke="#fde047" strokeWidth="4" fill="none" />
      {star(98, 30, 7, '#fde047')}
      {star(106, 46, 4, '#fde047')}
    </g>
  ),
  'hat-pirate': (
    <g>
      <path d="M40 66 Q46 34 100 28 Q154 34 160 66 Q100 54 40 66Z" fill="#111827" />
      <circle cx="100" cy="46" r="7" fill="#f8fafc" />
      <path d="M90 56 L110 64 M110 56 L90 64" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  'hat-crown': (
    <g>
      <polygon points="66,56 72,24 88,44 100,18 112,44 128,24 134,56" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
      <circle cx="100" cy="46" r="4" fill="#ef4444" />
    </g>
  ),
  'hat-viking': (
    <g>
      <path d="M54 72 Q56 34 100 32 Q144 34 146 72Z" fill="#9ca3af" />
      <rect x="54" y="62" width="92" height="9" fill="#6b7280" />
      <path d="M54 62 Q34 52 36 26 Q50 38 62 52Z" fill="#f8fafc" stroke="#cbd5e1" />
      <path d="M146 62 Q166 52 164 26 Q150 38 138 52Z" fill="#f8fafc" stroke="#cbd5e1" />
    </g>
  ),
  'hat-halo': (
    <g className="leg-float">
      <ellipse cx="100" cy="30" rx="36" ry="10" fill="none" stroke="#fde047" strokeWidth="7" className="leg-glow" />
      {star(60, 22, 5, '#fff7c2', 'leg-twinkle')}
      {star(142, 18, 4, '#fff7c2', 'leg-twinkle', 0.8)}
    </g>
  ),
}

/* ------------------------------------------------------------------ neckwear (collar region, y 140 to 185) */
const beads = (xs: number[], y: (x: number) => number, r: number, fills: string[]) =>
  xs.map((x, i) => <circle key={x} cx={x} cy={y(x)} r={r} fill={fills[i % fills.length]} stroke="#00000033" strokeWidth="1" />)
const curve = (x: number) => 148 + ((x - 100) * (x - 100)) / 90
const arc = [70, 80, 90, 100, 110, 120, 130]

export const NECK: Record<string, ReactNode> = {
  'neck-bandana': (
    <g>
      <polygon points="68,142 132,142 100,182" fill="#0e7490" />
      <path d="M84 150H116M90 160H110M96 170H104M88 144V156M100 144V176M112 144V156" stroke="#99f6e4" strokeWidth="1" opacity="0.7" />
    </g>
  ),
  'neck-bowtie': (
    <g fill="#dc2626">
      <polygon points="100,152 76,140 76,164" />
      <polygon points="100,152 124,140 124,164" />
      <circle cx="100" cy="152" r="6" fill="#991b1b" />
    </g>
  ),
  'neck-ribbon': (
    <g fill="#f472b6">
      <polygon points="100,154 82,144 82,164" />
      <polygon points="100,154 118,144 118,164" />
      <circle cx="100" cy="154" r="5" fill="#be185d" />
    </g>
  ),
  'neck-bell': (
    <g>
      <path d="M68 148 Q100 168 132 148" stroke="#dc2626" strokeWidth="6" fill="none" />
      <circle cx="100" cy="170" r="8" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
      <path d="M92 172 H108" stroke="#b45309" strokeWidth="1.5" />
    </g>
  ),
  'neck-necktie': (
    <g>
      <rect x="90" y="144" width="20" height="9" rx="2" fill="#1e3a8a" />
      <polygon points="95,153 105,153 110,178 100,188 90,178" fill="#1d4ed8" />
    </g>
  ),
  'neck-scarf': (
    <g>
      <rect x="62" y="140" width="76" height="16" rx="8" fill="#14b8a6" />
      <rect x="112" y="150" width="14" height="34" rx="5" fill="#0f766e" />
    </g>
  ),
  'neck-flowers': (
    <g>
      <path d="M68 148 Q100 164 132 148" stroke="#16a34a" strokeWidth="4" fill="none" />
      {beads([76, 88, 100, 112, 124], (x) => 150 + ((x - 100) * (x - 100)) / 120, 6, ['#f472b6', '#fde047', '#fb923c'])}
    </g>
  ),
  'neck-stripes': (
    <g>
      <rect x="62" y="140" width="76" height="16" rx="8" fill="#f8fafc" />
      <path d="M74 140V156M88 140V156M102 140V156M116 140V156M128 142V154" stroke="#dc2626" strokeWidth="5" />
      <rect x="112" y="150" width="14" height="30" rx="4" fill="#dc2626" />
    </g>
  ),
  'neck-medal': (
    <g>
      <path d="M86 142 L100 172 L114 142Z" fill="#2563eb" />
      <circle cx="100" cy="176" r="10" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
      {star(100, 176, 6, '#b45309')}
    </g>
  ),
  'neck-cape': (
    <g>
      <path d="M62 146 Q38 190 26 214 L174 214 Q162 190 138 146 Q100 162 62 146Z" fill="#b91c1c" />
      <circle cx="100" cy="158" r="6" fill="#fbbf24" />
    </g>
  ),
  'neck-lei': <g>{beads(arc, curve, 7, ['#f472b6', '#fb923c', '#fde047', '#4ade80'])}</g>,
  'neck-pearls': <g>{beads(arc, curve, 6, ['#f8fafc', '#e2e8f0'])}</g>,
  'neck-gold': (
    <g>
      {beads(arc, curve, 5, ['#fbbf24', '#f59e0b'])}
      <circle cx="100" cy="172" r="9" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
      <text x="100" y="176" textAnchor="middle" fontSize="11" fontWeight="700" fill="#78350f">m</text>
    </g>
  ),
  'neck-gem': (
    <g>
      <path d="M68 148 Q100 168 132 148" stroke="#cbd5e1" strokeWidth="3" fill="none" />
      <polygon points="100,166 112,176 100,192 88,176" fill="#a855f7" stroke="#6b21a8" strokeWidth="2" />
      <polygon points="100,166 106,176 100,192 94,176" fill="#d8b4fe" opacity="0.7" />
    </g>
  ),
  'neck-stars': (
    <g>
      <path d="M68 148 Q100 168 132 148" stroke="#fde047" strokeWidth="3" fill="none" className="leg-glow" />
      {[72, 86, 100, 114, 128].map((x, i) => star(x, curve(x) + 8, 8 - (i % 2) * 2, '#fde047', 'leg-twinkle', i * 0.35))}
    </g>
  ),
}

/* ------------------------------------------------------------------ eyewear (eyes at 82,84 and 118,84) */
const lensStroke = { stroke: '#111827', strokeWidth: 2.5 }

export const EYES: Record<string, ReactNode> = {
  'eye-glasses': (
    <g {...lensStroke} fill="rgb(255 255 255 / 0.15)">
      <circle cx="82" cy="84" r="12" />
      <circle cx="118" cy="84" r="12" />
      <path d="M94 84H106" fill="none" />
    </g>
  ),
  'eye-square': (
    <g {...lensStroke} fill="rgb(255 255 255 / 0.15)">
      <rect x="68" y="73" width="28" height="22" rx="3" />
      <rect x="104" y="73" width="28" height="22" rx="3" />
      <path d="M96 82H104" fill="none" />
    </g>
  ),
  'eye-sport': (
    <g>
      <rect x="64" y="74" width="72" height="20" rx="10" fill="#0ea5e9" fillOpacity="0.75" stroke="#0c4a6e" strokeWidth="2.5" />
      <path d="M72 80 L90 80" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" />
    </g>
  ),
  'eye-heart': <g>{heart(82, 82, 1.3, '#f43f5e')}{heart(118, 82, 1.3, '#f43f5e')}</g>,
  'eye-patch': (
    <g>
      <path d="M58 70 L108 80 M128 78 L148 70" stroke="#111827" strokeWidth="2.5" />
      <ellipse cx="118" cy="84" rx="13" ry="11" fill="#111827" />
    </g>
  ),
  'eye-aviator': (
    <g stroke="#b45309" strokeWidth="2.5" fill="#475569" fillOpacity="0.7">
      <path d="M66 76 Q82 70 98 78 Q96 100 80 100 Q64 98 66 76Z" />
      <path d="M134 76 Q118 70 102 78 Q104 100 120 100 Q136 98 134 76Z" />
      <path d="M98 78 Q100 75 102 78" fill="none" />
    </g>
  ),
  'eye-3d': (
    <g stroke="#111827" strokeWidth="2.5">
      <rect x="68" y="73" width="28" height="22" rx="3" fill="#ef4444" fillOpacity="0.7" />
      <rect x="104" y="73" width="28" height="22" rx="3" fill="#22d3ee" fillOpacity="0.7" />
      <path d="M96 82H104" fill="none" />
    </g>
  ),
  'eye-monocle': (
    <g>
      <circle cx="82" cy="84" r="14" fill="rgb(255 255 255 / 0.15)" stroke="#b45309" strokeWidth="3" />
      <path d="M94 94 Q110 130 96 168" stroke="#b45309" strokeWidth="1.8" fill="none" />
    </g>
  ),
  'eye-goggles': (
    <g>
      <path d="M52 84 H148" stroke="#374151" strokeWidth="6" />
      <circle cx="82" cy="84" r="14" fill="#fde047" fillOpacity="0.55" stroke="#374151" strokeWidth="4" />
      <circle cx="118" cy="84" r="14" fill="#fde047" fillOpacity="0.55" stroke="#374151" strokeWidth="4" />
    </g>
  ),
  'eye-shades': (
    <g fill="#0f172a">
      <rect x="66" y="74" width="30" height="19" rx="8" />
      <rect x="104" y="74" width="30" height="19" rx="8" />
      <path d="M96 80H104" stroke="#0f172a" strokeWidth="3" />
      <path d="M70 78 L80 78" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" />
    </g>
  ),
  'eye-neon': (
    <g fill="none" strokeWidth="3.5" style={{ filter: 'drop-shadow(0 0 3px currentColor)' }}>
      <rect x="67" y="73" width="29" height="22" rx="7" stroke="#22d3ee" />
      <rect x="104" y="73" width="29" height="22" rx="7" stroke="#f472b6" />
      <path d="M96 82H104" stroke="#a78bfa" />
    </g>
  ),
  'eye-steampunk': (
    <g>
      <circle cx="82" cy="84" r="14" fill="#b4530922" stroke="#b45309" strokeWidth="4" />
      <circle cx="118" cy="84" r="14" fill="#b4530922" stroke="#b45309" strokeWidth="4" />
      <circle cx="82" cy="84" r="8" fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="118" cy="84" r="8" fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M96 84H104M54 84H68M132 84H146" stroke="#b45309" strokeWidth="3" />
    </g>
  ),
  'eye-visor': (
    <g>
      <rect x="58" y="72" width="84" height="24" rx="12" fill="#1e3a8a" />
      <rect x="62" y="76" width="76" height="16" rx="8" fill="#38bdf8" fillOpacity="0.8" />
      <path d="M70 80 H96" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" />
    </g>
  ),
  'eye-gold': (
    <g>
      <circle cx="82" cy="84" r="13" fill="rgb(255 255 255 / 0.15)" stroke="#fbbf24" strokeWidth="4" />
      <circle cx="118" cy="84" r="13" fill="rgb(255 255 255 / 0.15)" stroke="#fbbf24" strokeWidth="4" />
      <path d="M95 84H105" stroke="#fbbf24" strokeWidth="4" />
      <polygon points="82,66 86,70 82,74 78,70" fill="#a5f3fc" />
      <polygon points="118,66 122,70 118,74 114,70" fill="#a5f3fc" />
    </g>
  ),
  'eye-galaxy': (
    <g>
      <defs>
        <radialGradient id="gx-galaxy" cx="40%" cy="35%" r="80%">
          <stop offset="0" stopColor="#c084fc" />
          <stop offset="0.5" stopColor="#4c1d95" />
          <stop offset="1" stopColor="#0f172a" />
        </radialGradient>
      </defs>
      <rect x="64" y="72" width="34" height="24" rx="8" fill="url(#gx-galaxy)" stroke="#e9d5ff" strokeWidth="2" />
      <rect x="102" y="72" width="34" height="24" rx="8" fill="url(#gx-galaxy)" stroke="#e9d5ff" strokeWidth="2" />
      <path d="M98 82H102" stroke="#e9d5ff" strokeWidth="3" />
      {star(76, 80, 4, '#fff', 'leg-twinkle')}
      {star(124, 88, 3.5, '#fff', 'leg-twinkle', 0.6)}
      {star(88, 90, 3, '#fde68a', 'leg-twinkle', 1.1)}
      {star(114, 79, 3, '#fde68a', 'leg-twinkle', 1.6)}
    </g>
  ),
}

/* ------------------------------------------------------------------ backgrounds (200 by 200) */
const FULL = { width: 200, height: 200 }
const twinkles = (pts: [number, number, number][]) => pts.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" className="leg-twinkle" style={{ animationDelay: `${(i % 6) * 0.45}s` }} />)

export const BACKGROUNDS: Record<string, ReactNode> = {
  default: <rect {...FULL} fill="#14305f" />,
  'bg-grid': (
    <g>
      <rect {...FULL} fill="#0b1b3a" />
      <path d="M0 40H200M0 80H200M0 120H200M0 160H200M40 0V200M80 0V200M120 0V200M160 0V200" stroke="#2dd4bf" strokeOpacity="0.35" strokeWidth="1" />
    </g>
  ),
  'bg-sky': (
    <g>
      <rect {...FULL} fill="#7dd3fc" />
      <g fill="#fff"><ellipse cx="50" cy="50" rx="26" ry="10" /><ellipse cx="68" cy="44" rx="16" ry="9" /><ellipse cx="150" cy="80" rx="24" ry="9" /><ellipse cx="166" cy="74" rx="14" ry="8" /></g>
    </g>
  ),
  'bg-mint': (
    <g>
      <rect {...FULL} fill="#a7f3d0" />
      <path d="M0 150 Q50 120 100 150 T200 150 V200 H0Z" fill="#6ee7b7" />
    </g>
  ),
  'bg-sand': (
    <g>
      <rect {...FULL} fill="#fde68a" />
      <path d="M0 140 Q60 110 120 140 T200 130 V200 H0Z" fill="#fcd34d" />
      <circle cx="160" cy="40" r="18" fill="#fb923c" />
    </g>
  ),
  'bg-dots': (
    <g>
      <rect {...FULL} fill="#1e3a8a" />
      {Array.from({ length: 25 }, (_, i) => <circle key={i} cx={20 + (i % 5) * 40} cy={20 + Math.floor(i / 5) * 40} r="5" fill="#60a5fa" fillOpacity="0.6" />)}
    </g>
  ),
  'bg-sunset': (
    <g>
      <rect width="100" height="100" fill="#f59e0b" />
      <rect x="100" width="100" height="100" fill="#ef4444" />
      <rect y="100" width="100" height="100" fill="#7c3aed" />
      <rect x="100" y="100" width="100" height="100" fill="#0ea5e9" />
      <rect {...FULL} fill="#000" opacity="0.2" />
    </g>
  ),
  'bg-forest': (
    <g>
      <rect {...FULL} fill="#bbf7d0" />
      <path d="M0 130 Q50 90 100 130 T200 120 V200 H0Z" fill="#4ade80" />
      <g fill="#166534"><polygon points="30,150 46,110 62,150" /><polygon points="130,160 150,100 170,160" /><polygon points="90,170 104,130 118,170" /></g>
    </g>
  ),
  'bg-ocean': (
    <g>
      <rect {...FULL} fill="#38bdf8" />
      <path d="M0 110 Q25 95 50 110 T100 110 T150 110 T200 110 V200 H0Z" fill="#0284c7" />
      <path d="M0 150 Q25 135 50 150 T100 150 T150 150 T200 150 V200 H0Z" fill="#0369a1" />
    </g>
  ),
  'bg-blueprint': (
    <g>
      <rect {...FULL} fill="#1d4ed8" />
      <path d="M0 25H200M0 50H200M0 75H200M0 100H200M0 125H200M0 150H200M0 175H200M25 0V200M50 0V200M75 0V200M100 0V200M125 0V200M150 0V200M175 0V200" stroke="#fff" strokeOpacity="0.25" strokeWidth="1" />
    </g>
  ),
  'bg-night': (
    <g>
      <rect {...FULL} fill="#050b1f" />
      <path d="M0 50H200M0 100H200M0 150H200M50 0V200M100 0V200M150 0V200" stroke="#60a5fa" strokeOpacity="0.5" strokeWidth="1.5" />
      <circle cx="160" cy="36" r="10" fill="#fde68a" opacity="0.9" />
    </g>
  ),
  'bg-aurora': (
    <g>
      <rect {...FULL} fill="#0b1026" />
      <path d="M0 70 Q60 20 120 70 T200 50 V90 Q140 110 100 90 T0 110Z" fill="#34d399" fillOpacity="0.55" />
      <path d="M0 110 Q60 70 120 110 T200 90 V120 Q140 140 100 125 T0 140Z" fill="#a78bfa" fillOpacity="0.5" />
    </g>
  ),
  'bg-city': (
    <g>
      <rect {...FULL} fill="#1e1b4b" />
      <g fill="#312e81"><rect x="10" y="90" width="34" height="110" /><rect x="50" y="60" width="30" height="140" /><rect x="86" y="100" width="36" height="100" /><rect x="128" y="70" width="28" height="130" /><rect x="160" y="110" width="34" height="90" /></g>
      <g fill="#fde047">{[[18, 100], [30, 120], [58, 74], [58, 100], [96, 112], [108, 140], [136, 84], [136, 110], [170, 124]].map(([x, y]) => <rect key={`${x}${y}`} x={x} y={y} width="6" height="8" />)}</g>
    </g>
  ),
  'bg-space': (
    <g>
      <rect {...FULL} fill="#020617" />
      {[[20, 30, 1.5], [60, 80, 1], [120, 24, 1.5], [170, 60, 1], [40, 140, 1.2], [150, 130, 1.5], [90, 170, 1]].map(([x, y, r]) => <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#fff" />)}
      <circle cx="150" cy="150" r="30" fill="#f97316" />
      <ellipse cx="150" cy="150" rx="46" ry="9" fill="none" stroke="#fde68a" strokeWidth="3" />
    </g>
  ),
  'bg-volcano': (
    <g>
      <defs>
        <linearGradient id="gx-volcano" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7c2d12" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      <rect {...FULL} fill="url(#gx-volcano)" />
      <polygon points="30,200 100,80 170,200" fill="#292524" />
      <polygon points="88,96 100,80 112,96 100,110" fill="#f97316" />
      <circle cx="100" cy="70" r="6" fill="#fde047" />
    </g>
  ),
  'bg-cosmos': (
    <g>
      <defs>
        <radialGradient id="gx-cosmos" cx="50%" cy="50%" r="70%">
          <stop offset="0" stopColor="#4c1d95" />
          <stop offset="0.6" stopColor="#1e1b4b" />
          <stop offset="1" stopColor="#020617" />
        </radialGradient>
      </defs>
      <rect {...FULL} fill="url(#gx-cosmos)" />
      <g className="leg-spin" style={{ transformOrigin: '100px 100px' }}>
        <ellipse cx="100" cy="100" rx="86" ry="26" fill="none" stroke="#c084fc" strokeOpacity="0.6" strokeWidth="3" />
        <ellipse cx="100" cy="100" rx="60" ry="18" fill="none" stroke="#38bdf8" strokeOpacity="0.5" strokeWidth="2" />
        <circle cx="186" cy="100" r="5" fill="#fde047" />
      </g>
      {twinkles([[20, 24, 2], [60, 150, 1.6], [150, 30, 2], [176, 160, 1.8], [30, 100, 1.4], [120, 176, 1.6], [90, 20, 1.4], [170, 90, 1.4], [14, 170, 1.8], [110, 60, 1.2], [140, 120, 1.4], [50, 50, 1.4]])}
    </g>
  ),
}
