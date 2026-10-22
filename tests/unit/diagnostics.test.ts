import { describe, expect, it } from 'vitest'
import { diagnosticSummary, misconceptionEvidence, summariseSkill } from '@/lib/analytics/diagnostics'
import type { AttemptRecord } from '@/types'

let n = 0
const att = (over: Partial<AttemptRecord>): AttemptRecord => ({
  id: `a${++n}`, studentId: 's1', questionId: 'q1', lessonId: 'l', stage: 'YOU_DO', skillIds: ['gradient-calc'], response: '', isCorrect: false,
  marks: 0, maxMarks: 1, attemptNumber: 1, hintsUsed: 0, at: '2026-01-01T00:00:00.000Z', ...over,
})

describe('skill summaries', () => {
  it('has no evidence without independent attempts', () => {
    expect(summariseSkill('gradient-calc', []).level).toBe('no-evidence')
  })
  it('does not treat scaffolded success as independent mastery', () => {
    const s = summariseSkill('gradient-calc', [att({ stage: 'WE_DO', isCorrect: true, questionId: 'a' }), att({ stage: 'WE_DO', isCorrect: true, questionId: 'b' })])
    expect(s.independentQuestions).toBe(0)
    expect(s.level).toBe('emerging')
    expect(s.scaffoldedAccuracy).toBe(1)
  })
  it('does not count correct answers that used hints as independent', () => {
    const s = summariseSkill('gradient-calc', [att({ isCorrect: true, hintsUsed: 1 })])
    expect(s.independentQuestions).toBe(0)
  })
  it('uses the latest attempt per question so improvement counts', () => {
    const s = summariseSkill('gradient-calc', [
      att({ questionId: 'a', attemptNumber: 1, isCorrect: false }),
      att({ questionId: 'a', attemptNumber: 2, isCorrect: true }),
      att({ questionId: 'b', isCorrect: true }),
    ])
    expect(s.independentAccuracy).toBe(1)
    expect(s.level).toBe('secure')
  })
  it('marks conclusions with fewer than 3 independent items as provisional', () => {
    expect(summariseSkill('gradient-calc', [att({ isCorrect: true })]).provisional).toBe(true)
  })
  it('ignores invalid-input attempts', () => {
    expect(summariseSkill('gradient-calc', [att({ errorTag: 'invalid-input' })]).attempts).toBe(0)
  })
  it('excludes pending open responses from accuracy', () => {
    const s = summariseSkill('gradient-calc', [att({ pendingMarking: true })])
    expect(s.accuracy).toBeNull()
  })
})

describe('misconception evidence', () => {
  it('one reversal is only "possible"', () => {
    const e = misconceptionEvidence([att({ errorTag: 'rise-run-reversed', questionId: 'a' })])
    expect(e[0].status).toBe('possible')
  })
  it('the same error on two different questions is "likely"', () => {
    const e = misconceptionEvidence([att({ errorTag: 'rise-run-reversed', questionId: 'a' }), att({ errorTag: 'rise-run-reversed', questionId: 'b' })])
    expect(e[0].status).toBe('likely')
    expect(e[0].questionIds).toEqual(['a', 'b'])
  })
  it('repeating the same wrong answer on one question stays "possible"', () => {
    const e = misconceptionEvidence([att({ errorTag: 'rise-run-reversed' }), att({ errorTag: 'rise-run-reversed', attemptNumber: 2 })])
    expect(e[0].status).toBe('possible')
    expect(e[0].attemptIds).toHaveLength(2)
  })
  it('links each evidence item back to attempt ids', () => {
    const a = att({ errorTag: 'rise-run-reversed' })
    expect(misconceptionEvidence([a])[0].attemptIds).toEqual([a.id])
  })
  it('ignores untagged and unknown tags', () => {
    expect(misconceptionEvidence([att({}), att({ errorTag: 'other' })])).toEqual([])
  })
})

describe('diagnostic summary', () => {
  it('produces the explainable rise/run summary only with likely evidence', () => {
    const attempts = [
      att({ errorTag: 'rise-run-reversed', questionId: 'a' }),
      att({ errorTag: 'rise-run-reversed', questionId: 'b' }),
    ]
    const text = diagnosticSummary('Sam', summariseSkill('gradient-calc', attempts), misconceptionEvidence(attempts))
    expect(text).toMatch(/rise over run/)
    expect(text).toMatch(/Provisional/)
  })
  it('does not diagnose from a single error', () => {
    const attempts = [att({ errorTag: 'rise-run-reversed' })]
    const text = diagnosticSummary('Sam', summariseSkill('gradient-calc', attempts), misconceptionEvidence(attempts))
    expect(text).toMatch(/not enough to confirm/)
  })
})
