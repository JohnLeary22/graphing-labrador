import type { CoordinateQuestion, ErrorCheck, EvaluationResult, MatchQuestion, NumericQuestion, McqQuestion, PlotQuestion, Point, Question } from '@/types'
import { approxEqual, normaliseUnit, parseNumber, trailingText } from './parse'
import { CORRECT_MESSAGE, INCORRECT_MESSAGE } from './messages'

type Response = string | Point

const right = (marks: number): EvaluationResult => ({ correct: true, marks, feedback: CORRECT_MESSAGE })
const wrong = (tag: string, hint?: string, marks = 0): EvaluationResult => ({ correct: false, marks, feedback: INCORRECT_MESSAGE, tag, hint })

function matchNumeric(kind: ErrorCheck['kind'], value: number, answer: number, tol: number): boolean {
  if (answer === 0) return false
  switch (kind) {
    case 'reciprocal':
      return approxEqual(value, 1 / answer, tol)
    case 'negated':
      return approxEqual(value, -answer, tol)
    default:
      return false
  }
}

export function evaluateNumeric(q: NumericQuestion, raw: string): EvaluationResult {
  const value = parseNumber(raw)
  if (value === null) return wrong('invalid-input', 'Enter a number, for example 2, -1.5 or 3/4.')
  const tol = q.tolerance ?? 0.01
  const unitText = trailingText(raw)
  if (approxEqual(value, q.answer, tol)) {
    if (q.unit) {
      if (unitText === '') return wrong('unit-missing', 'Your number may be right. A rate needs units that match the axes.', Math.max(0, q.maxMarks - 1))
      if (normaliseUnit(unitText) !== normaliseUnit(q.unit)) return wrong('unit-wrong', 'Check the units: they should match the quantities on the two axes.', Math.max(0, q.maxMarks - 1))
    } else if (unitText !== '') {
      return wrong('unit-wrong', 'This answer is a plain number, so no units are needed.')
    }
    return right(q.maxMarks)
  }
  for (const check of q.errorChecks ?? []) {
    if (matchNumeric(check.kind, value, q.answer, tol)) return wrong(check.tag, check.feedback)
  }
  return wrong('other', 'Check each value you read from the graph, then try again.')
}

export function evaluateMcq(q: McqQuestion, optionId: string): EvaluationResult {
  const option = q.options.find((o) => o.id === optionId)
  if (!option) return wrong('invalid-input', 'Choose one of the options.')
  if (option.id === q.correctId) return right(q.maxMarks)
  return wrong(option.tag ?? 'other', option.feedback)
}

/** Reads "(-3, 2)", "-3,2" or "-3 2". Returns null if two numbers cannot be found. */
export function parsePoint(raw: string): Point | null {
  const m = raw.trim().replace(/\u2212/g, '-').match(/^\(?\s*([-+]?\d*\.?\d+)\s*(?:,|;|\s)\s*([-+]?\d*\.?\d+)\s*\)?$/)
  return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : null
}

function checkPoint(q: { target: Point; maxMarks: number; errorChecks?: ErrorCheck[] }, p: Point, tolerance = 0.01): EvaluationResult {
  const { target } = q
  if (approxEqual(p.x, target.x, tolerance) && approxEqual(p.y, target.y, tolerance)) return right(q.maxMarks)
  for (const check of q.errorChecks ?? []) {
    const hit =
      (check.kind === 'swapXY' && approxEqual(p.x, target.y, tolerance) && approxEqual(p.y, target.x, tolerance)) ||
      (check.kind === 'signDropped' &&
        approxEqual(Math.abs(p.x), Math.abs(target.x), tolerance) &&
        approxEqual(Math.abs(p.y), Math.abs(target.y), tolerance))
    if (hit) return wrong(check.tag, check.feedback)
  }
  return wrong('other', 'Start at the origin, move along the x-axis first, then up or down for y.')
}

export function evaluatePlot(q: PlotQuestion, p: Point, tolerance = 0.01): EvaluationResult {
  return checkPoint(q, p, tolerance)
}

export function evaluateReadPoint(q: CoordinateQuestion, raw: string): EvaluationResult {
  const p = parsePoint(raw)
  if (!p) return wrong('invalid-input', 'Write the point as an ordered pair, for example (2, -3).')
  return checkPoint(q, p)
}

/** Response is JSON of itemId -> optionId. Every item must be matched correctly. */
export function evaluateMatch(q: MatchQuestion, raw: string): EvaluationResult {
  let given: Record<string, string> = {}
  try {
    given = JSON.parse(raw) as Record<string, string>
  } catch {
    return wrong('invalid-input', 'Choose an option for every item.')
  }
  if (q.items.some((i) => !given[i.id])) return wrong('invalid-input', 'Choose an option for every item.')
  const right_ = q.items.filter((i) => given[i.id] === q.answers[i.id]).length
  if (right_ === q.items.length) return right(q.maxMarks)
  return wrong('other', `${right_} of ${q.items.length} are matched correctly. Check the ones you are less sure about.`)
}

/** Open responses are recorded for teacher marking; they are never auto-marked. */
export function evaluateOpen(text: string): EvaluationResult {
  if (text.trim().length < 15) {
    return { correct: false, marks: 0, feedback: 'Write at least one full sentence so your teacher can see your thinking.', tag: 'too-short' }
  }
  return {
    correct: false,
    marks: 0,
    pendingMarking: true,
    feedback: 'Response saved. Your teacher will mark it and give feedback.',
  }
}

export function evaluate(q: Question, response: Response): EvaluationResult {
  switch (q.type) {
    case 'NUMERIC':
      return evaluateNumeric(q, String(response))
    case 'MCQ':
      return evaluateMcq(q, String(response))
    case 'PLOT_POINT':
      return evaluatePlot(q, response as Point)
    case 'READ_POINT':
      return evaluateReadPoint(q, String(response))
    case 'MATCH':
      return evaluateMatch(q, String(response))
    case 'EXPLAIN_REASONING':
      return evaluateOpen(String(response))
  }
}
