import { describe, expect, it } from 'vitest'
import { normaliseUnit, parseNumber, trailingText } from '@/lib/scoring/parse'
import { evaluate } from '@/lib/scoring/evaluate'
import { CORRECT_MESSAGE, INCORRECT_MESSAGE } from '@/lib/scoring/messages'
import { ALL_LESSON_QUESTIONS, questionById } from '@/data/lessons/gradient'
import type { McqQuestion, NumericQuestion, OpenQuestion, PlotQuestion, Question } from '@/types'

const num = (id: string) => questionById(id) as NumericQuestion

describe('exact feedback messages', () => {
  it('uses the exact required wording', () => {
    expect(CORRECT_MESSAGE).toBe('Correct! Well Done!')
    expect(INCORRECT_MESSAGE).toBe("Incorrect! That's ok, give it another go!")
  })
  const autoMarked = ALL_LESSON_QUESTIONS.filter((q) => q.type !== 'EXPLAIN_REASONING')
  const sample = (q: Question, good: boolean) => {
    if (q.type === 'NUMERIC') return evaluate(q, good ? `${q.answer}${q.unit ? ` ${q.unit}` : ''}` : '987')
    if (q.type === 'MCQ') return evaluate(q, good ? q.correctId : q.options.find((o) => o.id !== q.correctId)!.id)
    if (q.type === 'PLOT_POINT') return evaluate(q, good ? q.target : { x: 4.5, y: 4.5 })
    throw new Error('not auto-marked')
  }
  it.each(autoMarked.map((q) => [q.id, q] as const))('%s shows the standard messages and nothing else', (_id, q) => {
    expect(sample(q, true)).toMatchObject({ correct: true, feedback: CORRECT_MESSAGE })
    expect(sample(q, false)).toMatchObject({ correct: false, feedback: INCORRECT_MESSAGE })
  })
  it('does not put the correct answer in any wrong-answer hint', () => {
    for (const q of autoMarked) {
      const r = sample(q, false)
      if (q.type === 'NUMERIC' && r.hint) expect(r.hint).not.toContain(String(q.answer))
    }
  })
  it('uses the incorrect message even for unparseable input', () => {
    expect(evaluate(num('grad-youdo-1'), 'hello').feedback).toBe(INCORRECT_MESSAGE)
  })
})

describe('parseNumber', () => {
  it.each([
    ['2', 2], ['-1.5', -1.5], ['1/2', 0.5], ['-3/4', -0.75], [' 0.5 ', 0.5], ['\u22122', -2], ['15 km/h', 15], ['6/3', 2], ['1,000', 1000],
  ])('parses %s', (input, expected) => {
    expect(parseNumber(input)).toBeCloseTo(expected, 9)
  })
  it('rejects non-numbers and division by zero', () => {
    expect(parseNumber('abc')).toBeNull()
    expect(parseNumber('')).toBeNull()
    expect(parseNumber('3/0')).toBeNull()
  })
  it('extracts a trailing unit', () => {
    expect(trailingText('15 km/h')).toBe('km/h')
    expect(trailingText('2')).toBe('')
  })
})

describe('unit normalisation', () => {
  it.each(['km/h', 'KM/H', 'km/hr', 'kmh', 'kph', 'kilometres per hour', 'kilometers per hour', 'kilometres/hour', 'km per hour', 'Kilometres Per Hour', 'km / h'])(
    '%s -> km/h',
    (u) => expect(normaliseUnit(u)).toBe('km/h'),
  )
  it('keeps different units different', () => {
    for (const u of ['m/s', 'km', 'miles per hour', 'km/min', 'h']) expect(normaliseUnit(u)).not.toBe('km/h')
  })
})

describe('equivalent answers with units (expected 15 km/h)', () => {
  const rate = num('grad-app-1')
  it.each([
    '15km/h', '15 km/h', '15 km/hr', '15km/hr', '15 kilometers per hour', '15 kilometres per hour', '15 kilometres/hour', '15 km per hour',
    '15 KM/H', '  15   km / h ', '15.0 km/h', '15.00km/h', '30/2 km/h', '+15 km/h', '15 Kilometres Per Hour',
  ])('accepts %s', (answer) => {
    expect(evaluate(rate, answer)).toMatchObject({ correct: true, feedback: CORRECT_MESSAGE })
  })
  it.each([
    ['15', 'unit-missing'], ['15 m/s', 'unit-wrong'], ['15 km', 'unit-wrong'], ['15 miles per hour', 'unit-wrong'], ['15 km/min', 'unit-wrong'],
    ['-15 km/h', 'other'], ['1.5 km/h', 'other'], ['16 km/h', 'other'], ['60 km/h', 'other'], ['0.0667 km/h', 'rise-run-reversed'],
  ])('rejects %s', (answer, tag) => {
    const r = evaluate(rate, answer)
    expect(r.correct).toBe(false)
    expect(r.feedback).toBe(INCORRECT_MESSAGE)
    expect(r.tag).toBe(tag)
  })
  it('does not credit a number-only answer with a wrong unit as correct', () => {
    expect(evaluate(rate, '15 hours').correct).toBe(false)
  })
})

