import { useStudent } from '@/hooks/useStudent'
import { SKILLS } from '@/data/curriculum/skills'
import { summariseSkill } from '@/lib/analytics/diagnostics'

const ENCOURAGE: Record<string, Record<string, string>> = {
  'gradient-direction': {
    emerging: 'You are starting to spot whether a line goes up, down, or is flat. Keep checking the direction as you read left to right.',
    developing: 'You are getting more consistent at identifying gradient direction.',
    secure: 'You identify gradient direction reliably on your own.',
  },
  'gradient-calc': {
    emerging: 'Your next step is calculating rise over run independently. Try drawing the rise and run before dividing.',
    developing: 'You are building skill at rise over run. Next, aim to do it without hints.',
    secure: 'You calculate gradient with rise over run on your own.',
  },
  'gradient-context': { emerging: 'Next, practise saying what a gradient means with units.', developing: 'You are linking gradient to real situations.', secure: 'You explain gradients as rates with units.' },
  'coords-plot': { emerging: 'Practise plotting with x first, then y.', developing: 'Your plotting is getting steadier.', secure: 'You plot points accurately.' },
  'gradient-explain': { emerging: 'Try writing a sentence that uses "because".', developing: 'Your explanations are developing.', secure: 'You justify your thinking clearly.' },
}

export function Progress() {
  const me = useStudent()
  const skills = SKILLS.map((s) => ({ s, sum: summariseSkill(s.id, me.attempts) }))
  const marks = me.state.marks
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl font-extrabold">My Progress</h1>
        <p className="text-soft">{me.student.displayName}'s own improvement over time. No comparisons with classmates here.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Level', String(me.level)], ['Total XP', String(me.xp)], ['Coins earned', String(me.earned)], ['Coins spent', String(me.spent)],
        ].map(([k, v]) => <div key={k} className="card p-4"><p className="text-sm text-soft">{k}</p><p className="font-display text-3xl font-extrabold">{v}</p></div>)}
      </div>
      <section className="card p-5" aria-labelledby="skills-h">
        <h2 id="skills-h" className="mb-3 font-display text-xl font-bold">Skills</h2>
        <ul className="space-y-3">
          {skills.map(({ s, sum }) => (
            <li key={s.id} className="rounded-xl border border-line p-3">
              <p className="font-bold">{s.name}</p>
              <p className="text-sm text-soft">{sum.level === 'no-evidence' ? 'Not started yet. Complete the Understanding Gradient lesson to see feedback here.' : ENCOURAGE[s.id]?.[sum.level] ?? ''}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="card p-5" aria-labelledby="fb-h">
        <h2 id="fb-h" className="mb-3 font-display text-xl font-bold">Teacher feedback</h2>
        {Object.values(marks).filter((m) => m.released && me.attempts.some((a) => a.id === m.attemptId)).length === 0
          ? <p className="text-soft">No released feedback yet.</p>
          : Object.values(marks).filter((m) => m.released && me.attempts.some((a) => a.id === m.attemptId)).map((m) => <p key={m.attemptId} className="rounded-lg bg-surface-2 p-3 text-sm"><strong>{m.total}/6</strong> · {m.comment}</p>)}
      </section>
    </div>
  )
}
