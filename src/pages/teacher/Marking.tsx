import { useState } from 'react'
import { useAppState } from '@/services/persistence/store'
import { markAttempt } from '@/services/persistence/actions'
import { RUBRIC, questionById } from '@/data/lessons/gradient'
import { RubricView } from '@/components/assessments/RubricView'
import { MathText } from '@/components/ui/MathText'
import type { AttemptRecord, OpenQuestion } from '@/types'

function MarkCard({ attempt }: { attempt: AttemptRecord }) {
  const s = useAppState()
  const q = questionById(attempt.questionId) as OpenQuestion
  const existing = s.marks[attempt.id]
  const [scores, setScores] = useState<Record<string, number>>(existing?.scores ?? {})
  const [comment, setComment] = useState(existing?.comment ?? '')
  const [saved, setSaved] = useState(false)
  const criteria = RUBRIC.criteria.filter((c) => q.rubricCriteria.includes(c.id))
  const complete = criteria.every((c) => scores[c.id] !== undefined)
  const total = criteria.reduce((a, c) => a + (scores[c.id] ?? 0), 0)
  const student = s.students.find((x) => x.id === attempt.studentId)

  return (
    <article className="card p-5" aria-label={`Response from ${student?.name}`}>
      <p className="font-bold">{student?.name} <span className="font-normal text-soft">· <MathText text={q.prompt} /></span></p>
      <blockquote className="my-3 rounded-lg border-l-4 border-brand bg-surface-2 p-3">{attempt.response}</blockquote>
      <RubricView question={q} idPrefix={attempt.id} scores={scores} onScore={(id, v) => { setSaved(false); setScores({ ...scores, [id]: v }) }} />
      <ul className="mt-2 space-y-1 text-xs">
        {criteria.filter((c) => scores[c.id] !== undefined && scores[c.id] < 2).map((c) => <li key={c.id}><strong>Next teaching action ({c.name}):</strong> {c.next}</li>)}
      </ul>
      <label className="mt-3 block"><span className="text-sm font-semibold">Feedback to student</span><textarea className="input mt-1 min-h-20 w-full" value={comment} onChange={(e) => { setSaved(false); setComment(e.target.value) }} /></label>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className="btn btn-primary" disabled={!complete} onClick={() => { markAttempt({ attemptId: attempt.id, scores, comment, released: true, total }); setSaved(true) }}>Save and release ({total}/{criteria.length * 2})</button>
        {existing?.released && !saved && <span className="chip">Released</span>}
        {saved && <span role="status" className="text-sm font-semibold text-good">Saved and released to the student.</span>}
      </div>
    </article>
  )
}

export function Marking() {
  const s = useAppState()
  const open = s.attempts.filter((a) => a.pendingMarking)
  const todo = open.filter((a) => !s.marks[a.id])
  const done = open.filter((a) => s.marks[a.id])
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Results and marking</h1>
        <p className="text-soft">Open responses are never auto-marked. Use the rubric to give a mark and feedback. Rubric: {RUBRIC.title}.</p>
      </header>
      <h2 className="font-display text-xl font-bold">To mark ({todo.length})</h2>
      {todo.length === 0 && <p className="text-soft">Nothing waiting.</p>}
      {todo.map((a) => <MarkCard key={a.id} attempt={a} />)}
      <h2 className="font-display text-xl font-bold">Marked ({done.length})</h2>
      {done.map((a) => <MarkCard key={a.id} attempt={a} />)}
    </div>
  )
}
