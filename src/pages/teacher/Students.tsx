import { useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useClassData } from '@/hooks/useClassData'
import { SKILLS } from '@/data/curriculum/skills'
import { questionById } from '@/data/lessons/gradient'
import { addNote, assignIntervention, setInterventionStatus } from '@/services/persistence/actions'
import { plainMath } from '@/lib/math/tex'

const STATUS_LABEL = { 'not-started': 'Not started', 'in-progress': 'In progress', submitted: 'Checkpoint reached' } as const
const LEVEL_LABEL = { 'no-evidence': 'No evidence', emerging: 'Emerging', developing: 'Developing', secure: 'Secure' } as const

export function StudentsList() {
  const { rows } = useClassData()
  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Students</h1>
        <p className="text-soft">Year 9 Maths 9A (demo). Fictional students.</p>
      </header>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Students in the class</caption>
          <thead><tr className="border-b border-line"><th scope="col" className="p-3">Student</th><th scope="col" className="p-3">Gradient lesson</th><th scope="col" className="p-3">Questions attempted</th><th scope="col" className="p-3">Last activity</th><th scope="col" className="p-3">Flag</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.student.id} className="border-b border-line last:border-0">
                <th scope="row" className="p-3"><Link className="font-semibold underline" to={`/teacher/students/${r.student.id}`}>{r.student.name}</Link></th>
                <td className="p-3">{STATUS_LABEL[r.status]}</td>
                <td className="p-3">{r.progress.attempted}/{r.progress.total}</td>
                <td className="p-3">{r.lastActive ? new Date(r.lastActive).toLocaleDateString('en-AU') : '-'}</td>
                <td className="p-3">{r.needsSupport ? <span className="chip border-warn text-warn">Support suggested</span> : r.status === 'not-started' ? <span className="chip">Missing work</span> : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function StudentProfile() {
  const { studentId = '' } = useParams()
  const { rows, state } = useClassData()
  const row = rows.find((r) => r.student.id === studentId)
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState('')
  const attemptsRef = useRef<HTMLElement>(null)
  if (!row) return <Navigate to="/teacher/students" replace />
  const notes = state.notes.filter((n) => n.studentId === studentId)
  const ints = state.interventions.filter((i) => i.studentId === studentId)
  const byQuestion = new Map<string, typeof row.attempts>()
  for (const a of row.attempts) byQuestion.set(a.questionId, [...(byQuestion.get(a.questionId) ?? []), a])
  const compare = [...byQuestion].filter(([, list]) => list.length > 1)

  return (
    <div className="space-y-5">
      <header>
        <Link to="/teacher/students" className="text-sm underline">Back to students</Link>
        <h1 className="font-display text-3xl font-extrabold">{row.student.name}</h1>
        <p className="text-soft">{STATUS_LABEL[row.status]} · {row.progress.attempted}/{row.progress.total} questions attempted</p>
      </header>
      <p role="status" aria-live="polite" className="min-h-5 text-sm font-semibold">{msg}</p>

      <section className="card p-5" aria-labelledby="diag-h">
        <h2 id="diag-h" className="font-display text-xl font-bold">Diagnostic summary</h2>
        <p className="mt-2">{row.summary}</p>
        <p className="mt-1 text-xs text-soft">Built from the attempts below. Completion and time are not counted as evidence of mastery.</p>
      </section>

      <section className="card p-5" aria-labelledby="skill-h">
        <h2 id="skill-h" className="mb-2 font-display text-xl font-bold">Skill evidence</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Evidence by skill</caption>
            <thead><tr><th scope="col" className="p-2">Skill</th><th scope="col" className="p-2">Level</th><th scope="col" className="p-2">Independent items</th><th scope="col" className="p-2">Independent accuracy</th><th scope="col" className="p-2">With support</th><th scope="col" className="p-2">Hints</th></tr></thead>
            <tbody>
              {row.skills.map((k) => (
                <tr key={k.skillId} className="border-t border-line">
                  <th scope="row" className="p-2">{SKILLS.find((s) => s.id === k.skillId)?.name}</th>
                  <td className="p-2">{LEVEL_LABEL[k.level]}{k.provisional && k.level !== 'no-evidence' ? ' (provisional)' : ''}</td>
                  <td className="p-2">{k.independentQuestions}</td>
                  <td className="p-2">{k.independentAccuracy === null ? '-' : `${Math.round(k.independentAccuracy * 100)}%`}</td>
                  <td className="p-2">{k.scaffoldedAccuracy === null ? '-' : `${Math.round(k.scaffoldedAccuracy * 100)}%`}</td>
                  <td className="p-2">{k.hintsUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-5" aria-labelledby="mis-h">
        <h2 id="mis-h" className="mb-2 font-display text-xl font-bold">Misconception evidence</h2>
        {row.evidence.length === 0 ? <p className="text-soft">No tagged errors for this student.</p> : (
          <ul className="space-y-4">
            {row.evidence.map((e) => (
              <li key={e.tag} className="rounded-xl border border-line p-4">
                <p className="flex flex-wrap items-center gap-2 font-bold">{e.misconception.name}<span className={`chip ${e.status === 'likely' ? 'border-warn text-warn' : ''}`}>{e.status === 'likely' ? 'Likely (2+ questions)' : 'Possible (provisional)'}</span></p>
                <dl className="mt-2 grid gap-1 text-sm md:grid-cols-[150px_1fr]">
                  <dt className="font-semibold">Evidence</dt><dd>{e.attemptIds.length} wrong response{e.attemptIds.length > 1 ? 's' : ''} across {e.questionIds.length} question{e.questionIds.length > 1 ? 's' : ''}. {e.misconception.evidence}</dd>
                  <dt className="font-semibold">Strategy</dt><dd>{e.misconception.strategy}</dd>
                  <dt className="font-semibold">Why it works</dt><dd>{e.misconception.rationale}</dd>
                  <dt className="font-semibold">Follow-up task</dt><dd>{e.misconception.followUp}</dd>
                  <dt className="font-semibold">Check improvement</dt><dd>{e.misconception.checkImprovement}</dd>
                </dl>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn btn-primary !py-1 text-sm" onClick={() => { assignIntervention({ studentId, skillId: 'gradient-calc', strategy: e.misconception.strategy, activity: e.misconception.followUp }); setMsg(`Practice assigned to ${row.student.displayName}.`) }}>Assign practice</button>
                  <button className="btn !py-1 text-sm" onClick={() => attemptsRef.current?.scrollIntoView({ behavior: 'smooth' })}>View responses</button>
                  <button className="btn !py-1 text-sm" onClick={() => { assignIntervention({ studentId, skillId: 'gradient-calc', strategy: e.misconception.strategy, activity: 'Teacher to review', status: 'review' }); setMsg('Marked for review.') }}>Mark for review</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-5" aria-labelledby="int-h">
        <h2 id="int-h" className="mb-2 font-display text-xl font-bold">Interventions</h2>
        {ints.length === 0 ? <p className="text-soft">None assigned.</p> : (
          <ul className="space-y-2 text-sm">
            {ints.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-2 p-3">
                <span><strong className="capitalize">{i.status}</strong> · {i.activity}</span>
                <span className="flex gap-1">
                  <button className="btn !py-0.5 text-xs" onClick={() => setInterventionStatus(i.id, 'completed')}>Mark completed</button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-5" aria-labelledby="note-h">
        <h2 id="note-h" className="mb-2 font-display text-xl font-bold">Teacher notes</h2>
        <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); addNote(studentId, note); setNote(''); setMsg('Note saved.') }}>
          <label className="min-w-60 flex-1"><span className="sr-only">New note</span><input className="input w-full" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note..." /></label>
          <button className="btn" type="submit">Add note</button>
        </form>
        <ul className="mt-3 space-y-1 text-sm">{notes.map((n) => <li key={n.id}><span className="text-soft">{new Date(n.at).toLocaleDateString('en-AU')}</span> {n.note}</li>)}</ul>
      </section>

      {compare.length > 0 && (
        <section className="card p-5" aria-labelledby="cmp-h">
          <h2 id="cmp-h" className="mb-2 font-display text-xl font-bold">Earlier and later attempts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">First and latest attempt on repeated questions</caption>
              <thead><tr><th scope="col" className="p-2">Question</th><th scope="col" className="p-2">First attempt</th><th scope="col" className="p-2">Latest attempt</th></tr></thead>
              <tbody>
                {compare.map(([qid, list]) => (
                  <tr key={qid} className="border-t border-line">
                    <td className="p-2">{plainMath(questionById(qid)?.prompt ?? qid).slice(0, 50)}</td>
                    <td className="p-2">{list[0].response} ({list[0].isCorrect ? 'correct' : list[0].errorTag ?? 'incorrect'})</td>
                    <td className="p-2">{list[list.length - 1].response} ({list[list.length - 1].isCorrect ? 'correct' : list[list.length - 1].errorTag ?? 'incorrect'})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section ref={attemptsRef} className="card p-5" aria-labelledby="att-h" tabIndex={-1}>
        <h2 id="att-h" className="mb-2 font-display text-xl font-bold">Attempt history</h2>
        {row.attempts.length === 0 ? <p className="text-soft">No attempts yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">All submitted attempts in order</caption>
              <thead><tr><th scope="col" className="p-2">Time</th><th scope="col" className="p-2">Question</th><th scope="col" className="p-2">Stage</th><th scope="col" className="p-2">Response</th><th scope="col" className="p-2">Result</th><th scope="col" className="p-2">Hints</th></tr></thead>
              <tbody>
                {row.attempts.map((a) => (
                  <tr key={a.id} className="border-t border-line align-top">
                    <td className="p-2 whitespace-nowrap">{new Date(a.at).toLocaleString('en-AU', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td className="p-2">{plainMath(questionById(a.questionId)?.prompt ?? a.questionId).slice(0, 55)}</td>
                    <td className="p-2">{a.stage}</td>
                    <td className="p-2">{a.response}</td>
                    <td className="p-2">{a.pendingMarking ? 'To mark' : a.isCorrect ? `Correct (${a.marks}/${a.maxMarks})` : `${a.errorTag ?? 'Incorrect'} (${a.marks}/${a.maxMarks})`}</td>
                    <td className="p-2">{a.hintsUsed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
