interface Row {
  label: string
  /** Text shown at the end of the bar, e.g. "86%" or "0". */
  display: string
  /** 0 to 100 */
  percent: number
}

/** Horizontal bar list where long labels wrap naturally instead of being clipped. */
export function BarList({ rows, color = 'var(--brand)', summary }: { rows: Row[]; color?: string; summary: string }) {
  return (
    <ul className="space-y-3" aria-label={summary}>
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-start justify-between gap-3 text-sm">
            <span className="min-w-0 break-words">{r.label}</span>
            <span className="shrink-0 font-bold tabular-nums">{r.display}</span>
          </div>
          <div className="mt-1 h-3 overflow-hidden rounded-full border border-line bg-surface-2" aria-hidden="true">
            <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, r.percent))}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
