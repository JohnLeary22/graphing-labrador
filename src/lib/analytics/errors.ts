import type { AttemptRecord } from '@/types'
import { MISCONCEPTIONS, TAG_TO_MISCONCEPTION } from '@/data/curriculum/skills'

/** Graphing misconceptions shown on the teacher dashboard. Categories with no recorded errors show a true zero. */
export const DASHBOARD_ERROR_CATEGORIES = [
  'rise-run-reversed', 'negative-sign-ignored', 'xy-reversal', 'scale-misread', 'intercept-gradient', 'height-vs-rate', 'units-missing', 'unequal-scales',
] as const

/** Counts tagged wrong attempts per category, from real attempt data. */
export function errorCategoryCounts(attempts: AttemptRecord[]): { id: string; name: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const a of attempts) {
    const id = a.errorTag ? TAG_TO_MISCONCEPTION[a.errorTag] : undefined
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  return DASHBOARD_ERROR_CATEGORIES.map((id) => ({ id, name: MISCONCEPTIONS.find((m) => m.id === id)?.name ?? id, count: counts.get(id) ?? 0 }))
}
