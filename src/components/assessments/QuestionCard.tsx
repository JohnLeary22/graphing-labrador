import { useEffect, useState } from 'react'
import { CheckCircle2, Lightbulb, XCircle, Hourglass } from 'lucide-react'
import type { AttemptRecord, Point, Question } from '@/types'
import { CartesianGraph } from '@/components/graphs/CartesianGraph'
import { MiniLine } from '@/components/graphs/MiniLine'
import { getState } from '@/services/persistence/store'
import { submitAttempt } from '@/services/persistence/actions'
import type { SubmitOutcome } from '@/services/persistence/actions'
import { MathText } from '@/components/ui/MathText'
import { RubricView } from '@/components/assessments/RubricView'
import { CORRECT_MESSAGE } from '@/lib/scoring/messages'
import { parsePoint } from '@/lib/scoring/evaluate'
import { formatNumber } from '@/lib/math/graph'

interface Props {
  question: Question
  lessonId: string
  studentId: string
  /** Replaying for revision: start blank instead of restoring earlier answers. */
  fresh?: boolean
  onAnswered?: (correct: boolean) => void
  onResolved: (outcome: 'correct' | 'pending' | 'skipped') => void
}

const STAGE_LABEL: Record<string, string> = {
  HOOK: 'Warm-up', WE_DO: 'We do', YOU_DO: 'You do', NON_EXAMPLE: 'Spot the mistake', APPLICATION: 'Real world', CHECKPOINT: 'Checkpoint', REFLECTION: 'Reflection',
}
const INVALID = new Set(['invalid-input', 'too-short'])
const PENDING_MESSAGE = 'Response saved. Your teacher will mark it and give feedback.'

/** Rebuilds what the student had on screen from their saved attempts. */
function restore(q: Question, prior: AttemptRecord[]) {
  const last = prior[prior.length - 1]
  const resolvedAttempt = last && (last.isCorrect || last.pendingMarking) ? last : null
  const outcome: SubmitOutcome | null = resolvedAttempt
    ? {
        attempt: resolvedAttempt,
        rewards: [],
        result: resolvedAttempt.isCorrect
          ? { correct: true, marks: resolvedAttempt.marks, feedback: CORRECT_MESSAGE }
          : { correct: false, marks: 0, feedback: PENDING_MESSAGE, pendingMarking: true },
      }
    : null
  const resp = last?.response ?? ''
  let match: Record<string, string> = {}
  if (q.type === 'MATCH' && resp) {
    try { match = JSON.parse(resp) as Record<string, string> } catch { match = {} }
  }
  return {
    outcome,
    text: q.type === 'NUMERIC' || q.type === 'READ_POINT' || q.type === 'EXPLAIN_REASONING' ? resp : '',
    choice: q.type === 'MCQ' ? resp : '',
    plotted: q.type === 'PLOT_POINT' && resp ? parsePoint(resp) : null,
    match,
    hints: Math.min(q.hints.length, Math.max(0, ...prior.map((a) => a.hintsUsed))),
    wrong: prior.filter((a) => !a.isCorrect && !a.pendingMarking && !INVALID.has(a.errorTag ?? '')).length,
  }
}

