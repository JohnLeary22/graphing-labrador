import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useClassData } from '@/hooks/useClassData'
import { SKILLS } from '@/data/curriculum/skills'
import { DEMO_ASSIGNMENT } from '@/data/demo/assignment'
import { DEMO_CLASS } from '@/data/demo/seed'
import { questionById } from '@/data/lessons/gradient'
import { plainMath } from '@/lib/math/tex'

function csvEscape(v: string | number | boolean) {
  const s = String(v)
  // Prefix formula-like cells so spreadsheets do not execute student-typed text.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s
  return `"${safe.replace(/"/g, '""')}"`
}

export function TeacherDashboard() {
  const { rows, state } = useClassData()
  const total = rows.length
  const submitted = rows.filter((r) => r.status === 'submitted').length
  const notStarted = rows.filter((r) => r.status === 'not-started')
  const pending = state.attempts.filter((a) => a.pendingMarking && !state.marks[a.id])
  const support = rows.filter((r) => r.needsSupport)
  const skillData = SKILLS.map((k) => {
    const all = rows.flatMap((r) => r.attempts.filter((a) => a.skillIds.includes(k.id) && !a.pendingMarking))
    return { name: k.name.length > 22 ? `${k.name.slice(0, 20)}...` : k.name, accuracy: all.length ? Math.round((all.filter((a) => a.isCorrect).length / all.length) * 100) : 0, attempts: all.length }
  }).filter((d) => d.attempts > 0)
  const errorCounts = new Map<string, number>()
  for (const r of rows) for (const e of r.evidence) errorCounts.set(e.misconception.name, (errorCounts.get(e.misconception.name) ?? 0) + e.attemptIds.length)
  const errorData = [...errorCounts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  const recent = state.attempts.slice(-6).reverse()

  function exportCsv() {
    const header = ['student', 'question', 'attempt', 'response', 'correct', 'marks', 'max_marks', 'hints', 'error_tag', 'time']
    const lines = state.attempts.map((a) => [state.students.find((s) => s.id === a.studentId)?.name ?? a.studentId, a.questionId, a.attemptNumber, a.response, a.isCorrect, a.marks, a.maxMarks, a.hintsUsed, a.errorTag ?? '', a.at].map(csvEscape).join(','))
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'graphing-labrador-attempts.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Teaching dashboard</h1>
          <p className="text-soft">{DEMO_CLASS.name} · Assignment: {DEMO_ASSIGNMENT.title} (due {DEMO_ASSIGNMENT.due.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })})</p>
        </div>
        <button className="btn" onClick={exportCsv}><Download size={16} /> Export attempts (CSV)</button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/teacher/students" className="card p-4"><p className="text-sm text-soft">Students</p><p className="font-display text-3xl font-extrabold">{total}</p></Link>
        <div className="card p-4"><p className="text-sm text-soft">Checkpoint reached</p><p className="font-display text-3xl font-extrabold">{Math.round((submitted / total) * 100)}%</p><p className="text-xs text-soft">{submitted} of {total} students</p></div>
        <Link to="/teacher/marking" className="card p-4"><p className="text-sm text-soft">Awaiting marking</p><p className="font-display text-3xl font-extrabold">{pending.length}</p></Link>
        <Link to="/teacher/students" className="card p-4"><p className="text-sm text-soft">May need support</p><p className="font-display text-3xl font-extrabold">{support.length}</p><p className="text-xs text-soft">Based on evidence; see each profile</p></Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="acc-h">
          <h2 id="acc-h" className="font-display text-xl font-bold">Accuracy by skill</h2>
          <p className="mb-2 text-xs text-soft">Percentage of auto-marked attempts correct across the class (all attempts, including scaffolded).</p>
          <div className="h-64" role="img" aria-label={`Accuracy by skill: ${skillData.map((d) => `${d.name} ${d.accuracy}%`).join(', ')}`}>
            <ResponsiveContainer>
              <BarChart data={skillData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="var(--grid)" />
                <XAxis type="number" domain={[0, 100]} stroke="var(--ink-soft)" />
                <YAxis type="category" dataKey="name" width={130} stroke="var(--ink-soft)" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)' }} />
                <Bar dataKey="accuracy" fill="var(--brand)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="card p-5" aria-labelledby="err-h">
          <h2 id="err-h" className="font-display text-xl font-bold">Common errors</h2>
          <p className="mb-2 text-xs text-soft">Tagged wrong answers. One error is not proof of a misconception; see student profiles for evidence.</p>
          {errorData.length === 0 ? <p className="text-soft">No tagged errors yet.</p> : (
            <div className="h-64" role="img" aria-label={`Common errors: ${errorData.map((d) => `${d.name} ${d.count}`).join(', ')}`}>
              <ResponsiveContainer>
                <BarChart data={errorData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid stroke="var(--grid)" />
                  <XAxis type="number" allowDecimals={false} stroke="var(--ink-soft)" />
                  <YAxis type="category" dataKey="name" width={150} stroke="var(--ink-soft)" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)' }} />
                  <Bar dataKey="count" fill="var(--accent)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="miss-h">
          <h2 id="miss-h" className="mb-2 font-display text-xl font-bold">Missing work</h2>
          <p className="mb-2 text-xs text-soft">Not started is not the same as unwilling. Check absence, access and support needs before escalating.</p>
          {notStarted.length === 0 ? <p className="text-soft">Everyone has started.</p> : (
            <ul className="space-y-2 text-sm">
              {notStarted.map((r) => <li key={r.student.id} className="flex items-center justify-between rounded-lg bg-surface-2 p-2"><span>{r.student.displayName}: not started</span><Link className="underline" to={`/teacher/students/${r.student.id}`}>Open</Link></li>)}
            </ul>
          )}
        </section>
        <section className="card p-5" aria-labelledby="rec-h">
          <h2 id="rec-h" className="mb-2 font-display text-xl font-bold">Recent submissions</h2>
          <ul className="space-y-2 text-sm">
            {recent.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 rounded-lg bg-surface-2 p-2">
                <span className="truncate">{state.students.find((s) => s.id === a.studentId)?.displayName}: {plainMath(questionById(a.questionId)?.prompt ?? '').slice(0, 40)}...</span>
                <span className="chip">{a.pendingMarking ? 'to mark' : a.isCorrect ? 'correct' : 'incorrect'}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
