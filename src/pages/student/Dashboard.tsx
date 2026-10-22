import { Link } from 'react-router-dom'
import { CalendarCheck, Coins, Pencil } from 'lucide-react'
import { useState } from 'react'
import { useStudent } from '@/hooks/useStudent'
import { Labrador } from '@/components/mascots/Labrador'
import { CHARACTERS, LABS } from '@/data/curriculum/labs'
import { ALL_LESSON_QUESTIONS, GRADIENT_LESSON_ID } from '@/data/lessons/gradient'
import { DEMO_ASSIGNMENT } from '@/data/demo/assignment'
import { claimCheckIn, setStudentName } from '@/services/persistence/actions'
import { lessonProgress } from '@/lib/analytics/diagnostics'
import { todayKey } from '@/services/persistence/store'
import { XP_PER_LEVEL } from '@/lib/rewards/economy'
import { RewardRules } from '@/components/rewards/RewardRules'

function NameEditor({ studentId, name }: { studentId: string; name: string }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  if (!editing) {
    return (
      <button className="btn !py-1 text-xs" onClick={() => { setDraft(name); setEditing(true) }}><Pencil size={14} /> Edit Name</button>
    )
  }
  return (
    <form className="flex flex-wrap items-center gap-2" onSubmit={(e) => { e.preventDefault(); if (setStudentName(studentId, draft)) setEditing(false) }}>
      <label><span className="sr-only">Your preferred name</span><input className="input !py-1" value={draft} maxLength={30} autoFocus onChange={(e) => setDraft(e.target.value)} /></label>
      <button className="btn btn-primary !py-1 text-xs" type="submit" disabled={!draft.trim()}>Save</button>
      <button className="btn !py-1 text-xs" type="button" onClick={() => setEditing(false)}>Cancel</button>
    </form>
  )
}

export function StudentDashboard() {
  const me = useStudent()
  const [msg, setMsg] = useState('')
  const checkedIn = me.state.transactions.some((t) => t.studentId === me.id && t.key === `COINS:checkin:${todayKey()}`)
  const prog = lessonProgress(me.attempts, GRADIENT_LESSON_ID, ALL_LESSON_QUESTIONS.map((q) => q.id))
  const assignmentDone = me.completed.includes(GRADIENT_LESSON_ID)
  const char = CHARACTERS[me.appearance.character]
  const due = DEMO_ASSIGNMENT.due

  return (
    <div className="space-y-6">
      <section className="card graph-paper relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-6 bg-surface/80 p-6">
          <Labrador character={me.appearance.character} equipped={me.appearance} size={150} idle />
          <div className="min-w-60 flex-1">
            <h1 className="font-display text-3xl font-extrabold">Welcome back, {me.student.displayName}.</h1>
            <p className="text-soft">Currently with {char.nickname} · {char.lab}</p>
            <div className="mt-2"><NameEditor key={me.student.displayName} studentId={me.id} name={me.student.displayName} /></div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="chip">Level {me.level}</span>
              <div className="min-w-40 flex-1" role="progressbar" aria-label="XP toward next level" aria-valuenow={me.xpInto} aria-valuemin={0} aria-valuemax={XP_PER_LEVEL}>
                <div className="h-3 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${me.xpInto}%` }} /></div>
                <p className="mt-1 text-xs text-soft">{me.xpInto} / {XP_PER_LEVEL} XP to level {me.level + 1}</p>
              </div>
              <span className="chip"><Coins size={14} /> {me.coinsLabel} coins</span>
            </div>
          </div>
          <div className="text-center">
            <button
              className="btn btn-accent"
              disabled={checkedIn}
              onClick={() => { const r = claimCheckIn(me.id); setMsg(r.length ? `+${r[0].amount} coins. Thanks for checking in.` : '') }}
            >
              <CalendarCheck size={18} /> {checkedIn ? 'Checked in today' : `Daily check-in (+${me.state.economy.dailyCheckIn})`}
            </button>
            <p className="mt-1 text-xs text-soft" aria-live="polite">{msg}</p>
          </div>
        </div>
      </section>

      <section className="card flex flex-wrap items-center gap-4 p-5" aria-labelledby="continue-h">
        <div className="min-w-60 flex-1">
          <p className="chip mb-2">Continue learning · Slope Lab</p>
          <h2 id="continue-h" className="font-display text-2xl font-bold">Understanding Gradient</h2>
          <p className="text-soft">Understand gradient as the rate of change between two variables.</p>
          <p className="mt-2 text-sm">{prog.attempted} of {prog.total} questions attempted</p>
          <div className="mt-1 h-2 max-w-sm overflow-hidden rounded-full bg-surface-2"><div className="h-full bg-brand" style={{ width: `${prog.fraction * 100}%` }} /></div>
        </div>
        <Link to="/student/lesson/gradient" className="btn btn-primary !px-6 !py-3 text-base">{prog.attempted ? 'Resume lesson' : 'Start lesson'}</Link>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2" aria-labelledby="labs-h">
          <h2 id="labs-h" className="mb-3 font-display text-xl font-bold">My Labs</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {LABS.map((lab) => {
              const c = CHARACTERS[lab.character]
              const playable = lab.lessons.some((l) => l.playable)
              return (
                <li key={lab.id}>
                  <Link to={`/student/labs/${lab.id}`} className="flex items-center gap-3 rounded-xl border border-line p-3 transition hover:-translate-y-0.5 hover:border-brand">
                    <Labrador character={lab.character} size={56} showBackground={false} label={`${c.nickname}`} />
                    <div className="min-w-0">
                      <p className="font-bold">{lab.name}</p>
                      <p className="truncate text-sm text-soft">{lab.topic}</p>
                      <span className="chip mt-1">{playable ? (lab.id === 'slope' && assignmentDone ? 'Lesson complete' : 'Lesson available') : 'Lessons in development'}</span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="card p-5" aria-labelledby="assign-h">
            <h2 id="assign-h" className="mb-3 font-display text-xl font-bold">Active assignments</h2>
            <div className="rounded-xl border border-line p-3">
              <p className="font-bold">{DEMO_ASSIGNMENT.title}</p>
              <p className="text-sm text-soft">Set by Mr John Leary · due {due.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
              <span className={`chip mt-2 ${assignmentDone ? 'text-good' : ''}`}>{assignmentDone ? 'Complete' : prog.attempted ? 'In progress' : 'Not started'}</span>
            </div>
          </section>
          <section className="card p-5" aria-labelledby="rw-h">
            <h2 id="rw-h" className="mb-2 font-display text-xl font-bold">How rewards work</h2>
            <RewardRules compact />
          </section>
        </div>
      </div>
    </div>
  )
}
