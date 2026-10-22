import type { Point } from '@/types'

/** Small static line drawing used in matching questions. Decorative: the item label carries the meaning for assistive technology. */
export function MiniLine({ from, to }: { from: Point; to: Point }) {
  const X = (x: number) => 50 + x * 12
  const Y = (y: number) => 50 - y * 12
  return (
    <svg viewBox="0 0 100 100" width="84" height="84" aria-hidden="true" className="shrink-0 rounded-lg border border-line" style={{ background: 'var(--graph-bg)' }}>
      <path d="M50 6V94M6 50H94" stroke="var(--grid)" strokeWidth="1.5" />
      <line x1={X(from.x)} y1={Y(from.y)} x2={X(to.x)} y2={Y(to.y)} stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
