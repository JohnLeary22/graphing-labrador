import type { AttemptRecord, CharacterId, Equipped, MarkRecord, Student, Transaction } from '@/types'
import { ALL_LESSON_QUESTIONS, GRADIENT_LESSON_ID } from '@/data/lessons/gradient'
import { evaluate } from '@/lib/scoring/evaluate'
import { rewardsForAttempt } from '@/lib/rewards/economy'

/** All names are fictional. This is demonstration data, not real student information. */
export const DEMO_CLASS = { id: 'class-9a', name: 'Year 9 Maths 9A (demo)', yearLevel: 9, teacherName: 'Mr John Leary' }
export const DEMO_STUDENT_ID = 's1'
/** Bump when the question bank or seeded classmates change. */
export const SEED_VERSION = 2

export const DEMO_STUDENTS: Student[] = [
  { id: 's2', name: 'Jordan Blake', displayName: 'Jordan', classId: DEMO_CLASS.id },
  { id: 's3', name: 'Maya Nguyen', displayName: 'Maya', classId: DEMO_CLASS.id },
  { id: 's4', name: 'Liam Ortega', displayName: 'Liam', classId: DEMO_CLASS.id },
  { id: 's5', name: 'Aisha Rahman', displayName: 'Aisha', classId: DEMO_CLASS.id },
  { id: 's6', name: 'Noah Fraser', displayName: 'Noah', classId: DEMO_CLASS.id },
  { id: 's7', name: 'Chloe Anders', displayName: 'Chloe', classId: DEMO_CLASS.id },
  { id: 's8', name: 'Tomas Reyes', displayName: 'Tomas', classId: DEMO_CLASS.id },
  { id: 's9', name: 'Priya Shah', displayName: 'Priya', classId: DEMO_CLASS.id },
  { id: 's10', name: 'Eli Watson', displayName: 'Eli', classId: DEMO_CLASS.id },
  // The tenth student is the person using the browser; their name replaces this placeholder.
  { id: DEMO_STUDENT_ID, name: 'Demo Student', displayName: 'Demo Student', classId: DEMO_CLASS.id },
]

type Behaviour = 'ok' | 'rise-run-reversed' | 'negative-sign-ignored' | 'xy-reversal' | 'zero-vs-undefined' | 'other'

interface Profile {
  /** Behaviour sequence per question id; missing questions are answered correctly first time. */
  plan: Record<string, Behaviour[]>
  hints?: Record<string, number>
  stopAfter?: string
  reflection?: string
}

const ok: Behaviour[] = ['ok']
const profiles: Record<string, Profile> = {
  s2: {
    plan: {
      'grad-youdo-1': ['rise-run-reversed', 'ok'],
      'grad-app-1': ['rise-run-reversed', 'ok'],
      'grad-check-1': ['rise-run-reversed', 'rise-run-reversed'],
    },
    hints: { 'grad-wedo-grad': 1 },
    reflection: 'Gradient shows the steepness.',
  },
  s3: {
    plan: {
      'grad-wedo-rise': ['negative-sign-ignored', 'ok'],
      'grad-wedo-grad': ['negative-sign-ignored', 'ok'],
      'grad-check-3': ['zero-vs-undefined', 'ok'],
    },
    reflection: 'The height is just where you are at one time but the gradient is how fast it is changing, like 15 km/h for the cyclist.',
  },
  s4: { plan: { 'grad-check-2': ['xy-reversal', 'ok'] }, reflection: 'Gradient is rise over run and tells us how steep the line is in km per hour.' },
  s5: { plan: { 'grad-youdo-1': ['other'] }, stopAfter: 'grad-youdo-1' },
  s6: { plan: {}, reflection: 'Height only says the value at one point. Gradient says how quickly it changes, with units such as dollars per kilometre, so we can compare rates.' },
  s7: {
    plan: {
      'grad-youdo-1': ['rise-run-reversed', 'rise-run-reversed', 'ok'],
      'grad-check-1': ['rise-run-reversed', 'ok'],
    },
    hints: { 'grad-wedo-grad': 2 },
    reflection: 'It is how much it goes up.',
  },
  s8: { plan: {}, reflection: 'Gradient tells you the rate of change, so you can see how quickly something grows. A tall graph could still be flat.' },
  // s9 and s10 have not started (missing work demonstration).
}

