import { RUBRIC } from '@/data/lessons/gradient'
import type { OpenQuestion } from '@/types'

export const RUBRIC_LEVELS = [
  { v: 0, label: 'Needs support (0)' },
  { v: 1, label: 'Developing (1)' },
  { v: 2, label: 'Strong (2)' },
]

export const STRONG_RESPONSE_HEADING = 'Example of a strong response'

interface Props {
  question: OpenQuestion
  /** Teacher marking: when provided, each criterion shows working score controls. */
  scores?: Record<string, number>
  onScore?: (criterionId: string, value: number) => void
  idPrefix?: string
}

/** One rubric used by both the student preview (read-only) and the teacher marking form (interactive). */
export function RubricView({ question, scores, onScore, idPrefix = 'rubric' }: Props) {
  const criteria = RUBRIC.criteria.filter((c) => question.rubricCriteria.includes(c.id))
  return (
    <div className="space-y-4">
      <section>
        <h4 className="font-bold">{STRONG_RESPONSE_HEADING}</h4>
        <p className="mt-1">{question.strongExample}</p>
      </section>
      {criteria.map((c) => (
        <section key={c.id} aria-label={c.name}>
          <h4 className="font-bold">{c.name}</h4>
          <p>{`Strong: ${c.strong}`}</p>
          <p>{`Developing: ${c.developing}`}</p>
          <p>{`Needs support: ${c.support}`}</p>
          {onScore ? (
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={`${c.name} score`}>
              {RUBRIC_LEVELS.map((l) => (
                <label key={l.v} className={`btn cursor-pointer !py-1 text-sm ${scores?.[c.id] === l.v ? '!bg-brand !text-brand-ink' : ''}`}>
                  <input type="radio" className="sr-only" name={`${idPrefix}-${c.id}`} checked={scores?.[c.id] === l.v} onChange={() => onScore(c.id, l.v)} />
                  {l.label}
                </label>
              ))}
            </div>
          ) : (
            <ul className="mt-2 list-none space-y-0.5">
              {RUBRIC_LEVELS.map((l) => <li key={l.v}>{l.label}</li>)}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