describe('equivalent numeric answers', () => {
  const q = num('grad-youdo-1') // 0.5
  it.each(['0.5', '1/2', '2/4', '.5', '0.50', '-1/-2', '0.500'])('accepts %s', (r) => {
    expect(evaluate(q, r).correct).toBe(true)
  })
  it('accepts values within tolerance only', () => {
    expect(evaluate(q, '0.505').correct).toBe(true)
    expect(evaluate(q, '0.6').correct).toBe(false)
  })
  it('rejects the wrong sign and the reciprocal', () => {
    expect(evaluate(q, '-0.5').tag).toBe('negative-sign-ignored')
    expect(evaluate(q, '2').tag).toBe('rise-run-reversed')
  })
  it('rejects units on a plain number', () => {
    expect(evaluate(q, '0.5 km/h').correct).toBe(false)
  })
  it('handles negative answers', () => {
    const neg = num('grad-wedo-grad') // -2
    expect(evaluate(neg, '-2').correct).toBe(true)
    expect(evaluate(neg, '\u22122').correct).toBe(true)
    expect(evaluate(neg, '-6/3').correct).toBe(true)
    expect(evaluate(neg, '2').correct).toBe(false)
  })
})

describe('plot answers', () => {
  const q = ALL_LESSON_QUESTIONS.find((x) => x.id === 'grad-check-2') as PlotQuestion
  it('accepts the target point', () => expect(evaluate(q, { x: -3, y: 2 }).correct).toBe(true))
  it('detects x/y reversal', () => expect(evaluate(q, { x: 2, y: -3 }).tag).toBe('xy-reversal'))
  it('detects ignored negative signs', () => expect(evaluate(q, { x: 3, y: 2 }).tag).toBe('sign-dropped'))
  it('rejects other points', () => expect(evaluate(q, { x: 1, y: 1 }).correct).toBe(false))
})

describe('multiple choice and open response', () => {
  const mcq = questionById('grad-check-3') as McqQuestion
  it('scores the correct option', () => expect(evaluate(mcq, 'undefined').correct).toBe(true))
  it('tags the common zero-versus-undefined error', () => expect(evaluate(mcq, 'zero').tag).toBe('zero-vs-undefined'))
  it('never auto-marks open responses', () => {
    const open = questionById('grad-reflect-1') as OpenQuestion
    const r = evaluate(open, 'Gradient shows how quickly the value changes, which height alone cannot.')
    expect(r.pendingMarking).toBe(true)
    expect(r.correct).toBe(false)
    expect(r.marks).toBe(0)
  })
  it('asks for more than a few characters', () => {
    expect(evaluate(questionById('grad-reflect-1')!, 'ok').tag).toBe('too-short')
  })
})

describe('question bank metadata', () => {
  it('every question has skills, demands and a positive mark value', () => {
    for (const q of ALL_LESSON_QUESTIONS) {
      expect(q.skillIds.length).toBeGreaterThan(0)
      expect(q.demands.literacy).toBeTruthy()
      expect(q.maxMarks).toBeGreaterThan(0)
    }
  })
  it('question ids are unique', () => {
    const ids = ALL_LESSON_QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('keeps the underlying question values unchanged', () => {
    expect(num('grad-wedo-rise').answer).toBe(-6)
    expect(num('grad-wedo-run').answer).toBe(3)
    expect(num('grad-wedo-grad').answer).toBe(-2)
    expect(num('grad-youdo-1').answer).toBe(0.5)
    expect(num('grad-app-1').answer).toBe(15)
    expect(num('grad-check-1').answer).toBe(3)
    expect((questionById('grad-check-2') as PlotQuestion).target).toEqual({ x: -3, y: 2 })
  })
})
