import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { GradientLessonPage } from '@/pages/student/GradientLessonPage'
import { resetDemo, getState } from '@/services/persistence/store'
import { setStudentName, signIn, submitAttempt, coinsFor } from '@/services/persistence/actions'
import { ALL_LESSON_QUESTIONS, GRADIENT_LESSON, questionById } from '@/data/lessons/gradient'
import { recentActivity } from '@/lib/analytics/activity'
import { errorCategoryCounts } from '@/lib/analytics/errors'
import { balanceOf } from '@/lib/rewards/economy'
import { CORRECT_MESSAGE, INCORRECT_MESSAGE } from '@/lib/scoring/messages'
import { DEMO_STUDENT_ID } from '@/data/demo/seed'
import type { AttemptRecord, Student } from '@/types'

const S = DEMO_STUDENT_ID

function openLesson() {
  resetDemo()
  signIn('student')
  setStudentName(S, 'Alex')
  return render(<MemoryRouter><GradientLessonPage /></MemoryRouter>)
}

describe('lesson feedback never advances by itself', () => {
  beforeEach(() => localStorage.clear())

  it('keeps a correct answer on screen with the exact message, separate rewards and a Next Question button', () => {
    openLesson()
    expect(screen.getByRole('heading', { level: 2, name: 'Move the point' })).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('It gets steeper'))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    expect(screen.getByRole('status')).toHaveTextContent(CORRECT_MESSAGE)
    expect(screen.getByText('+10 coins')).toBeInTheDocument()
    expect(screen.getByText('+5 XP')).toBeInTheDocument()
    // Still the same step: nothing moved on without a click.
    expect(screen.getByRole('heading', { level: 2, name: 'Move the point' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next Question' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next Question' }))
    expect(screen.getByRole('heading', { level: 2, name: /I do/ })).toBeInTheDocument()
  })

  it('keeps the question open after a wrong answer, with the exact message, no answer and no automatic hint', () => {
    openLesson()
    fireEvent.click(screen.getByLabelText('It gets flatter'))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    expect(screen.getByRole('status')).toHaveTextContent(INCORRECT_MESSAGE)
    expect(screen.getByText('+3 coins')).toBeInTheDocument()
    expect(screen.getByText('+1 XP')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next Question' })).toBeNull()
    expect(screen.queryByText(/^Hint \d/)).toBeNull()
    expect(screen.getByRole('button', { name: 'Check again' })).toBeEnabled()
    expect(screen.getByRole('heading', { level: 2, name: 'Move the point' })).toBeInTheDocument()
  })

  it('does not skip ahead when the answer arrives from outside the page (saved position is fixed on arrival)', () => {
    openLesson()
    // A first-time lesson with no saved position: record the attempt directly, as a store update would.
    submitAttempt(S, 'gradient', questionById('grad-hook-1')!, 'steeper', 0)
    expect(screen.getByRole('heading', { level: 2, name: 'Move the point' })).toBeInTheDocument()
  })

  it('lays out the graph above the question, in one column', () => {
    const { container } = openLesson()
    const column = container.querySelector('main, div')!.querySelector('.max-w-3xl')!
    expect(column.className).toContain('flex-col')
    const figure = column.querySelector('figure')!
    const question = column.querySelector('section[aria-labelledby^="q-"]')!
    expect(figure.compareDocumentPosition(question) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('still has the original 11 questions and the same lesson stages', () => {
    expect(ALL_LESSON_QUESTIONS).toHaveLength(11)
    expect(GRADIENT_LESSON.steps.map((s) => s.id)).toEqual(['hook', 'i-do', 'we-do', 'you-do', 'non-example', 'application', 'checkpoint', 'reflection'])
  })
})

describe('reward scenarios and refresh safety through the app', () => {
  beforeEach(() => resetDemo())
  const q = questionById('grad-youdo-1')!
  const xp = () => balanceOf(getState().transactions, S, 'XP')
  it.each([
    ['correct first time', ['0.5'], 10, 5],
    ['wrong first, then wrong', ['2', '99'], 3, 1],
    ['wrong then correct', ['2', '0.5'], 8, 3],
    ['wrong, wrong, wrong, correct', ['2', '9', '9', '0.5'], 8, 3],
    ['correct then repeated', ['0.5', '0.5', '2', '0.5'], 10, 5],
  ])('%s', (_name, answers, coins, xpGain) => {
    const before = coinsFor(getState(), S)
    for (const a of answers) submitAttempt(S, 'gradient', q, a, 0)
    expect(coinsFor(getState(), S) - before).toBe(coins)
    expect(xp()).toBe(xpGain)
  })
  it('a reload of saved data does not pay again', () => {
    submitAttempt(S, 'gradient', q, '0.5', 0)
    const after = coinsFor(getState(), S)
    for (let i = 0; i < 3; i++) submitAttempt(S, 'gradient', q, '0.5', 0)
    expect(coinsFor(getState(), S)).toBe(after)
  })
})

const stu = (id: string, name: string): Student => ({ id, name, displayName: name, classId: 'c' })
let n = 0
const att = (studentId: string, questionId: string, over: Partial<AttemptRecord> = {}): AttemptRecord => {
  const q = questionById(questionId)!
  return {
    id: `x${++n}`, studentId, questionId, lessonId: 'gradient', stage: q.stage, skillIds: q.skillIds, response: '', isCorrect: true, marks: 1, maxMarks: q.maxMarks,
    attemptNumber: 1, hintsUsed: 0, at: new Date(2026, 0, 1, 9, n).toISOString(), ...over,
  }
}

describe('recent activity (teacher dashboard)', () => {
  const students = [stu('a', 'Tomas'), stu('b', 'Alex')]
  it('reports a stage as completed only when every question in it is done', () => {
    const weDo = ALL_LESSON_QUESTIONS.filter((q) => q.stage === 'WE_DO')
    const all = weDo.map((q) => att('a', q.id))
    const ev = recentActivity(all, students, {})
    expect(ev).toHaveLength(1)
    expect(ev[0]).toMatchObject({ studentName: 'Tomas', stageLabel: 'We do', verb: 'completed' })
  })
  it('reports partial work as attempted, not completed', () => {
    const ev = recentActivity([att('b', 'grad-wedo-rise')], students, {})
    expect(ev[0]).toMatchObject({ studentName: 'Alex', stageLabel: 'We do', verb: 'attempted' })
  })
  it('does not count wrong answers as completion', () => {
    const ev = recentActivity([att('b', 'grad-hook-1', { isCorrect: false, marks: 0 })], students, {})
    expect(ev[0].verb).toBe('attempted')
  })
  it('reports a written reflection as submitted, with its marking status', () => {
    const a = att('a', 'grad-reflect-1', { isCorrect: false, marks: 0, pendingMarking: true })
    expect(recentActivity([a], students, {})[0]).toMatchObject({ verb: 'submitted', stageLabel: 'Reflection', status: 'to mark' })
    const marked = recentActivity([a], students, { [a.id]: { attemptId: a.id, scores: {}, comment: '', released: true, total: 6 } })
    expect(marked[0].status).toBe('marked')
  })
  it('puts the newest activity first, never shows question text, and invents nothing', () => {
    const early = att('a', 'grad-hook-1')
    const late = att('b', 'grad-youdo-1')
    const ev = recentActivity([early, late], students, {})
    expect(ev.map((e) => e.studentName)).toEqual(['Alex', 'Tomas'])
    expect(JSON.stringify(ev)).not.toMatch(/gradient of the line|What happens/i)
    expect(recentActivity([], students, {})).toEqual([])
  })
})

describe('common errors (teacher dashboard)', () => {
  it('lists at least eight graphing categories with true zeros for those not recorded', () => {
    const rows = errorCategoryCounts([])
    expect(rows.length).toBeGreaterThanOrEqual(8)
    expect(rows.every((r) => r.count === 0)).toBe(true)
    expect(rows.map((r) => r.name)).toEqual(expect.arrayContaining(['Misreading graph scales', 'Confusing intercept and gradient', 'Confusing height with rate']))
  })
  it('counts only recorded errors, using the existing tags', () => {
    const rows = errorCategoryCounts([
      att('a', 'grad-youdo-1', { errorTag: 'rise-run-reversed', isCorrect: false }),
      att('a', 'grad-youdo-1', { errorTag: 'rise-run-reversed', isCorrect: false }),
      att('b', 'grad-app-1', { errorTag: 'unit-wrong', isCorrect: false }),
      att('b', 'grad-app-1', { errorTag: 'other', isCorrect: false }),
    ])
    const by = Object.fromEntries(rows.map((r) => [r.id, r.count]))
    expect(by['rise-run-reversed']).toBe(2)
    expect(by['units-missing']).toBe(1)
    expect(by['scale-misread']).toBe(0)
  })
})

function walk(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(tsx?|css)$/.test(f)) out.push(p)
  }
  return out
}

describe('website text hygiene', () => {
  const files = walk(join(process.cwd(), 'src')).map((p) => ({ p, text: readFileSync(p, 'utf8') }))
  it('has no developer references in the interface source', () => {
    for (const { p, text } of files) {
      if (!p.includes('/pages/') && !p.includes('/components/')) continue
      expect(text, p).not.toMatch(/PROGRESS\.md|README\.md|supabase\/|src\/|checklist\b(?! before)/i)
    }
  })
  it('keeps the intentional disclaimer spelling and exactly six other hand-placed slips', () => {
    const all = files.map((f) => f.text).join('\n')
    expect(all).toContain('fitcional')
    const slips = ['seperate', 'automaticaly', 'dashbord', 'sucesses', 'comparisions', 'absense']
    for (const s of slips) expect(all.split(s).length - 1, s).toBe(1)
  })
  it('never places a slip in feedback, rubric, maths or assessment text', () => {
    const protectedText = [
      readFileSync(join(process.cwd(), 'src/data/lessons/gradient.ts'), 'utf8'),
      readFileSync(join(process.cwd(), 'src/lib/scoring/messages.ts'), 'utf8'),
      readFileSync(join(process.cwd(), 'src/components/assessments/RubricView.tsx'), 'utf8'),
    ].join('\n')
    for (const s of ['seperate', 'automaticaly', 'dashbord', 'sucesses', 'comparisions', 'absense']) expect(protectedText).not.toContain(s)
  })
})