function responseFor(qIndex: number, behaviour: Behaviour): string {
  const q = ALL_LESSON_QUESTIONS[qIndex]
  if (q.type === 'NUMERIC') {
    const unit = q.unit ? ` ${q.unit}` : ''
    if (behaviour === 'rise-run-reversed') return String(Math.round((1 / q.answer) * 1000) / 1000)
    if (behaviour === 'negative-sign-ignored') return String(-q.answer)
    if (behaviour === 'other') return String(q.answer + 7)
    return `${q.answer}${unit}`
  }
  if (q.type === 'PLOT_POINT') {
    if (behaviour === 'xy-reversal') return `(${q.target.y}, ${q.target.x})`
    return `(${q.target.x}, ${q.target.y})`
  }
  if (q.type === 'MCQ') {
    if (behaviour === 'zero-vs-undefined') return 'zero'
    if (behaviour !== 'ok') return q.options.find((o) => o.id !== q.correctId)!.id
    return q.correctId
  }
  if (q.type === 'READ_POINT') {
    if (behaviour === 'xy-reversal') return `(${q.target.y}, ${q.target.x})`
    return `(${q.target.x}, ${q.target.y})`
  }
  if (q.type === 'MATCH') return JSON.stringify(q.answers)
  return ''
}

function submitFor(qIndex: number, response: string) {
  const q = ALL_LESSON_QUESTIONS[qIndex]
  if (q.type === 'PLOT_POINT') {
    const m = response.match(/\(?\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)?/)
    return evaluate(q, { x: Number(m?.[1]), y: Number(m?.[2]) })
  }
  return evaluate(q, response)
}

export interface SeedData {
  attempts: AttemptRecord[]
  transactions: Transaction[]
  marks: Record<string, MarkRecord>
}

export function buildSeed(now = Date.now()): SeedData {
  const attempts: AttemptRecord[] = []
  const transactions: Transaction[] = []
  const marks: Record<string, MarkRecord> = {}
  const students = DEMO_STUDENTS.filter((s) => s.id !== DEMO_STUDENT_ID)
  students.forEach((student, si) => {
    const profile = profiles[student.id]
    if (!profile && !['s6', 's8'].includes(student.id)) return
    const p = profile ?? { plan: {} }
    let t = now - (6 - (si % 4)) * 24 * 3600 * 1000
    for (let qi = 0; qi < ALL_LESSON_QUESTIONS.length; qi++) {
      const q = ALL_LESSON_QUESTIONS[qi]
      if (q.type === 'EXPLAIN_REASONING') {
        if (!p.reflection || q.id !== 'grad-reflect-1') continue
        t += 90 * 1000
        const id = `seed-${student.id}-${q.id}-1`
        attempts.push({
          id, studentId: student.id, questionId: q.id, lessonId: GRADIENT_LESSON_ID, stage: q.stage, skillIds: q.skillIds,
          response: p.reflection, isCorrect: false, marks: 0, maxMarks: q.maxMarks, attemptNumber: 1, hintsUsed: 0,
          pendingMarking: true, at: new Date(t).toISOString(),
        })
        continue
      }
      const seq = p.plan[q.id] ?? ok
      const prev: AttemptRecord[] = []
      seq.forEach((behaviour, n) => {
        t += 60 * 1000
        const response = responseFor(qi, behaviour)
        const result = submitFor(qi, response)
        const a: AttemptRecord = {
          id: `seed-${student.id}-${q.id}-${n + 1}`, studentId: student.id, questionId: q.id, lessonId: GRADIENT_LESSON_ID,
          stage: q.stage, skillIds: q.skillIds, response, isCorrect: result.correct, marks: result.marks, maxMarks: q.maxMarks,
          attemptNumber: n + 1, hintsUsed: n === 0 ? (p.hints?.[q.id] ?? 0) : 0, errorTag: result.tag, at: new Date(t).toISOString(),
        }
        transactions.push(...rewardsForAttempt(a, prev, transactions))
        prev.push(a)
        attempts.push(a)
      })
      if (p.stopAfter === q.id) break
    }
  })
  // One response already marked and released, to demonstrate the marking workflow.
  const done = attempts.find((a) => a.studentId === 's6' && a.questionId === 'grad-reflect-1')
  if (done) {
    marks[done.id] = {
      attemptId: done.id,
      scores: { 'correct-interpretation': 2, 'language-units': 2, 'justification': 2 },
      comment: 'Excellent: you named the rate, gave units and justified why height alone is not enough.',
      released: true,
      total: 6,
    }
  }
  return { attempts, transactions, marks }
}

export const STARTER_CHARACTER: CharacterId = 'vector'
export const STARTER_ITEMS: string[] = []
export const STARTER_EQUIPPED: Equipped = {}
