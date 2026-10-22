import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, RotateCcw } from 'lucide-react'
import { GRADIENT_LESSON, GRADIENT_LESSON_ID, ALL_LESSON_QUESTIONS } from '@/data/lessons/gradient'
import { CartesianGraph } from '@/components/graphs/CartesianGraph'
import type { GraphPoint } from '@/components/graphs/CartesianGraph'
import { QuestionCard } from '@/components/assessments/QuestionCard'
import { Labrador } from '@/components/mascots/Labrador'
import { RewardRules } from '@/components/rewards/RewardRules'
import { useStudent } from '@/hooks/useStudent'
import { completeLesson, restartLessonForRevision, saveLessonPosition } from '@/services/persistence/actions'
import { lessonProgress, summariseSkill } from '@/lib/analytics/diagnostics'
import { derivePosition } from '@/lib/lesson/position'
import type { LessonStep } from '@/data/lessons/gradient'
import { MathText } from '@/components/ui/MathText'
import type { LessonPosition } from '@/types'

function StepGraph({ step, answered }: { step: LessonStep; answered: boolean }) {
  const spec = step.graph!
  const initial = useMemo<GraphPoint[]>(() => (spec.points ?? []).map((p) => ({ ...p })), [spec])
  const [points, setPoints] = useState<GraphPoint[]>(initial)
  const shown = points.map((p) => ({ ...p, hideCoords: p.hideCoords && !answered }))
  return (
    <CartesianGraph
      showGradient={spec.readout === 'always' || answered}
      bounds={{ xMin: spec.xMin, xMax: spec.xMax, yMin: spec.yMin, yMax: spec.yMax }}
      xStep={spec.xStep} yStep={spec.yStep} xLabel={spec.xLabel} yLabel={spec.yLabel} title={spec.title}
      points={shown} line={spec.line} showTriangle={spec.showTriangle && (spec.readout === 'always' || answered)}
      onPointChange={(id, p) => setPoints((cur) => cur.map((pt) => (pt.id === id ? { ...pt, ...p } : pt)))}
      onReset={() => setPoints(initial)}
    />
  )
}

function ThinkAloud({ lines, n, onChange, onDone }: { lines: string[]; n: number; onChange: (n: number) => void; onDone: () => void }) {
  return (
    <section className="card p-4 sm:p-5">
      <p className="chip mb-2">Think-aloud</p>
      <ol className="space-y-2">
        {lines.slice(0, n).map((l, i) => <li key={i} className="pop-in rounded-lg bg-surface-2 p-3"><span className="mr-2 font-bold text-brand">{i + 1}.</span><MathText text={l} /></li>)}
      </ol>
      <div className="mt-4">
        {n < lines.length
          ? <button className="btn btn-primary" onClick={() => onChange(n + 1)}>Next step <ArrowRight size={16} /></button>
          : <button className="btn btn-primary" onClick={onDone}>I follow. Continue <ArrowRight size={16} /></button>}
      </div>
    </section>
  )
}