export function QuestionCard({ question: q, lessonId, studentId, fresh, onAnswered, onResolved }: Props) {
  const [init] = useState(() => {
    const prior = fresh ? [] : getState().attempts.filter((a) => a.studentId === studentId && a.questionId === q.id)
    return restore(q, prior)
  })
  const [text, setText] = useState(init.text)
  const [choice, setChoice] = useState(init.choice)
  const [plotted, setPlotted] = useState<Point | null>(init.plotted)
  const [px, setPx] = useState(init.plotted ? String(init.plotted.x) : '')
  const [py, setPy] = useState(init.plotted ? String(init.plotted.y) : '')
  const [match, setMatch] = useState<Record<string, string>>(init.match)
  const [hints, setHints] = useState(init.hints)
  const [wrong, setWrong] = useState(init.wrong)
  const [outcome, setOutcome] = useState<SubmitOutcome | null>(init.outcome)
  const [showWorked, setShowWorked] = useState(false)
  const [mistakeHintShown, setMistakeHintShown] = useState(false)
  const [busy, setBusy] = useState(false)

  const resolved = outcome?.result.correct || outcome?.result.pendingMarking
  useEffect(() => {
    if (init.outcome) onAnswered?.(true)
    // Only on first mount: tells the lesson page this question was already answered.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rewardText = outcome?.rewards.length
    ? outcome.rewards.reduce((acc, r) => ({ ...acc, [r.type]: (acc[r.type] ?? 0) + r.amount }), {} as Record<string, number>)
    : null

  function check() {
    if (busy || resolved) return
    let response: string | Point
    if (q.type === 'PLOT_POINT') {
      if (!plotted) return
      response = plotted
    } else if (q.type === 'MCQ') {
      response = choice
    } else if (q.type === 'MATCH') {
      response = JSON.stringify(match)
    } else {
      response = text
    }
    setBusy(true)
    const res = submitAttempt(studentId, lessonId, q, response, hints)
    setOutcome(res)
    setMistakeHintShown(false)
    onAnswered?.(res.result.correct || !!res.result.pendingMarking)
    if (!res.result.correct && !res.result.pendingMarking && !INVALID.has(res.result.tag ?? '')) setWrong((n) => n + 1)
    setBusy(false)
  }

  function setFromInputs(nx: string, ny: string) {
    const x = Number(nx)
    const y = Number(ny)
    if (nx.trim() !== '' && ny.trim() !== '' && Number.isFinite(x) && Number.isFinite(y)) setPlotted({ x: Math.max(-5, Math.min(5, x)), y: Math.max(-5, Math.min(5, y)) })
  }

  const canCheck =
    q.type === 'PLOT_POINT' ? !!plotted : q.type === 'MCQ' ? !!choice : q.type === 'MATCH' ? q.items.every((i) => !!match[i.id]) : text.trim().length > 0
  const hasHints = q.hints.length > 0

  return (
    <section className="card p-4 sm:p-5" aria-labelledby={`q-${q.id}`}>
      <p className="chip mb-2">{STAGE_LABEL[q.stage]} · {q.maxMarks} mark{q.maxMarks > 1 ? 's' : ''}</p>
      <h3 id={`q-${q.id}`} className="text-lg font-bold"><MathText text={q.prompt} /></h3>

      <div className="mt-4 space-y-3">
        {(q.type === 'NUMERIC' || q.type === 'READ_POINT') && (
          <label className="block">
            <span className="mb-1 block text-sm text-soft">Your answer{q.type === 'NUMERIC' && q.unit ? ' (include units)' : ''}</span>
            <input
              className="input w-full max-w-xs" value={text} onChange={(e) => setText(e.target.value)} inputMode="text" autoComplete="off"
              placeholder={q.type === 'READ_POINT' ? 'e.g. (2, -3)' : q.unit ? `e.g. 12 ${q.unit}` : 'e.g. 2, -1.5 or 3/4'} disabled={!!resolved}
              onKeyDown={(e) => { if (e.key === 'Enter' && canCheck && !resolved) check() }}
            />
          </label>
        )}
        {q.type === 'MCQ' && (
          <fieldset disabled={!!resolved}>
            <legend className="sr-only">Choose one answer</legend>
            <div className="space-y-2">
              {q.options.map((o) => (
                <label key={o.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${choice === o.id ? 'border-brand bg-surface-2' : 'border-line'}`}>
                  <input type="radio" name={q.id} value={o.id} checked={choice === o.id} onChange={() => setChoice(o.id)} />
                  <span className="min-w-0"><MathText text={o.text} /></span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {q.type === 'MATCH' && (
          <ul className="space-y-3">
            {q.items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-3">
                {item.line && <MiniLine from={item.line.from} to={item.line.to} />}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.label}</p>
                  {item.line && (
                    <p className="text-xs text-soft">
                      Passes through ({formatNumber(item.line.from.x)}, {formatNumber(item.line.from.y)}) and ({formatNumber(item.line.to.x)}, {formatNumber(item.line.to.y)})
                    </p>
                  )}
                </div>
                <label className="w-full sm:w-auto">
                  <span className="sr-only">Gradient type for {item.label}</span>
                  <select className="input w-full" value={match[item.id] ?? ''} disabled={!!resolved} onChange={(e) => setMatch({ ...match, [item.id]: e.target.value })}>
                    <option value="">Choose...</option>
                    {q.options.map((o) => <option key={o.id} value={o.id}>{o.text}</option>)}
                  </select>
                </label>
              </li>
            ))}
          </ul>
        )}
        {q.type === 'PLOT_POINT' && (
          <div className="space-y-3">
            <CartesianGraph bounds={{ xMin: -5, xMax: 5, yMin: -5, yMax: 5 }} xStep={1} yStep={1} title="Plot the point" points={[]} onPlot={resolved ? undefined : (p) => { setPlotted(p); setPx(String(p.x)); setPy(String(p.y)) }} plotted={plotted} onReset={() => setPlotted(null)} showGradient={false} />
            <fieldset className="flex flex-wrap items-end gap-3" disabled={!!resolved}>
              <legend className="mb-1 text-sm text-soft">Keyboard alternative: type the coordinates</legend>
              <label>x <input className="input w-24" inputMode="numeric" value={px} onChange={(e) => { setPx(e.target.value); setFromInputs(e.target.value, py) }} /></label>
              <label>y <input className="input w-24" inputMode="numeric" value={py} onChange={(e) => { setPy(e.target.value); setFromInputs(px, e.target.value) }} /></label>
              <span className="text-sm text-soft" aria-live="polite">{plotted ? `Selected: (${plotted.x}, ${plotted.y})` : 'Nothing plotted yet'}</span>
            </fieldset>
          </div>
        )}
        {q.type === 'EXPLAIN_REASONING' && (
          <>
            <label className="block">
              <span className="mb-1 block text-sm text-soft">Explain in your own words</span>
              <textarea className="input min-h-28 w-full" value={text} onChange={(e) => setText(e.target.value)} disabled={!!resolved} />
            </label>
            <details className="rounded-lg border border-line bg-surface-2 p-3 text-sm">
              <summary className="cursor-pointer font-semibold">View Marking Rubric</summary>
              <p className="my-2 text-soft">Your teacher marks each criterion from 0 to 2, giving a total out of 6.</p>
              <RubricView question={q} />
            </details>
          </>
        )}
      </div>

      {!resolved && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className="btn btn-primary" disabled={!canCheck || busy} onClick={check}>{outcome ? 'Check again' : q.type === 'EXPLAIN_REASONING' ? 'Submit response' : 'Check answer'}</button>
          {hasHints && hints < q.hints.length && (
            <button className={`btn ${wrong >= 2 ? 'btn-accent' : ''}`} onClick={() => setHints((h) => h + 1)}><Lightbulb size={16} /> Hint (optional)</button>
          )}
        </div>
      )}

      {hints > 0 && (
        <ul className="mt-3 space-y-1 rounded-lg border border-line bg-surface-2 p-3 text-sm">
          {q.hints.slice(0, hints).map((h, i) => <li key={i}><strong>Hint {i + 1}:</strong> <MathText text={h} /></li>)}
          <li className="text-xs text-soft">Using hints is fine. It helps your teacher see where support is useful.</li>
        </ul>
      )}

      {outcome && (
        <div role="status" aria-live="polite" className={`pop-in mt-4 flex gap-3 rounded-xl border p-3 ${outcome.result.correct ? 'border-good bg-good-soft' : outcome.result.pendingMarking ? 'border-warn bg-warn-soft' : 'border-bad bg-bad-soft'}`}>
          {outcome.result.correct ? <CheckCircle2 className="mt-0.5 shrink-0 text-good" /> : outcome.result.pendingMarking ? <Hourglass className="mt-0.5 shrink-0 text-warn" /> : <XCircle className="mt-0.5 shrink-0 text-bad" />}
          <div className="min-w-0 text-sm">
            <p className="font-semibold">{outcome.result.feedback}</p>
            {outcome.result.hint && !outcome.result.correct && (
              mistakeHintShown ? (
                <p className="mt-1"><strong>Hint:</strong> <MathText text={outcome.result.hint} /></p>
              ) : (
                <button className="btn mt-2 !py-1 text-xs" onClick={() => { setMistakeHintShown(true); setHints((h) => h + 1) }}>
                  <Lightbulb size={14} /> Hint about my answer (optional)
                </button>
              )
            )}
            {rewardText && (
              <p className="mt-1 font-semibold">
                {rewardText.COINS ? `+${rewardText.COINS} coins ` : ''}{rewardText.XP ? `+${rewardText.XP} XP` : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {!resolved && wrong >= 3 && q.type !== 'EXPLAIN_REASONING' && q.explanation && (
        <div className="mt-3 text-sm">
          <button className="btn" onClick={() => setShowWorked(true)}>Show a worked example</button>
          {showWorked && <p className="mt-2 rounded-lg border border-line bg-surface-2 p-3"><MathText text={q.explanation} /></p>}
          <button className="btn ml-2" onClick={() => onResolved('skipped')}>Skip for now</button>
        </div>
      )}
      {!resolved && wrong >= 3 && !q.explanation && q.type !== 'EXPLAIN_REASONING' && (
        <div className="mt-3 text-sm"><button className="btn" onClick={() => onResolved('skipped')}>Skip for now</button></div>
      )}

      {resolved && (
        <div className="mt-4">
          <button className="btn btn-primary" onClick={() => onResolved(outcome!.result.correct ? 'correct' : 'pending')}>Continue</button>
        </div>
      )}
    </section>
  )
}