export function GradientLessonPage() {
  const me = useStudent()
  const steps = GRADIENT_LESSON.steps as LessonStep[]
  const lessonAttempts = useMemo(() => me.attempts.filter((a) => a.lessonId === GRADIENT_LESSON_ID), [me.attempts])
  const stored = me.state.lessonState[me.id]?.[GRADIENT_LESSON_ID]
  // Saves made before lesson positions existed are resumed from the student's attempts.
  const position: LessonPosition = stored ?? derivePosition(steps, lessonAttempts)
  const [skipped, setSkipped] = useState(false)
  const [answered, setAnswered] = useState(false)
  const resumed = useRef(position.stepIdx > 0 || position.qIdx > 0)
  const { stepIdx, qIdx } = position
  const done = position.complete || stepIdx >= steps.length
  const step = !done ? steps[stepIdx] : null

  useEffect(() => {
    if (done) completeLesson(me.id, GRADIENT_LESSON_ID)
  }, [done, me.id])

  const save = (patch: Partial<LessonPosition>) => saveLessonPosition(me.id, GRADIENT_LESSON_ID, { ...position, ...patch })

  function nextStep() {
    const next = stepIdx + 1
    setAnswered(false)
    save(next >= steps.length ? { stepIdx: next, qIdx: 0, thinkN: 1, complete: true, revision: false } : { stepIdx: next, qIdx: 0, thinkN: 1 })
    window.scrollTo({ top: 0 })
  }

  function onResolved(outcome: 'correct' | 'pending' | 'skipped') {
    if (outcome === 'skipped') setSkipped(true)
    setAnswered(false)
    if (step && qIdx + 1 < step.questions.length) save({ qIdx: qIdx + 1 })
    else nextStep()
  }

  const prog = lessonProgress(me.attempts, GRADIENT_LESSON_ID, ALL_LESSON_QUESTIONS.map((q) => q.id))
  const lessonTx = me.transactions.filter((t) => t.key.includes(':grad-') || t.key.endsWith('checkpoint:gradient'))
  const coinsEarned = lessonTx.filter((t) => t.type === 'COINS').reduce((a, t) => a + t.amount, 0)
  const xpEarned = lessonTx.filter((t) => t.type === 'XP').reduce((a, t) => a + t.amount, 0)
  const calc = summariseSkill('gradient-calc', me.attempts)

  return (
    <div className="space-y-5">
      <header className="card graph-paper overflow-hidden">
        <div className="flex flex-wrap items-center gap-4 bg-surface/85 p-4 sm:p-5">
          <Labrador character="slope" size={72} showBackground={false} expression={done ? 'proud' : 'thinking'} />
          <div className="min-w-0 flex-1 basis-60">
            <p className="chip">Slope Lab · about {GRADIENT_LESSON.durationMinutes} min</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold">{GRADIENT_LESSON.title}</h1>
            <p className="text-sm"><strong>Learning intention:</strong> {GRADIENT_LESSON.learningIntention}</p>
          </div>
        </div>
        <details className="border-t border-line bg-surface px-5 py-2 text-sm">
          <summary className="cursor-pointer font-semibold">Success criteria</summary>
          <ul className="mt-1 list-disc pl-5">{GRADIENT_LESSON.successCriteria.map((s) => <li key={s}>{s}</li>)}</ul>
        </details>
      </header>

      {resumed.current && !done && (
        <p role="status" className="rounded-lg border border-line bg-surface-2 p-3 text-sm">
          Welcome back. You are up to <strong>{step?.title}</strong>
          {position.revision ? ' (revision mode: repeated questions earn no extra rewards).' : '. Your earlier answers and rewards are saved.'}
        </p>
      )}

      <ol className="no-print flex flex-wrap gap-2 text-xs" aria-label="Lesson stages">
        {steps.map((s, i) => (
          <li key={s.id} aria-current={i === stepIdx && !done ? 'step' : undefined} className={`chip ${i === stepIdx && !done ? '!bg-brand !text-brand-ink' : ''}`}>
            {i < stepIdx || done ? <Check size={12} aria-label="done" /> : null}{s.title.split(':')[0]}
          </li>
        ))}
        <li aria-current={done ? 'step' : undefined} className={`chip ${done ? '!bg-brand !text-brand-ink' : ''}`}>Rewards</li>
      </ol>

      {step && (
        <div key={step.id} className="grid gap-5 lg:grid-cols-2">
          <div className="min-w-0 space-y-3 lg:sticky lg:top-4 lg:self-start">
            <div>
              <h2 className="font-display text-2xl font-bold">{step.title}</h2>
              {step.intro && <p className="text-soft"><MathText text={step.intro} /></p>}
            </div>
            {step.graph && <StepGraph key={step.id} step={step} answered={answered && qIdx >= step.questions.length - 1} />}
          </div>
          <div className="min-w-0 space-y-4">
            {step.thinkAloud && (
              <ThinkAloud lines={step.thinkAloud} n={Math.min(position.thinkN, step.thinkAloud.length)} onChange={(n) => save({ thinkN: n })} onDone={nextStep} />
            )}
            {step.questions[qIdx] && (
              <QuestionCard
                key={`${step.questions[qIdx].id}-${position.revision ? 'rev' : 'main'}`}
                question={step.questions[qIdx]} lessonId={GRADIENT_LESSON_ID} studentId={me.id} fresh={position.revision}
                onAnswered={setAnswered} onResolved={onResolved}
              />
            )}
          </div>
        </div>
      )}

      {done && (
        <div className="grid gap-5 md:grid-cols-2">
          <section className="card p-6 text-center">
            <Labrador character="slope" equipped={me.appearance.character === 'slope' ? me.appearance : {}} size={150} expression="proud" idle />
            <h2 className="mt-2 font-display text-2xl font-extrabold">Lesson complete</h2>
            <p className="text-soft">You answered {prog.attempted} of {prog.total} questions and got {prog.correct} correct.{skipped ? ' You skipped a question; you can revisit it any time.' : ''}</p>
            <p className="mt-3 text-lg font-bold">+{coinsEarned} coins · +{xpEarned} XP earned in this lesson</p>
            <div className="mt-3 text-left"><RewardRules compact /></div>
          </section>
          <section className="card p-6">
            <h2 className="font-display text-xl font-bold">Your next step</h2>
            <p className="mt-2 text-soft">
              {calc.level === 'secure'
                ? 'You calculated gradient correctly on your own. Next up is interpreting gradients in more contexts.'
                : 'You are getting more consistent at identifying gradient direction. Your next step is calculating rise over run on your own, so try the lesson again later and focus on the "You do" questions.'}
            </p>
            <p className="mt-3 text-sm text-soft">Your written responses will be marked by your teacher, and feedback appears in My Progress once it is released.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn" onClick={() => { restartLessonForRevision(me.id, GRADIENT_LESSON_ID); window.scrollTo({ top: 0 }) }}><RotateCcw size={16} /> Restart for revision</button>
              <Link to="/student/shop" className="btn btn-accent">Spend coins in the shop</Link>
              <Link to="/student/progress" className="btn">See my progress</Link>
              <Link to="/student" className="btn">Back to dashboard</Link>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
